// const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-backend-cpu');
// const { parseISO } = require('date-fns');

// class PassengerDemandPredictor {
//     constructor() {
//         this.demandModel = null;
//         this.featureStats = null;
//         this.isTrained = false;
//         this.trainingAreas = null;
//         this.trainingData = null;
//         this.dataDistribution = null;
//     }

//     // Extract features from ACTUAL database data
//     extractDemandFeatures(trips) {
//         const areaHourlyDemand = {};
        
//         // Analyze ALL trip data from database
//         trips.forEach(trip => {
//            const utcDate = parseISO(trip.created_at);
//            const phTime = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
//            const hour = phTime.getHours();
//            const dayOfWeek = phTime.getDay();
        
//            const areaKey = `${Math.round(trip.start_lat * 1000)},${Math.round(trip.start_lng * 1000)}`;
//            const timeKey = `${dayOfWeek},${hour},${areaKey}`;
            
//             if (!areaHourlyDemand[timeKey]) {
//                 areaHourlyDemand[timeKey] = {
//                     totalPassengers: 0,
//                     tripCount: 0,
//                     hour: hour,
//                     dayOfWeek: dayOfWeek,
//                     lat: Math.round(trip.start_lat * 1000) / 1000,
//                     lng: Math.round(trip.start_lng * 1000) / 1000,
//                     passengerCounts: [],
//                     fareTotal: 0,
//                     distanceTotal: 0
//                 };
//             }
            
//             areaHourlyDemand[timeKey].totalPassengers += trip.passenger_count;
//             areaHourlyDemand[timeKey].tripCount++;
//             areaHourlyDemand[timeKey].passengerCounts.push(trip.passenger_count);
//             areaHourlyDemand[timeKey].fareTotal += trip.fare_amount || 12;
//             areaHourlyDemand[timeKey].distanceTotal += trip.total_distance_km || 0;
//         });

//         // Convert to ML features - ONLY FROM ACTUAL DATA
//         const features = [];
//         Object.keys(areaHourlyDemand).forEach(key => {
//             const data = areaHourlyDemand[key];
//             const avgPassengers = data.totalPassengers / data.tripCount;
//             const avgFare = data.fareTotal / data.tripCount;
//             const avgDistance = data.distanceTotal / data.tripCount;
            
//             features.push({
//                 // Temporal features FROM DATA
//                 hour: data.hour,
//                 dayOfWeek: data.dayOfWeek,
//                 month: new Date().getMonth(),
                
//                 // Spatial features FROM DATA
//                 area_lat: data.lat,
//                 area_lng: data.lng,
                
//                 // Demand features FROM DATA
//                 total_passengers: data.totalPassengers,
//                 avg_passengers: avgPassengers,
//                 trips_count: data.tripCount,
//                 max_passengers: Math.max(...data.passengerCounts),
//                 avg_fare: avgFare,
//                 avg_distance: avgDistance,
//                 passenger_variance: this.calculateVariance(data.passengerCounts),
                
//                 // Target variable (passenger demand) FROM DATA
//                 passenger_demand: avgPassengers,
                
//                 // Derived features FROM DATA
//                 isWeekend: [0, 6].includes(data.dayOfWeek) ? 1 : 0,
//                 isRushHour: this.isRushHour(data.hour) ? 1 : 0,
//                 isPeakHour: this.isPeakHour(data.hour, data.dayOfWeek) ? 1 : 0
//             });
//         });

//         // Calculate data distribution for dynamic thresholds
//         this.calculateDataDistribution(features);
        
//         return features;
//     }

//     // Calculate actual data patterns from database
//     calculateDataDistribution(features) {
//         if (!features || features.length === 0) return;
        
//         const passengerValues = features.map(f => f.avg_passengers);
//         const sorted = passengerValues.sort((a, b) => a - b);
        
//         this.dataDistribution = {
//             min: Math.min(...passengerValues),
//             max: Math.max(...passengerValues),
//             mean: passengerValues.reduce((a, b) => a + b, 0) / passengerValues.length,
//             percentiles: {
//                 p25: sorted[Math.floor(sorted.length * 0.25)],
//                 p50: sorted[Math.floor(sorted.length * 0.50)],
//                 p75: sorted[Math.floor(sorted.length * 0.75)]
//             }
//         };
        
//         console.log(`📊 Data Distribution: min=${this.dataDistribution.min}, max=${this.dataDistribution.max}, mean=${this.dataDistribution.mean.toFixed(2)}`);
//     }

//     // Extract unique areas from actual training data
//     extractUniqueAreas(features) {
//         const areas = new Map();
        
//         features.forEach(feature => {
//             const roundedLat = Math.round(feature.area_lat * 100) / 100;
//             const roundedLng = Math.round(feature.area_lng * 100) / 100;
//             const key = `${roundedLat},${roundedLng}`;
            
//             if (!areas.has(key)) {
//                 areas.set(key, {
//                     lat: roundedLat,
//                     lng: roundedLng,
//                     dataPoints: 1
//                 });
//             } else {
//                 areas.get(key).dataPoints++;
//             }
//         });
        
//         console.log(`📍 ML found ${areas.size} unique areas from training data`);
//         return Array.from(areas.values());
//     }

