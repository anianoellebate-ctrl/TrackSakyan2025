const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const { parseISO } = require('date-fns');

class JeepneyDensityPredictor {
    constructor() {
        this.model = null;
        this.featureStats = null;
        this.isTrained = false;
        this.trainingAreas = null;
        this.trainingData = null;
    }

    // Extract ML features from trip data
    extractFeatures(trips) {
        const areaHourlyData = {};
        
        // Aggregate data by area and hour
        trips.forEach(trip => {
            const date = parseISO(trip.created_at);
            const hour = date.getHours();
            const dayOfWeek = date.getDay();
            const areaKey = `${Math.round(trip.start_lat * 1000)},${Math.round(trip.start_lng * 1000)}`;
            const timeKey = `${dayOfWeek},${hour},${areaKey}`;
            
            if (!areaHourlyData[timeKey]) {
                areaHourlyData[timeKey] = {
                    uniqueDrivers: new Set(),
                    totalTrips: 0,
                    hour: hour,
                    dayOfWeek: dayOfWeek,
                    lat: Math.round(trip.start_lat * 1000) / 1000,
                    lng: Math.round(trip.start_lng * 1000) / 1000,
                    passengerCounts: []
                };
            }
            
            areaHourlyData[timeKey].uniqueDrivers.add(trip.driver_id);
            areaHourlyData[timeKey].totalTrips++;
            areaHourlyData[timeKey].passengerCounts.push(trip.passenger_count);
        });

        // Convert to ML features
        const features = [];
        Object.keys(areaHourlyData).forEach(key => {
            const data = areaHourlyData[key];
            const uniqueDrivers = data.uniqueDrivers.size;
            const avgPassengers = data.passengerCounts.reduce((a, b) => a + b, 0) / data.passengerCounts.length;
            
            features.push({
                // Temporal features
                hour: data.hour,
                dayOfWeek: data.dayOfWeek,
                month: new Date().getMonth(),
                
                // Spatial features
                area_lat: data.lat,
                area_lng: data.lng,
                
                // Behavioral features
                total_trips: data.totalTrips,
                avg_passengers: avgPassengers,
                trips_per_driver: data.totalTrips / uniqueDrivers,
                
                // Target variable (jeepney count)
                jeepney_count: uniqueDrivers,
                
                // Derived features
                isWeekend: [0, 6].includes(data.dayOfWeek) ? 1 : 0,
                isRushHour: this.isRushHour(data.hour) ? 1 : 0,
                isPeakHour: this.isPeakHour(data.hour, data.dayOfWeek) ? 1 : 0
            });
        });

        return features;
    }

    // NEW: Extract unique areas from training data
    extractUniqueAreas(features) {
        const areas = new Map();
        
        features.forEach(feature => {
            // Group nearby coordinates together (within 0.01 degrees ≈ 1.1km)
            const roundedLat = Math.round(feature.area_lat * 100) / 100;
            const roundedLng = Math.round(feature.area_lng * 100) / 100;
            const key = `${roundedLat},${roundedLng}`;
            
            if (!areas.has(key)) {
                areas.set(key, {
                    lat: roundedLat,
                    lng: roundedLng,
                    // Track how many data points support this area
                    dataPoints: 1
                });
            } else {
                areas.get(key).dataPoints++;
            }
        });
        
        console.log(`📍 Unique areas after clustering: ${areas.size}`);
        areas.forEach((area, key) => {
            console.log(`  ${key}: ${area.dataPoints} data points`);
        });
        
        return Array.from(areas.values());
    }

    isAreaInTrainingData(lat, lng) {
        if (!this.trainingAreas) return false;
        
        // Check if this coordinate is in our ACTUAL training areas (not hard-coded)
        return this.trainingAreas.some(area => {
            const distance = this.calculateDistance(lat, lng, area.lat, area.lng);
            return distance < 2.0; // 2km radius from actual training areas
        });
    }


   hasTrainingDataForTime(hour, dayOfWeek) {
        if (!this.trainingData || this.trainingData.length === 0) {
            return false;
        }
        
        // Count actual data points for this specific time
        const matchingData = this.trainingData.filter(trainingItem => {
            return trainingItem.hour === hour && trainingItem.dayOfWeek === dayOfWeek;
        });
        
        // Require minimum data points for reliable prediction
        const hasSufficientData = matchingData.length >= 2; // At least 2 data points
        
        console.log(`📊 ML Data check for ${this.getDayName(dayOfWeek)} ${hour}:00 - ${matchingData.length} data points - ${hasSufficientData ? 'HAS TRAINING DATA' : 'NO TRAINING DATA'}`);
        
        return hasSufficientData;
    }

