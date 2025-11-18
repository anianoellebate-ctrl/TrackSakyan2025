// // // ml-service.js - Using TensorFlow.js CPU version (pure JavaScript)
// // const tf = require('@tensorflow/tfjs');
// // require('@tensorflow/tfjs-backend-cpu'); // Use CPU backend
// // const { parseISO } = require('date-fns');

// // class CongestionPredictor {
// //     constructor() {
// //         this.model = null;
// //         this.featureStats = null;
// //         this.isTrained = false;
// //         this.historicalPatterns = null;
// //     }

// //     // Real-world congestion levels based on passenger capacity
// //     getCongestionLevel(passengerCount) {
// //         if (passengerCount <= 5) return 'Very Low';
// //         if (passengerCount <= 15) return 'Low';
// //         if (passengerCount <= 22) return 'Medium';
// //         if (passengerCount <= 25) return 'High';
// //         return 'Overcrowded';
// //     }

// //     getRecommendation(passengerCount) {
// //         if (passengerCount <= 5) return 'Normal operations - minimal congestion';
// //         if (passengerCount <= 15) return 'Moderate demand - maintain current service';
// //         if (passengerCount <= 22) return 'High demand - consider adding vehicles';
// //         if (passengerCount <= 25) return 'Very high demand - deploy extra vehicles immediately';
// //         return 'Critical overcrowding - emergency measures needed';
// //     }

// //     // Simple statistical pattern analysis (fallback when ML isn't available)
// //     analyzeHistoricalPatterns(trips) {
// //         const patterns = {};
        
// //         trips.forEach(trip => {
// //             const date = parseISO(trip.created_at);
// //             const hour = date.getHours();
// //             const dayOfWeek = date.getDay();
// //             const areaKey = `${Math.round(trip.start_lat * 1000)},${Math.round(trip.start_lng * 1000)}`;
            
// //             const timeKey = `${dayOfWeek},${hour},${areaKey}`;
            
// //             if (!patterns[timeKey]) {
// //                 patterns[timeKey] = {
// //                     totalPassengers: 0,
// //                     tripCount: 0,
// //                     passengerCounts: []
// //                 };
// //             }
            
// //             patterns[timeKey].totalPassengers += trip.passenger_count;
// //             patterns[timeKey].tripCount++;
// //             patterns[timeKey].passengerCounts.push(trip.passenger_count);
// //         });
        
// //         // Calculate averages and trends
// //         Object.keys(patterns).forEach(key => {
// //             const pattern = patterns[key];
// //             pattern.averagePassengers = pattern.totalPassengers / pattern.tripCount;
// //             pattern.maxPassengers = Math.max(...pattern.passengerCounts);
// //         });
        
// //         this.historicalPatterns = patterns;
// //         return patterns;
// //     }

// //     // Extract features from trip data
// //     extractFeatures(trips) {
// //         return trips.map(trip => {
// //             const date = parseISO(trip.created_at);
            
// //             return {
// //                 hour: date.getHours(),
// //                 dayOfWeek: date.getDay(),
// //                 month: date.getMonth(),
// //                 area_lat: Math.round(trip.start_lat * 1000) / 1000,
// //                 area_lng: Math.round(trip.start_lng * 1000) / 1000,
// //                 passenger_count: trip.passenger_count,
// //                 fare_amount: trip.fare_amount,
// //                 distance: trip.total_distance_km,
// //                 isWeekend: [0, 6].includes(date.getDay()) ? 1 : 0,
// //                 isRushHour: this.isRushHour(date.getHours()) ? 1 : 0
// //             };
// //         });
// //     }

// //     isRushHour(hour) {
// //         return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
// //     }

// //     // Build a simple neural network
// //     async buildModel(inputShape) {
// //         this.model = tf.sequential({
// //             layers: [
// //                 tf.layers.dense({ inputShape: [inputShape], units: 32, activation: 'relu' }),
// //                 tf.layers.dense({ units: 16, activation: 'relu' }),
// //                 tf.layers.dense({ units: 8, activation: 'relu' }),
// //                 tf.layers.dense({ units: 1, activation: 'linear' })
// //             ]
// //         });

// //         this.model.compile({
// //             optimizer: tf.train.adam(0.01),
// //             loss: 'meanSquaredError',
// //             metrics: ['mae']
// //         });

// //         return this.model;
// //     }

// //     // Train the model
// //     async train(trips, epochs = 50) {
// //         console.log('🔄 Preparing training data...');
        