//     // Calculate statistics for normalization
//     calculateStats(features) {
//         const featureArray = features.map(f => [
//             f.hour, f.dayOfWeek, f.month, f.area_lat, f.area_lng,
//             f.total_passengers, f.avg_passengers, f.trips_count, f.max_passengers,
//             f.avg_fare, f.avg_distance, f.passenger_variance,
//             f.isWeekend, f.isRushHour, f.isPeakHour
//         ]);

//         const tensor = tf.tensor2d(featureArray);
//         const means = tensor.mean(0);
//         const std = tensor.sub(means).square().mean(0).sqrt();

//         this.featureStats = {
//             means: means.arraySync(),
//             std: std.arraySync()
//         };

//         tensor.dispose();
//         means.dispose();
//         std.dispose();

//         return this.featureStats;
//     }

//     // Normalize features
//     normalizeFeatures(features) {
//         if (!this.featureStats) {
//             this.calculateStats(features);
//         }

//         return features.map(feature => {
//             const raw = [
//                 feature.hour, feature.dayOfWeek, feature.month, feature.area_lat, feature.area_lng,
//                 feature.total_passengers, feature.avg_passengers, feature.trips_count, feature.max_passengers,
//                 feature.avg_fare, feature.avg_distance, feature.passenger_variance,
//                 feature.isWeekend, feature.isRushHour, feature.isPeakHour
//             ];

//             const normalized = raw.map((val, i) => {
//                 return (val - this.featureStats.means[i]) / (this.featureStats.std[i] || 1);
//             });

//             return {
//                 features: normalized,
//                 passenger_demand: feature.passenger_demand
//             };
//         });
//     }

//     // Build neural network for demand prediction
//     async buildModel(inputShape) {
//         this.demandModel = tf.sequential({
//             layers: [
//                 tf.layers.dense({ inputShape: [inputShape], units: 64, activation: 'relu' }),
//                 tf.layers.dropout({ rate: 0.3 }),
//                 tf.layers.dense({ units: 32, activation: 'relu' }),
//                 tf.layers.dropout({ rate: 0.2 }),
//                 tf.layers.dense({ units: 16, activation: 'relu' }),
//                 tf.layers.dense({ units: 1, activation: 'linear' })
//             ]
//         });

//         this.demandModel.compile({
//             optimizer: tf.train.adam(0.001),
//             loss: 'meanSquaredError',
//             metrics: ['mae']
//         });

//         return this.demandModel;
//     }

//     // Train the ML model
//     async train(trips, epochs = 100) {
//         console.log('🔄 Training Passenger Demand ML Model...');
        
//         if (trips.length < 10) {
//             console.log('⚠️ Insufficient data for ML training');
//             this.isTrained = true;
//             return;
//         }

//         const features = this.extractDemandFeatures(trips);
        
//         // Store training data and areas
//         this.trainingData = features;
//         this.trainingAreas = this.extractUniqueAreas(features);
        
//         console.log(`📍 Training on ${this.trainingAreas.length} unique areas from database`);

//         const normalizedData = this.normalizeFeatures(features);
        
//         // Split data
//         const splitIndex = Math.floor(normalizedData.length * 0.8);
//         const trainData = normalizedData.slice(0, splitIndex);
//         const valData = normalizedData.slice(splitIndex);

//         // Prepare tensors
//         const trainFeatures = tf.tensor2d(trainData.map(d => d.features));
//         const trainLabels = tf.tensor1d(trainData.map(d => d.passenger_demand));
//         const valFeatures = tf.tensor2d(valData.map(d => d.features));
//         const valLabels = tf.tensor1d(valData.map(d => d.passenger_demand));

//         console.log(`📊 Training on ${trainData.length} samples, validating on ${valData.length} samples`);

//         // Build and train model
//         await this.buildModel(15);
        
//         const history = await this.demandModel.fit(trainFeatures, trainLabels, {
//             epochs: epochs,
//             validationData: [valFeatures, valLabels],
//             batchSize: Math.min(16, trainData.length),
//             callbacks: {
//                 onEpochEnd: (epoch, logs) => {
//                     if (epoch % 20 === 0) {
//                         console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
//                     }
//                 }
//             }
//         });

//         // Clean up
//         trainFeatures.dispose();
//         trainLabels.dispose();
//         valFeatures.dispose();
//         valLabels.dispose();

//         this.isTrained = true;
//         console.log('✅ Passenger Demand ML Model training completed!');
        
//         return history;
//     }

//     // Check if area is in training data
//     isAreaInTrainingData(lat, lng) {
//         if (!this.trainingAreas) return false;
        
//         return this.trainingAreas.some(area => {
//             const distance = this.calculateDistance(lat, lng, area.lat, area.lng);
//             return distance < 2.0;
//         });
//     }

//     // Check if we have training data for specific time
//     hasTrainingDataForTime(hour, dayOfWeek) {
//         if (!this.trainingData || this.trainingData.length === 0) {
//             return false;
//         }
        
//         const matchingData = this.trainingData.filter(trainingItem => {
//             return trainingItem.hour === hour && trainingItem.dayOfWeek === dayOfWeek;
//         });
        
//         const hasSufficientData = matchingData.length >= 2;
        
//         console.log(`📊 ML Data check for ${this.getDayName(dayOfWeek)} ${hour}:00 - ${matchingData.length} data points`);
        
//         return hasSufficientData;
//     }

//     // Predict passenger demand for a specific location and time
//     predictPassengerDemand(hour, dayOfWeek, lat, lng) {
//         if (!this.isTrained || !this.demandModel) {
//             throw new Error('Model not trained yet. Call train() first.');
//         }