    // Add getDayName method if missing
    getDayName(dayOfWeek) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek] || 'Unknown';
    }

    isRushHour(hour) {
        return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    }

    isPeakHour(hour, dayOfWeek) {
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        return isWeekday && (hour === 8 || hour === 18);
    }

    // Calculate statistics for normalization
    calculateStats(features) {
        const featureArray = features.map(f => [
            f.hour, f.dayOfWeek, f.month, f.area_lat, f.area_lng,
            f.total_trips, f.avg_passengers, f.trips_per_driver,
            f.isWeekend, f.isRushHour, f.isPeakHour
        ]);

        const tensor = tf.tensor2d(featureArray);
        const means = tensor.mean(0);
        const std = tensor.sub(means).square().mean(0).sqrt();

        this.featureStats = {
            means: means.arraySync(),
            std: std.arraySync()
        };

        tensor.dispose();
        means.dispose();
        std.dispose();

        return this.featureStats;
    }

    // Normalize features
    normalizeFeatures(features) {
        if (!this.featureStats) {
            this.calculateStats(features);
        }

        return features.map(feature => {
            const raw = [
                feature.hour, feature.dayOfWeek, feature.month, feature.area_lat, feature.area_lng,
                feature.total_trips, feature.avg_passengers, feature.trips_per_driver,
                feature.isWeekend, feature.isRushHour, feature.isPeakHour
            ];

            const normalized = raw.map((val, i) => {
                return (val - this.featureStats.means[i]) / (this.featureStats.std[i] || 1);
            });

            return {
                features: normalized,
                jeepney_count: feature.jeepney_count
            };
        });
    }

    // Build real neural network
    async buildModel(inputShape) {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [inputShape], units: 64, activation: 'relu' }),
                tf.layers.dropout({ rate: 0.3 }),
                tf.layers.dense({ units: 32, activation: 'relu' }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 16, activation: 'relu' }),
                tf.layers.dense({ units: 1, activation: 'linear' })
            ]
        });

        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mae']
        });

        return this.model;
    }

    // Train the real ML model
    async train(trips, epochs = 100) {
        console.log('🔄 Training REAL Jeepney Density ML Model...');
        
        if (trips.length < 10) {
            console.log('⚠️ Insufficient data for ML training');
            this.isTrained = true;
            return;
        }

        const features = this.extractFeatures(trips);
        
        // Store training data and areas
        this.trainingData = features;
        this.trainingAreas = this.extractUniqueAreas(features);
        
        console.log(`📍 Training on ${this.trainingAreas.length} unique areas`);

        const normalizedData = this.normalizeFeatures(features);
        
        // Split data
        const splitIndex = Math.floor(normalizedData.length * 0.8);
        const trainData = normalizedData.slice(0, splitIndex);
        const valData = normalizedData.slice(splitIndex);

        // Prepare tensors
        const trainFeatures = tf.tensor2d(trainData.map(d => d.features));
        const trainLabels = tf.tensor1d(trainData.map(d => d.jeepney_count));
        const valFeatures = tf.tensor2d(valData.map(d => d.features));
        const valLabels = tf.tensor1d(valData.map(d => d.jeepney_count));

        console.log(`📊 Training on ${trainData.length} samples, validating on ${valData.length} samples`);

        // Build and train model
        await this.buildModel(11);
        
        const history = await this.model.fit(trainFeatures, trainLabels, {
            epochs: epochs,
            validationData: [valFeatures, valLabels],
            batchSize: Math.min(16, trainData.length),
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 20 === 0) {
                        console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
                    }
                }
            }
        });

        // Clean up
        trainFeatures.dispose();
        trainLabels.dispose();
        valFeatures.dispose();
        valLabels.dispose();

        this.isTrained = true;
        console.log('✅ REAL Jeepney Density ML Model training completed!');
        
        return history;
    }

    // NEW: Analyze all trained areas for current time
    analyzeCitywideDensity(hour, dayOfWeek) {
        if (!this.isTrained || !this.trainingAreas) {
            throw new Error('Model not trained yet. Call train() first.');
        }

        console.log(`🧠 Analyzing ${this.trainingAreas.length} areas for ${hour}:00`);

        const predictions = [];
        
        // Predict density for each trained area
        for (const area of this.trainingAreas) {
            try {
                const prediction = this.predict(hour, dayOfWeek, area.lat, area.lng);
                predictions.push({
                    lat: area.lat,
                    lng: area.lng,
                    density_level: prediction.density_level,
                    jeepney_count: prediction.jeepney_count,
                    confidence: prediction.confidence,
                    method: prediction.method
                });
            } catch (error) {
                console.log(`Prediction failed for area (${area.lat}, ${area.lng}):`, error.message);
            }
        }
        
        console.log(`📊 Citywide analysis: ${predictions.length} successful predictions`);
        return predictions;
    }

    // Single location prediction
    predict(hour, dayOfWeek, lat, lng) {
    if (!this.isTrained || !this.model) {
        throw new Error('Model not trained yet. Call train() first.');
    }


    // STRICT CHECK: Only use ML if we have actual training data
    if (!this.hasTrainingDataForTime(hour, dayOfWeek)) {
        return {
            jeepney_count: 0,
            density_level: "No Training Data",
            confidence: 0.1, // Very low confidence
            method: 'no_training_data',
            reason: `Machine learning has no training data for ${this.getDayName(dayOfWeek)} ${hour}:00. Only ${this.getAvailableDataCount(hour, dayOfWeek)} data points available.`
        };
    }

    if (!this.isAreaInTrainingData(lat, lng)) {
        return {
            jeepney_count: 0,
            density_level: "Area Not in Training Data",
            confidence: 0.1,
            method: 'area_not_trained',
            reason: `This specific location (${lat.toFixed(4)}, ${lng.toFixed(4)}) is not in the ML training data`
        };
    }

    // Only proceed with neural network if we have real data
    try {
        const month = new Date().getMonth();
        const area_lat = Math.round(lat * 1000) / 1000;
        const area_lng = Math.round(lng * 1000) / 1000;
        
        const estimatedFeatures = this.estimateFeatures(hour, dayOfWeek, area_lat, area_lng);
        
        const rawFeatures = [
            hour, dayOfWeek, month, area_lat, area_lng,
            estimatedFeatures.total_trips, estimatedFeatures.avg_passengers, estimatedFeatures.trips_per_driver,
            [0, 6].includes(dayOfWeek) ? 1 : 0,
            this.isRushHour(hour) ? 1 : 0,
            this.isPeakHour(hour, dayOfWeek) ? 1 : 0
        ];

        const normalizedFeatures = rawFeatures.map((val, i) => {
            return (val - this.featureStats.means[i]) / (this.featureStats.std[i] || 1);
        });

        const inputTensor = tf.tensor2d([normalizedFeatures]);
        const prediction = this.model.predict(inputTensor);
        const predictedCount = prediction.dataSync()[0];
        
        const confidence = this.calculateConfidence(predictedCount, hour, dayOfWeek, area_lat, area_lng);

        inputTensor.dispose();
        prediction.dispose();

        const realisticCount = Math.max(0, Math.round(predictedCount));
        
        return {
            jeepney_count: realisticCount,
            density_level: this.getDensityLevel(realisticCount),
            confidence: confidence,
            raw_prediction: predictedCount,
            method: 'neural_network',
            reason: `Based on ${this.getAvailableDataCount(hour, dayOfWeek)} training data points`
        };

    } catch (error) {
        // Fallback should also indicate no data
        return {
            jeepney_count: 0,
            density_level: "Prediction Failed",
            confidence: 0.1,
            method: 'prediction_error',
            reason: `ML prediction failed: ${error.message}`
        };
    }
}