// //         if (trips.length < 5) {
// //             console.log('⚠️ Using statistical analysis due to limited data');
// //             this.analyzeHistoricalPatterns(trips);
// //             this.isTrained = true;
// //             return;
// //         }

// //         const features = this.extractFeatures(trips);
// //         this.analyzeHistoricalPatterns(trips); // Always analyze patterns
        
// //         if (trips.length >= 10) {
// //             try {
// //                 // Prepare data for TensorFlow
// //                 const featureArray = features.map(f => [
// //                     f.hour, f.dayOfWeek, f.month, f.area_lat, f.area_lng,
// //                     f.fare_amount, f.distance, f.isWeekend, f.isRushHour
// //                 ]);

// //                 const labelArray = features.map(f => f.passenger_count);

// //                 const featureTensor = tf.tensor2d(featureArray);
// //                 const labelTensor = tf.tensor1d(labelArray);

// //                 // Build and train model
// //                 await this.buildModel(9);
                
// //                 await this.model.fit(featureTensor, labelTensor, {
// //                     epochs: epochs,
// //                     batchSize: Math.min(8, trips.length),
// //                     validationSplit: 0.2,
// //                     callbacks: {
// //                         onEpochEnd: (epoch, logs) => {
// //                             if (epoch % 10 === 0) {
// //                                 console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
// //                             }
// //                         }
// //                     }
// //                 });

// //                 featureTensor.dispose();
// //                 labelTensor.dispose();
                
// //                 console.log('✅ Neural network training completed!');
// //             } catch (error) {
// //                 console.log('⚠️ Neural network training failed, using statistical analysis:', error.message);
// //             }
// //         }

// //         this.isTrained = true;
// //     }

// //     // Predict using ML or fallback to statistical analysis
// //     predict(hour, dayOfWeek, lat, lng, fare = 12, distance = 0) {
// //         if (!this.isTrained) {
// //             throw new Error('Model not trained yet. Call train() first.');
// //         }

// //         const areaKey = `${Math.round(lat * 1000)},${Math.round(lng * 1000)}`;
// //         const timeKey = `${dayOfWeek},${hour},${areaKey}`;
        
// //         let predictedPassengers;

// //         // Try ML prediction first
// //         if (this.model && this.historicalPatterns) {
// //             try {
// //                 const month = new Date().getMonth();
// //                 const isWeekend = [0, 6].includes(dayOfWeek) ? 1 : 0;
// //                 const isRushHour = this.isRushHour(hour) ? 1 : 0;

// //                 const features = [hour, dayOfWeek, month, lat, lng, fare, distance, isWeekend, isRushHour];
// //                 const inputTensor = tf.tensor2d([features]);
// //                 const prediction = this.model.predict(inputTensor);
// //                 predictedPassengers = Math.max(1, Math.round(prediction.dataSync()[0]));
                
// //                 inputTensor.dispose();
// //                 prediction.dispose();
// //             } catch (error) {
// //                 // Fallback to statistical analysis
// //                 predictedPassengers = this.predictStatistical(hour, dayOfWeek, lat, lng);
// //             }
// //         } else {
// //             // Use statistical analysis
// //             predictedPassengers = this.predictStatistical(hour, dayOfWeek, lat, lng);
// //         }

// //         return {
// //             predicted_passengers: predictedPassengers,
// //             congestion_level: this.getCongestionLevel(predictedPassengers),
// //             recommendation: this.getRecommendation(predictedPassengers),
// //             method: this.model ? 'neural_network' : 'statistical_analysis',
// //             confidence: 'medium'
// //         };
// //     }

// //     // Statistical prediction based on historical patterns
// //     predictStatistical(hour, dayOfWeek, lat, lng) {
// //         const areaKey = `${Math.round(lat * 1000)},${Math.round(lng * 1000)}`;
// //         const timeKey = `${dayOfWeek},${hour},${areaKey}`;
        
// //         // Exact match
// //         if (this.historicalPatterns[timeKey]) {
// //             return Math.max(1, Math.round(this.historicalPatterns[timeKey].averagePassengers));
// //         }

// //         // Similar time patterns (same hour, different days)
// //         const similarPatterns = Object.keys(this.historicalPatterns)
// //             .filter(key => {
// //                 const [patternDay, patternHour, patternArea] = key.split(',');
// //                 return patternHour === hour.toString() && patternArea === areaKey;
// //             });

// //         if (similarPatterns.length > 0) {
// //             const avg = similarPatterns.reduce((sum, key) => 
// //                 sum + this.historicalPatterns[key].averagePassengers, 0) / similarPatterns.length;
// //             return Math.max(1, Math.round(avg));
// //         }