//         // Only predict if we have actual training data
//         if (!this.hasTrainingDataForTime(hour, dayOfWeek)) {
//             return {
//                 predicted_passengers: 0,
//                 demand_level: "No Training Data",
//                 confidence: 0.1,
//                 method: 'no_training_data',
//                 reason: `ML has no training data for ${this.getDayName(dayOfWeek)} ${hour}:00`
//             };
//         }

//         if (!this.isAreaInTrainingData(lat, lng)) {
//             return {
//                 predicted_passengers: 0,
//                 demand_level: "Area Not in Training Data",
//                 confidence: 0.1,
//                 method: 'area_not_trained',
//                 reason: `Location not in ML training data`
//             };
//         }

//         // ML Prediction
//         try {
//             const month = new Date().getMonth();
//             const area_lat = Math.round(lat * 1000) / 1000;
//             const area_lng = Math.round(lng * 1000) / 1000;
            
//             const estimatedFeatures = this.estimateFeatures(hour, dayOfWeek, area_lat, area_lng);
            
//             const rawFeatures = [
//                 hour, dayOfWeek, month, area_lat, area_lng,
//                 estimatedFeatures.total_passengers, estimatedFeatures.avg_passengers, 
//                 estimatedFeatures.trips_count, estimatedFeatures.max_passengers,
//                 estimatedFeatures.avg_fare, estimatedFeatures.avg_distance, estimatedFeatures.passenger_variance,
//                 [0, 6].includes(dayOfWeek) ? 1 : 0,
//                 this.isRushHour(hour) ? 1 : 0,
//                 this.isPeakHour(hour, dayOfWeek) ? 1 : 0
//             ];

//             const normalizedFeatures = rawFeatures.map((val, i) => {
//                 return (val - this.featureStats.means[i]) / (this.featureStats.std[i] || 1);
//             });

//             const inputTensor = tf.tensor2d([normalizedFeatures]);
//             const prediction = this.demandModel.predict(inputTensor);
//             const predictedDemand = prediction.dataSync()[0];
            
//             const confidence = this.calculateConfidence(predictedDemand, hour, dayOfWeek, area_lat, area_lng);

//             inputTensor.dispose();
//             prediction.dispose();

//             const realisticDemand = Math.max(0, Math.round(predictedDemand));
            
//             return {
//                 predicted_passengers: realisticDemand,
//                 demand_level: this.getDemandLevel(realisticDemand),
//                 confidence: confidence,
//                 method: 'neural_network',
//                 reason: `Based on ${this.getAvailableDataCount(hour, dayOfWeek)} training data points`
//             };

//         } catch (error) {
//             return {
//                 predicted_passengers: 0,
//                 demand_level: "Prediction Failed",
//                 confidence: 0.1,
//                 method: 'prediction_error',
//                 reason: `ML prediction failed: ${error.message}`
//             };
//         }
//     }

//     // Analyze city-wide passenger demand
//     analyzeCitywidePassengerDemand(hour, dayOfWeek) {
//         if (!this.isTrained || !this.trainingAreas) {
//             throw new Error('Model not trained yet. Call train() first.');
//         }

//         console.log(`🧠 Analyzing passenger demand in ${this.trainingAreas.length} areas for ${hour}:00`);

//         const predictions = [];
        
//         // Predict demand for each trained area
//         for (const area of this.trainingAreas) {
//             try {
//                 const prediction = this.predictPassengerDemand(hour, dayOfWeek, area.lat, area.lng);
//                 predictions.push({
//                     lat: area.lat,
//                     lng: area.lng,
//                     ...prediction
//                 });
//             } catch (error) {
//                 console.log(`Prediction failed for area (${area.lat}, ${area.lng}):`, error.message);
//             }
//         }
        
//         console.log(`📊 Citywide demand analysis: ${predictions.length} successful predictions`);
//         return predictions;
//     }

//     // Estimate features using ACTUAL DATA PATTERNS only
//     estimateFeatures(hour, dayOfWeek, lat, lng) {
//         // Find similar patterns in ACTUAL training data
//         const similarData = this.trainingData.filter(item => {
//             const timeDiff = Math.abs(item.hour - hour) <= 2;
//             const dayDiff = item.dayOfWeek === dayOfWeek;
//             const areaDiff = this.calculateDistance(lat, lng, item.area_lat, item.area_lng) < 5.0;
            
//             return timeDiff && dayDiff && areaDiff;
//         });
        
//         if (similarData.length > 0) {
//             // Use ACTUAL data patterns from database
//             const totalPassengers = similarData.reduce((sum, item) => sum + item.total_passengers, 0);
//             const avgPassengers = similarData.reduce((sum, item) => sum + item.avg_passengers, 0) / similarData.length;
//             const tripsCount = similarData.reduce((sum, item) => sum + item.trips_count, 0) / similarData.length;
//             const maxPassengers = Math.max(...similarData.map(item => item.max_passengers));
//             const avgFare = similarData.reduce((sum, item) => sum + item.avg_fare, 0) / similarData.length;
//             const avgDistance = similarData.reduce((sum, item) => sum + item.avg_distance, 0) / similarData.length;
            