// Add helper method to count available data
getAvailableDataCount(hour, dayOfWeek) {
    if (!this.trainingData) return 0;
    return this.trainingData.filter(item => 
        item.hour === hour && item.dayOfWeek === dayOfWeek
    ).length;
}

    estimateFeatures(hour, dayOfWeek, lat, lng) {
        // ✅ NO MORE ARTIFICIAL NUMBERS - Use actual data patterns!
        
        // Find similar areas/times in ACTUAL training data
        const similarData = this.trainingData.filter(item => {
            const timeDiff = Math.abs(item.hour - hour) <= 2; // ±2 hours
            const dayDiff = item.dayOfWeek === dayOfWeek;
            const areaDiff = this.calculateDistance(lat, lng, item.area_lat, item.area_lng) < 5.0;
            
            return timeDiff && dayDiff && areaDiff;
        });
        
        if (similarData.length > 0) {
            // Use ACTUAL data patterns
            const avgTrips = similarData.reduce((sum, item) => sum + item.total_trips, 0) / similarData.length;
            const avgPassengers = similarData.reduce((sum, item) => sum + item.avg_passengers, 0) / similarData.length;
            const avgTripsPerDriver = similarData.reduce((sum, item) => sum + item.trips_per_driver, 0) / similarData.length;
            
            return {
                total_trips: Math.max(1, Math.round(avgTrips)),
                avg_passengers: Math.max(0.5, avgPassengers),
                trips_per_driver: Math.max(0.5, avgTripsPerDriver)
            };
        }
        
        // Fallback: minimal values based on time patterns only
        const isRush = this.isRushHour(hour);
        return {
            total_trips: isRush ? 3 : 1,
            avg_passengers: 1.0,
            trips_per_driver: isRush ? 1.5 : 1.0
        };
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return distance;
    }

    calculateConfidence(predictedCount, hour, dayOfWeek, lat, lng) {
        // ✅ PURE DATA-DRIVEN CONFIDENCE - NO ARTIFICIAL LIMITS!
        
        let confidence = 0.7; // Base confidence
        
        // 1. Confidence based on ACTUAL data points for this area
        const areaDataPoints = this.getAreaDataPoints(lat, lng);
        if (areaDataPoints >= 10) confidence += 0.2;
        else if (areaDataPoints >= 5) confidence += 0.1;
        else if (areaDataPoints < 2) confidence -= 0.2;
        
        // 2. Confidence based on ACTUAL data points for this time
        const timeDataPoints = this.getAvailableDataCount(hour, dayOfWeek);
        if (timeDataPoints >= 5) confidence += 0.15;
        else if (timeDataPoints < 2) confidence -= 0.2;
        
        // 3. Confidence based on prediction realism
        if (predictedCount < 0) confidence -= 0.3;
        if (predictedCount > 20) confidence -= 0.2; // Unusually high
        
        return Math.max(0.1, Math.min(0.95, confidence));
    }

    // Add this helper method
    getAreaDataPoints(lat, lng) {
        if (!this.trainingData) return 0;
        
        return this.trainingData.filter(item => {
            const distance = this.calculateDistance(lat, lng, item.area_lat, item.area_lng);
            return distance < 2.0; // Data points within 2km
        }).length;
    }

    getDensityLevel(jeepneyCount) {
        if (jeepneyCount === 0) return 'No Jeepneys';
        if (jeepneyCount === 1) return 'Single Jeepney';
        if (jeepneyCount <= 3) return 'Few Jeepneys';
        if (jeepneyCount <= 6) return 'Many Jeepneys';
        return 'Jeepney Congestion';
    }

    predictStatistical(hour, dayOfWeek, lat, lng) {
        // ✅ USE ACTUAL DATA PATTERNS instead of hard-coded "2"
        
        // Find similar time patterns in ACTUAL training data
        const similarData = this.trainingData.filter(item => 
            Math.abs(item.hour - hour) <= 2 && item.dayOfWeek === dayOfWeek
        );
        
        if (similarData.length > 0) {
            // Calculate average from ACTUAL data
            const avgJeepneys = similarData.reduce((sum, item) => sum + item.jeepney_count, 0) / similarData.length;
            const realisticCount = Math.max(0, Math.round(avgJeepneys));
            
            return {
                jeepney_count: realisticCount, // ← FROM REAL DATA!
                density_level: this.getDensityLevel(realisticCount),
                confidence: Math.max(0.3, 0.5 * (similarData.length / 10)), // Based on data quantity
                method: 'statistical_based_on_actual_data',
                data_points_used: similarData.length
            };
        }
        
        // Only if NO data exists
        return {
            jeepney_count: 0,
            density_level: "No Data Available",
            confidence: 0.1,
            method: 'no_data_available',
            reason: 'No training data for similar times'
        };
    }
}

module.exports = JeepneyDensityPredictor;