// //         // Default prediction based on rush hour
// //         const isRushHour = this.isRushHour(hour);
// //         const isWeekend = [0, 6].includes(dayOfWeek);
        
// //         if (isRushHour && !isWeekend) return 3; // Higher during weekday rush hours
// //         if (isWeekend) return 2; // Moderate on weekends
// //         return 1; // Default low prediction
// //     }

// //     // Generate sample predictions
// //     generateSamplePredictions() {
// //         const samples = [
// //             { hour: 8, dayOfWeek: 1, lat: 7.051, lng: 125.569, fare: 15, distance: 2 },
// //             { hour: 14, dayOfWeek: 3, lat: 7.051, lng: 125.569, fare: 12, distance: 1 },
// //             { hour: 18, dayOfWeek: 5, lat: 7.051, lng: 125.569, fare: 18, distance: 3 },
// //             { hour: 12, dayOfWeek: 0, lat: 7.076, lng: 125.616, fare: 12, distance: 0.5 },
// //         ];

// //         return samples.map(sample => ({
// //             ...sample,
// //             ...this.predict(sample.hour, sample.dayOfWeek, sample.lat, sample.lng, sample.fare, sample.distance)
// //         }));
// //     }
// // }

// // module.exports = CongestionPredictor;

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
//     }

//     // Extract features for passenger demand prediction
//     extractDemandFeatures(trips) {
//         const areaHourlyDemand = {};
        
//         // Aggregate passenger demand by area and time
//         trips.forEach(trip => {
//             const date = parseISO(trip.created_at);
//             const hour = date.getHours();
//             const dayOfWeek = date.getDay();
//             const areaKey = `${Math.round(trip.start_lat * 1000)},${Math.round(trip.start_lng * 1000)}`;
//             const timeKey = `${dayOfWeek},${hour},${areaKey}`;
            
//             if (!areaHourlyDemand[timeKey]) {
//                 areaHourlyDemand[timeKey] = {
//                     totalPassengers: 0,
//                     tripCount: 0,
//                     hour: hour,
//                     dayOfWeek: dayOfWeek,
//                     lat: Math.round(trip.start_lat * 1000) / 1000,
//                     lng: Math.round(trip.start_lng * 1000) / 1000,
//                     passengerCounts: []
//                 };
//             }
            
//             areaHourlyDemand[timeKey].totalPassengers += trip.passenger_count;
//             areaHourlyDemand[timeKey].tripCount++;
//             areaHourlyDemand[timeKey].passengerCounts.push(trip.passenger_count);
//         });

//         // Convert to ML features
//         const features = [];
//         Object.keys(areaHourlyDemand).forEach(key => {
//             const data = areaHourlyDemand[key];
//             const avgPassengers = data.totalPassengers / data.tripCount;
            
//             features.push({
//                 // Temporal features
//                 hour: data.hour,
//                 dayOfWeek: data.dayOfWeek,
//                 month: new Date().getMonth(),
                
//                 // Spatial features
//                 area_lat: data.lat,
//                 area_lng: data.lng,
                
//                 // Demand features
//                 total_passengers: data.totalPassengers,
//                 avg_passengers: avgPassengers,
//                 trips_count: data.tripCount,
//                 max_passengers: Math.max(...data.passengerCounts),
                
//                 // Target variable (passenger demand)
//                 passenger_demand: avgPassengers,
                
//                 // Derived features
//                 isWeekend: [0, 6].includes(data.dayOfWeek) ? 1 : 0,
//                 isRushHour: this.isRushHour(data.hour) ? 1 : 0,
//                 isPeakHour: this.isPeakHour(data.hour, data.dayOfWeek) ? 1 : 0
//             });
//         });

//         return features;
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
//         await this.buildModel(12);
        
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
//             return distance < 2.0; // 2km radius from actual training areas
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

//     estimateFeatures(hour, dayOfWeek, lat, lng) {
//         const isRush = this.isRushHour(hour);
//         const isWeekend = [0, 6].includes(dayOfWeek);
        
//         let basePassengers = 8;
//         if (isRush) basePassengers = 15;
//         if (isWeekend) basePassengers = 12;
        
//         return {
//             total_passengers: basePassengers * 3,
//             avg_passengers: basePassengers,
//             trips_count: 3,
//             max_passengers: basePassengers + 5
//         };
//     }

//     calculateConfidence(predictedDemand, hour, dayOfWeek, lat, lng) {
//         let confidence = 0.7;
        
//         if (this.isRushHour(hour)) confidence += 0.2;
//         if (this.isPeakHour(hour, dayOfWeek)) confidence += 0.1;
        