//             return {
//                 total_passengers: Math.max(1, Math.round(totalPassengers / similarData.length)),
//                 avg_passengers: Math.max(0.5, avgPassengers),
//                 trips_count: Math.max(1, Math.round(tripsCount)),
//                 max_passengers: Math.max(1, maxPassengers),
//                 avg_fare: avgFare,
//                 avg_distance: avgDistance,
//                 passenger_variance: similarData.reduce((sum, item) => sum + item.passenger_variance, 0) / similarData.length
//             };
//         }
        
//         // If no similar data, use overall data patterns from database
//         if (this.trainingData && this.trainingData.length > 0) {
//             const overallAvg = this.trainingData.reduce((sum, item) => sum + item.avg_passengers, 0) / this.trainingData.length;
//             const overallTrips = this.trainingData.reduce((sum, item) => sum + item.trips_count, 0) / this.trainingData.length;
//             const overallFare = this.trainingData.reduce((sum, item) => sum + item.avg_fare, 0) / this.trainingData.length;
//             const overallDistance = this.trainingData.reduce((sum, item) => sum + item.avg_distance, 0) / this.trainingData.length;
            
//             return {
//                 total_passengers: Math.max(1, Math.round(overallAvg * 1.5)),
//                 avg_passengers: Math.max(0.5, overallAvg),
//                 trips_count: Math.max(1, Math.round(overallTrips * 0.5)),
//                 max_passengers: Math.max(1, overallAvg * 1.2),
//                 avg_fare: overallFare,
//                 avg_distance: overallDistance,
//                 passenger_variance: 2.0
//             };
//         }
        
//         // Only if database is completely empty
//         return {
//             total_passengers: 1,
//             avg_passengers: 1,
//             trips_count: 1,
//             max_passengers: 1,
//             avg_fare: 12,
//             avg_distance: 1.5,
//             passenger_variance: 1.0
//         };
//     }

//     // Calculate confidence based SOLELY on data quality
//     calculateConfidence(predictedDemand, hour, dayOfWeek, lat, lng) {
//         let confidence = 0.5; // Neutral base
        
//         // 1. Confidence based on ACTUAL data points for this area
//         const areaDataPoints = this.getAreaDataPoints(lat, lng);
//         confidence += (areaDataPoints / 20) * 0.3;
        
//         // 2. Confidence based on ACTUAL data points for this time
//         const timeDataPoints = this.getAvailableDataCount(hour, dayOfWeek);
//         confidence += (timeDataPoints / 10) * 0.3;
        
//         // 3. Confidence based on prediction realism within data distribution
//         if (this.dataDistribution) {
//             const dataRange = this.dataDistribution.max - this.dataDistribution.min;
//             if (dataRange > 0) {
//                 const normalizedDistance = Math.abs(predictedDemand - this.dataDistribution.mean) / dataRange;
//                 confidence -= normalizedDistance * 0.4;
//             }
//         }
        
//         // 4. Confidence based on data consistency
//         const consistency = this.calculateDataConsistency(hour, dayOfWeek, lat, lng);
//         confidence += consistency * 0.2;
        
//         return Math.max(0.1, Math.min(0.95, confidence));
//     }

//     // Dynamic demand levels based on ACTUAL data distribution
//     getDemandLevel(passengerCount) {
//         if (!this.dataDistribution) return 'Unknown';
        
//         const { min, max, percentiles } = this.dataDistribution;
        
//         if (passengerCount === 0) return 'No Demand';
//         if (passengerCount <= percentiles.p25) return 'Very Low Demand';
//         if (passengerCount <= percentiles.p50) return 'Low Demand';
//         if (passengerCount <= percentiles.p75) return 'Medium Demand';
//         if (passengerCount <= max * 0.9) return 'High Demand';
//         return 'Very High Demand';
//     }

//     // Helper methods
//     isRushHour(hour) {
//         return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
//     }

//     isPeakHour(hour, dayOfWeek) {
//         const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
//         return isWeekday && (hour === 8 || hour === 18);
//     }

//     calculateDistance(lat1, lng1, lat2, lng2) {
//         const R = 6371;
//         const dLat = (lat2 - lat1) * Math.PI / 180;
//         const dLng = (lng2 - lng1) * Math.PI / 180;
//         const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//                   Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//                   Math.sin(dLng/2) * Math.sin(dLng/2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//         return R * c;
//     }

//     // Helper method to calculate variance
//     calculateVariance(values) {
//         if (values.length < 2) return 0;
//         const mean = values.reduce((a, b) => a + b, 0) / values.length;
//         return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
//     }

//     // Calculate data consistency from actual patterns
//     calculateDataConsistency(hour, dayOfWeek, lat, lng) {
//         if (!this.trainingData) return 0.5;
        
//         const similarData = this.trainingData.filter(item => 
//             Math.abs(item.hour - hour) <= 2 && 
//             item.dayOfWeek === dayOfWeek
//         );
        
//         if (similarData.length < 2) return 0.3;
        
//         const variances = similarData.map(item => item.passenger_variance);
//         const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
        
//         // Lower variance = higher consistency
//         return Math.max(0.1, 1.0 - (avgVariance / 10));
//     }

//     getAvailableDataCount(hour, dayOfWeek) {
//         if (!this.trainingData) return 0;
//         return this.trainingData.filter(item => 
//             item.hour === hour && item.dayOfWeek === dayOfWeek
//         ).length;
//     }

//     getAreaDataPoints(lat, lng) {
//         if (!this.trainingData) return 0;
        
//         return this.trainingData.filter(item => {
//             const distance = this.calculateDistance(lat, lng, item.area_lat, item.area_lng);
//             return distance < 2.0;
//         }).length;
//     }

//     getDayName(dayOfWeek) {
//         const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         return days[dayOfWeek] || 'Unknown';
//     }
// }

// module.exports = PassengerDemandPredictor;


const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const { parseISO } = require('date-fns');

class PassengerDemandPredictor {
    constructor() {
        this.demandModel = null;
        this.featureStats = null;
        this.isTrained = false;
        this.trainingAreas = null;
        this.trainingData = null;
        this.dataDistribution = null;
    }

    // Extract features from ACTUAL database data - FIXED VERSION
    extractDemandFeatures(trips) {
        const dailyHourlyDemand = {};
        
        // STEP 1: Group by DATE + HOUR + LOCATION (not just hour)
        trips.forEach(trip => {
            const utcDate = parseISO(trip.created_at);
            const phTime = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
            
            const date = phTime.toDateString(); // "Mon Nov 25 2025"
            const hour = phTime.getHours();
            const dayOfWeek = phTime.getDay();
            const areaKey = `${Math.round(trip.start_lat * 1000)},${Math.round(trip.start_lng * 1000)}`;
            
            // UNIQUE key for each specific day+hour+location
            const dailyKey = `${date},${hour},${areaKey}`;
            
            if (!dailyHourlyDemand[dailyKey]) {
                dailyHourlyDemand[dailyKey] = {
                    date: date,
                    hour: hour,
                    dayOfWeek: dayOfWeek,
                    lat: Math.round(trip.start_lat * 1000) / 1000,
                    lng: Math.round(trip.start_lng * 1000) / 1000,
                    totalPassengers: 0,
                    tripCount: 0,
                    passengerCounts: [],
                    fareTotal: 0,
                    distanceTotal: 0
                };
            }
            
            dailyHourlyDemand[dailyKey].totalPassengers += trip.passenger_count;
            dailyHourlyDemand[dailyKey].tripCount++;
            dailyHourlyDemand[dailyKey].passengerCounts.push(trip.passenger_count);
            dailyHourlyDemand[dailyKey].fareTotal += trip.fare_amount || 12;
            dailyHourlyDemand[dailyKey].distanceTotal += trip.total_distance_km || 0;
        });

        // STEP 2: Now group by DAY_OF_WEEK + HOUR + LOCATION across different dates
        const weeklyPatterns = {};
        
        Object.values(dailyHourlyDemand).forEach(dailyData => {
            const patternKey = `${dailyData.dayOfWeek},${dailyData.hour},${dailyData.lat},${dailyData.lng}`;
            
            if (!weeklyPatterns[patternKey]) {
                weeklyPatterns[patternKey] = {
                    hour: dailyData.hour,
                    dayOfWeek: dailyData.dayOfWeek,
                    lat: dailyData.lat,
                    lng: dailyData.lng,
                    dailyPassengers: [], // Store each day's total passengers
                    dailyTrips: [],      // Store each day's trip count
                    dailyFares: [],      // Store each day's fare totals
                    dailyDistances: [],  // Store each day's distance totals
                    dates: []            // Track which dates we have
                };
            }
            
            weeklyPatterns[patternKey].dailyPassengers.push(dailyData.totalPassengers);
            weeklyPatterns[patternKey].dailyTrips.push(dailyData.tripCount);
            weeklyPatterns[patternKey].dailyFares.push(dailyData.fareTotal);
            weeklyPatterns[patternKey].dailyDistances.push(dailyData.distanceTotal);
            weeklyPatterns[patternKey].dates.push(dailyData.date);
        });

        // STEP 3: Create ML features from weekly patterns
        const features = [];
        
        Object.values(weeklyPatterns).forEach(pattern => {
            // ONLY use patterns with data from multiple dates
            if (pattern.dates.length >= 2) { // Reduced to 1 for initial testing
                const avgPassengers = pattern.dailyPassengers.reduce((a, b) => a + b, 0) / pattern.dailyPassengers.length;
                const avgTrips = pattern.dailyTrips.reduce((a, b) => a + b, 0) / pattern.dailyTrips.length;
                const avgFare = pattern.dailyFares.reduce((a, b) => a + b, 0) / pattern.dailyFares.length;
                const avgDistance = pattern.dailyDistances.reduce((a, b) => a + b, 0) / pattern.dailyDistances.length;
                
                features.push({
                    // Temporal features
                    hour: pattern.hour,
                    dayOfWeek: pattern.dayOfWeek,
                    month: new Date().getMonth(),
                    
                    // Spatial features
                    area_lat: pattern.lat,
                    area_lng: pattern.lng,
                    
                    // Demand features
                    total_passengers: pattern.dailyPassengers.reduce((a, b) => a + b, 0),
                    avg_passengers: avgPassengers,
                    trips_count: Math.round(avgTrips),
                    max_passengers: Math.max(...pattern.dailyPassengers),
                    avg_fare: avgFare,
                    avg_distance: avgDistance,
                    passenger_variance: this.calculateVariance(pattern.dailyPassengers),
                    
                    // Target variable
                    passenger_demand: avgPassengers,
                    
                    // Derived features
                    isWeekend: [0, 6].includes(pattern.dayOfWeek) ? 1 : 0,
                    isRushHour: this.isRushHour(pattern.hour) ? 1 : 0,
                    isPeakHour: this.isPeakHour(pattern.hour, pattern.dayOfWeek) ? 1 : 0,
                    
                    // Metadata for debugging
                    data_points: pattern.dates.length,
                    dates_analyzed: pattern.dates
                });
            }
        });

        console.log(`📊 Created ${features.length} features from ${Object.keys(weeklyPatterns).length} weekly patterns`);
        
        // Calculate data distribution for dynamic thresholds
        this.calculateDataDistribution(features);
        
        return features;
    }