//         if (predictedDemand < 0 || predictedDemand > 50) confidence -= 0.3;
        
//         return Math.max(0.1, Math.min(0.95, confidence));
//     }

//     getDemandLevel(passengerCount) {
//         if (passengerCount === 0) return 'No Demand';
//         if (passengerCount <= 5) return 'Very Low Demand';
//         if (passengerCount <= 10) return 'Low Demand';
//         if (passengerCount <= 20) return 'Medium Demand';
//         if (passengerCount <= 30) return 'High Demand';
//         return 'Very High Demand';
//     }

//     getAvailableDataCount(hour, dayOfWeek) {
//         if (!this.trainingData) return 0;
//         return this.trainingData.filter(item => 
//             item.hour === hour && item.dayOfWeek === dayOfWeek
//         ).length;
//     }

//     getDayName(dayOfWeek) {
//         const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         return days[dayOfWeek] || 'Unknown';
//     }
// }

// module.exports = PassengerDemandPredictor;

// ml-service.js - PURE DATA-DRIVEN VERSION
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

    // Extract features from ACTUAL database data
    extractDemandFeatures(trips) {
        const areaHourlyDemand = {};
        
        // Analyze ALL trip data from database
        trips.forEach(trip => {
           const utcDate = parseISO(trip.created_at);
           const phTime = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
           const hour = phTime.getHours();
           const dayOfWeek = phTime.getDay();
        
           const areaKey = `${Math.round(trip.start_lat * 1000)},${Math.round(trip.start_lng * 1000)}`;
           const timeKey = `${dayOfWeek},${hour},${areaKey}`;
            
            if (!areaHourlyDemand[timeKey]) {
                areaHourlyDemand[timeKey] = {
                    totalPassengers: 0,
                    tripCount: 0,
                    hour: hour,
                    dayOfWeek: dayOfWeek,
                    lat: Math.round(trip.start_lat * 1000) / 1000,
                    lng: Math.round(trip.start_lng * 1000) / 1000,
                    passengerCounts: [],
                    fareTotal: 0,
                    distanceTotal: 0
                };
            }
            
            areaHourlyDemand[timeKey].totalPassengers += trip.passenger_count;
            areaHourlyDemand[timeKey].tripCount++;
            areaHourlyDemand[timeKey].passengerCounts.push(trip.passenger_count);
            areaHourlyDemand[timeKey].fareTotal += trip.fare_amount || 12;
            areaHourlyDemand[timeKey].distanceTotal += trip.total_distance_km || 0;
        });

        // Convert to ML features - ONLY FROM ACTUAL DATA
        const features = [];
        Object.keys(areaHourlyDemand).forEach(key => {
            const data = areaHourlyDemand[key];
            const avgPassengers = data.totalPassengers / data.tripCount;
            const avgFare = data.fareTotal / data.tripCount;
            const avgDistance = data.distanceTotal / data.tripCount;
            
            features.push({
                // Temporal features FROM DATA
                hour: data.hour,
                dayOfWeek: data.dayOfWeek,
                month: new Date().getMonth(),
                
                // Spatial features FROM DATA
                area_lat: data.lat,
                area_lng: data.lng,
                
                // Demand features FROM DATA
                total_passengers: data.totalPassengers,
                avg_passengers: avgPassengers,
                trips_count: data.tripCount,
                max_passengers: Math.max(...data.passengerCounts),
                avg_fare: avgFare,
                avg_distance: avgDistance,
                passenger_variance: this.calculateVariance(data.passengerCounts),
                
                // Target variable (passenger demand) FROM DATA
                passenger_demand: avgPassengers,
                
                // Derived features FROM DATA
                isWeekend: [0, 6].includes(data.dayOfWeek) ? 1 : 0,
                isRushHour: this.isRushHour(data.hour) ? 1 : 0,
                isPeakHour: this.isPeakHour(data.hour, data.dayOfWeek) ? 1 : 0
            });
        });

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
        
        // Store training data and areas
        this.trainingData = features;
        this.trainingAreas = this.extractUniqueAreas(features);
        
        console.log(`📍 Training on ${this.trainingAreas.length} unique areas from database`);

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
        
        const hasSufficientData = matchingData.length >= 2;
        
        console.log(`📊 ML Data check for ${this.getDayName(dayOfWeek)} ${hour}:00 - ${matchingData.length} data points`);
        
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
                reason: `ML has no training data for ${this.getDayName(dayOfWeek)} ${hour}:00`
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
                reason: `Based on ${this.getAvailableDataCount(hour, dayOfWeek)} training data points`
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