    // Calculate actual data patterns from database
    calculateDataDistribution(features) {
        if (!features || features.length === 0) return;
        
        const passengerValues = features.map(f => f.avg_passengers);
        const sorted = passengerValues.sort((a, b) => a - b);
        
        this.dataDistribution = {
            min: Math.min(...passengerValues),
            max: Math.max(...passengerValues),
            mean: passengerValues.reduce((a, b) => a + b, 0) / passengerValues.length,
            percentiles: {
                p25: sorted[Math.floor(sorted.length * 0.25)],
                p50: sorted[Math.floor(sorted.length * 0.50)],
                p75: sorted[Math.floor(sorted.length * 0.75)]
            }
        };
        
        console.log(`📊 Data Distribution: min=${this.dataDistribution.min}, max=${this.dataDistribution.max}, mean=${this.dataDistribution.mean.toFixed(2)}`);
    }

    // Extract unique areas from actual training data
    extractUniqueAreas(features) {
        const areas = new Map();
        
        features.forEach(feature => {
            const roundedLat = Math.round(feature.area_lat * 100) / 100;
            const roundedLng = Math.round(feature.area_lng * 100) / 100;
            const key = `${roundedLat},${roundedLng}`;
            
            if (!areas.has(key)) {
                areas.set(key, {
                    lat: roundedLat,
                    lng: roundedLng,
                    dataPoints: 1
                });
            } else {
                areas.get(key).dataPoints++;
            }
        });
        
        console.log(`📍 ML found ${areas.size} unique areas from training data`);
        return Array.from(areas.values());
    }

    // Calculate statistics for normalization
    calculateStats(features) {
        const featureArray = features.map(f => [
            f.hour, f.dayOfWeek, f.month, f.area_lat, f.area_lng,
            f.total_passengers, f.avg_passengers, f.trips_count, f.max_passengers,
            f.avg_fare, f.avg_distance, f.passenger_variance,
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
                feature.total_passengers, feature.avg_passengers, feature.trips_count, feature.max_passengers,
                feature.avg_fare, feature.avg_distance, feature.passenger_variance,
                feature.isWeekend, feature.isRushHour, feature.isPeakHour
            ];

            const normalized = raw.map((val, i) => {
                return (val - this.featureStats.means[i]) / (this.featureStats.std[i] || 1);
            });

            return {
                features: normalized,
                passenger_demand: feature.passenger_demand
            };
        });
    }

    // Build neural network for demand prediction
    async buildModel(inputShape) {
        this.demandModel = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [inputShape], units: 64, activation: 'relu' }),
                tf.layers.dropout({ rate: 0.3 }),
                tf.layers.dense({ units: 32, activation: 'relu' }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 16, activation: 'relu' }),
                tf.layers.dense({ units: 1, activation: 'linear' })
            ]
        });

        this.demandModel.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mae']
        });

        return this.demandModel;
    }

    // Train the ML model
    async train(trips, epochs = 100) {
        console.log('🔄 Training Passenger Demand ML Model...');
        
        if (trips.length < 10) {
            console.log('⚠️ Insufficient data for ML training');
            this.isTrained = true;
            return;
        }

        const features = this.extractDemandFeatures(trips);
        
        if (features.length === 0) {
            console.log('⚠️ No valid weekly patterns found for ML training');
            this.isTrained = true;
            return;
        }
        
        // Store training data and areas
        this.trainingData = features;
        this.trainingAreas = this.extractUniqueAreas(features);
        
        console.log(`📍 Training on ${this.trainingAreas.length} unique areas from ${features.length} weekly patterns`);

        const normalizedData = this.normalizeFeatures(features);
        
        // Split data
        const splitIndex = Math.floor(normalizedData.length * 0.8);
        const trainData = normalizedData.slice(0, splitIndex);
        const valData = normalizedData.slice(splitIndex);

        // Prepare tensors
        const trainFeatures = tf.tensor2d(trainData.map(d => d.features));
        const trainLabels = tf.tensor1d(trainData.map(d => d.passenger_demand));
        const valFeatures = tf.tensor2d(valData.map(d => d.features));
        const valLabels = tf.tensor1d(valData.map(d => d.passenger_demand));

        console.log(`📊 Training on ${trainData.length} samples, validating on ${valData.length} samples`);

        // Build and train model
        await this.buildModel(15);
        
        const history = await this.demandModel.fit(trainFeatures, trainLabels, {
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
        console.log('✅ Passenger Demand ML Model training completed!');
        
        return history;
    }

    // Check if area is in training data
    isAreaInTrainingData(lat, lng) {
        if (!this.trainingAreas) return false;
        
        return this.trainingAreas.some(area => {
            const distance = this.calculateDistance(lat, lng, area.lat, area.lng);
            return distance < 2.0;
        });
    }

    // Check if we have training data for specific time
    hasTrainingDataForTime(hour, dayOfWeek) {
        if (!this.trainingData || this.trainingData.length === 0) {
            return false;
        }
        
        const matchingData = this.trainingData.filter(trainingItem => {
            return trainingItem.hour === hour && trainingItem.dayOfWeek === dayOfWeek;
        });
        
        const hasSufficientData = matchingData.length >= 1; // Reduced requirement
        
        console.log(`📊 ML Data check for ${this.getDayName(dayOfWeek)} ${hour}:00 - ${matchingData.length} weekly patterns`);
        
        return hasSufficientData;
    }

    // Predict passenger demand for a specific location and time
    predictPassengerDemand(hour, dayOfWeek, lat, lng) {
        if (!this.isTrained || !this.demandModel) {
            throw new Error('Model not trained yet. Call train() first.');
        }

        // Only predict if we have actual training data
        if (!this.hasTrainingDataForTime(hour, dayOfWeek)) {
            return {
                predicted_passengers: 0,
                demand_level: "No Training Data",
                confidence: 0.1,
                method: 'no_training_data',
                reason: `ML has no weekly patterns for ${this.getDayName(dayOfWeek)} ${hour}:00`
            };
        }

        if (!this.isAreaInTrainingData(lat, lng)) {
            return {
                predicted_passengers: 0,
                demand_level: "Area Not in Training Data",
                confidence: 0.1,
                method: 'area_not_trained',
                reason: `Location not in ML training data`
            };
        }

        // ML Prediction
        try {
            const month = new Date().getMonth();
            const area_lat = Math.round(lat * 1000) / 1000;
            const area_lng = Math.round(lng * 1000) / 1000;
            
            const estimatedFeatures = this.estimateFeatures(hour, dayOfWeek, area_lat, area_lng);
            
            const rawFeatures = [
                hour, dayOfWeek, month, area_lat, area_lng,
                estimatedFeatures.total_passengers, estimatedFeatures.avg_passengers, 
                estimatedFeatures.trips_count, estimatedFeatures.max_passengers,
                estimatedFeatures.avg_fare, estimatedFeatures.avg_distance, estimatedFeatures.passenger_variance,
                [0, 6].includes(dayOfWeek) ? 1 : 0,
                this.isRushHour(hour) ? 1 : 0,
                this.isPeakHour(hour, dayOfWeek) ? 1 : 0
            ];

            const normalizedFeatures = rawFeatures.map((val, i) => {
                return (val - this.featureStats.means[i]) / (this.featureStats.std[i] || 1);
            });

            const inputTensor = tf.tensor2d([normalizedFeatures]);
            const prediction = this.demandModel.predict(inputTensor);
            const predictedDemand = prediction.dataSync()[0];
            
            const confidence = this.calculateConfidence(predictedDemand, hour, dayOfWeek, area_lat, area_lng);

            inputTensor.dispose();
            prediction.dispose();

            const realisticDemand = Math.max(0, Math.round(predictedDemand));
            
            return {
                predicted_passengers: realisticDemand,
                demand_level: this.getDemandLevel(realisticDemand),
                confidence: confidence,
                method: 'neural_network',
                reason: `Based on ${this.getAvailableDataCount(hour, dayOfWeek)} weekly patterns`
            };

        } catch (error) {
            return {
                predicted_passengers: 0,
                demand_level: "Prediction Failed",
                confidence: 0.1,
                method: 'prediction_error',
                reason: `ML prediction failed: ${error.message}`
            };
        }
    }

    // Analyze city-wide passenger demand
    analyzeCitywidePassengerDemand(hour, dayOfWeek) {
        if (!this.isTrained || !this.trainingAreas) {
            throw new Error('Model not trained yet. Call train() first.');
        }

        console.log(`🧠 Analyzing passenger demand in ${this.trainingAreas.length} areas for ${hour}:00`);

        const predictions = [];
        
        // Predict demand for each trained area
        for (const area of this.trainingAreas) {
            try {
                const prediction = this.predictPassengerDemand(hour, dayOfWeek, area.lat, area.lng);
                predictions.push({
                    lat: area.lat,
                    lng: area.lng,
                    ...prediction
                });
            } catch (error) {
                console.log(`Prediction failed for area (${area.lat}, ${area.lng}):`, error.message);
            }
        }
        
        console.log(`📊 Citywide demand analysis: ${predictions.length} successful predictions`);
        return predictions;
    }

    // Estimate features using ACTUAL DATA PATTERNS only
    estimateFeatures(hour, dayOfWeek, lat, lng) {
        // Find similar patterns in ACTUAL training data
        const similarData = this.trainingData.filter(item => {
            const timeDiff = Math.abs(item.hour - hour) <= 2;
            const dayDiff = item.dayOfWeek === dayOfWeek;
            const areaDiff = this.calculateDistance(lat, lng, item.area_lat, item.area_lng) < 5.0;
            
            return timeDiff && dayDiff && areaDiff;
        });
        
        if (similarData.length > 0) {
            // Use ACTUAL data patterns from database
            const totalPassengers = similarData.reduce((sum, item) => sum + item.total_passengers, 0);
            const avgPassengers = similarData.reduce((sum, item) => sum + item.avg_passengers, 0) / similarData.length;
            const tripsCount = similarData.reduce((sum, item) => sum + item.trips_count, 0) / similarData.length;
            const maxPassengers = Math.max(...similarData.map(item => item.max_passengers));
            const avgFare = similarData.reduce((sum, item) => sum + item.avg_fare, 0) / similarData.length;
            const avgDistance = similarData.reduce((sum, item) => sum + item.avg_distance, 0) / similarData.length;
            
            return {
                total_passengers: Math.max(1, Math.round(totalPassengers / similarData.length)),
                avg_passengers: Math.max(0.5, avgPassengers),
                trips_count: Math.max(1, Math.round(tripsCount)),
                max_passengers: Math.max(1, maxPassengers),
                avg_fare: avgFare,
                avg_distance: avgDistance,
                passenger_variance: similarData.reduce((sum, item) => sum + item.passenger_variance, 0) / similarData.length
            };
        }
        
        // If no similar data, use overall data patterns from database
        if (this.trainingData && this.trainingData.length > 0) {
            const overallAvg = this.trainingData.reduce((sum, item) => sum + item.avg_passengers, 0) / this.trainingData.length;
            const overallTrips = this.trainingData.reduce((sum, item) => sum + item.trips_count, 0) / this.trainingData.length;
            const overallFare = this.trainingData.reduce((sum, item) => sum + item.avg_fare, 0) / this.trainingData.length;
            const overallDistance = this.trainingData.reduce((sum, item) => sum + item.avg_distance, 0) / this.trainingData.length;
            
            return {
                total_passengers: Math.max(1, Math.round(overallAvg * 1.5)),
                avg_passengers: Math.max(0.5, overallAvg),
                trips_count: Math.max(1, Math.round(overallTrips * 0.5)),
                max_passengers: Math.max(1, overallAvg * 1.2),
                avg_fare: overallFare,
                avg_distance: overallDistance,
                passenger_variance: 2.0
            };
        }
        
        // Only if database is completely empty
        return {
            total_passengers: 1,
            avg_passengers: 1,
            trips_count: 1,
            max_passengers: 1,
            avg_fare: 12,
            avg_distance: 1.5,
            passenger_variance: 1.0
        };
    }

    // Calculate confidence based SOLELY on data quality
    calculateConfidence(predictedDemand, hour, dayOfWeek, lat, lng) {
        let confidence = 0.5; // Neutral base
        
        // 1. Confidence based on ACTUAL data points for this area
        const areaDataPoints = this.getAreaDataPoints(lat, lng);
        confidence += (areaDataPoints / 20) * 0.3;
        
        // 2. Confidence based on ACTUAL data points for this time
        const timeDataPoints = this.getAvailableDataCount(hour, dayOfWeek);
        confidence += (timeDataPoints / 10) * 0.3;
        
        // 3. Confidence based on prediction realism within data distribution
        if (this.dataDistribution) {
            const dataRange = this.dataDistribution.max - this.dataDistribution.min;
            if (dataRange > 0) {
                const normalizedDistance = Math.abs(predictedDemand - this.dataDistribution.mean) / dataRange;
                confidence -= normalizedDistance * 0.4;
            }
        }
        
        // 4. Confidence based on data consistency
        const consistency = this.calculateDataConsistency(hour, dayOfWeek, lat, lng);
        confidence += consistency * 0.2;
        
        return Math.max(0.1, Math.min(0.95, confidence));
    }

    // Dynamic demand levels based on ACTUAL data distribution
    getDemandLevel(passengerCount) {
        if (!this.dataDistribution) return 'Unknown';
        
        const { min, max, percentiles } = this.dataDistribution;
        
        if (passengerCount === 0) return 'No Demand';
        if (passengerCount <= percentiles.p25) return 'Very Low Demand';
        if (passengerCount <= percentiles.p50) return 'Low Demand';
        if (passengerCount <= percentiles.p75) return 'Medium Demand';
        if (passengerCount <= max * 0.9) return 'High Demand';
        return 'Very High Demand';
    }

    // Helper methods
    isRushHour(hour) {
        return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    }

    isPeakHour(hour, dayOfWeek) {
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        return isWeekday && (hour === 8 || hour === 18);
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Helper method to calculate variance
    calculateVariance(values) {
        if (values.length < 2) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    }

    // Calculate data consistency from actual patterns
    calculateDataConsistency(hour, dayOfWeek, lat, lng) {
        if (!this.trainingData) return 0.5;
        
        const similarData = this.trainingData.filter(item => 
            Math.abs(item.hour - hour) <= 2 && 
            item.dayOfWeek === dayOfWeek
        );
        
        if (similarData.length < 2) return 0.3;
        
        const variances = similarData.map(item => item.passenger_variance);
        const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
        
        // Lower variance = higher consistency
        return Math.max(0.1, 1.0 - (avgVariance / 10));
    }

    getAvailableDataCount(hour, dayOfWeek) {
        if (!this.trainingData) return 0;
        return this.trainingData.filter(item => 
            item.hour === hour && item.dayOfWeek === dayOfWeek
        ).length;
    }

    getAreaDataPoints(lat, lng) {
        if (!this.trainingData) return 0;
        
        return this.trainingData.filter(item => {
            const distance = this.calculateDistance(lat, lng, item.area_lat, item.area_lng);
            return distance < 2.0;
        }).length;
    }

    getDayName(dayOfWeek) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek] || 'Unknown';
    }
}

module.exports = PassengerDemandPredictor;
