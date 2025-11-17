// // congestion-controller.js
// const CongestionPredictor = require('../utils/ml-service');
// const { supabase } = require('../database');

// class CongestionController {
//     constructor() {
//         this.predictor = new CongestionPredictor();
//         this.isInitialized = false;
//     }

//     async initialize() {
//         try {
//             console.log('🚀 Initializing Congestion Prediction System...');
//             const trips = await this.fetchHistoricalTrips(500);
            
//             if (trips.length > 0) {
//                 await this.predictor.train(trips);
//                 this.isInitialized = true;
//                 console.log(`✅ System ready! Analyzed ${trips.length} trips`);
//             } else {
//                 console.log('⚠️ No historical data available');
//                 this.isInitialized = true;
//             }
            
//             return { success: true, tripCount: trips.length };
//         } catch (error) {
//             console.error('❌ Initialization failed:', error);
//             return { success: false, error: error.message };
//         }
//     }

//     async fetchHistoricalTrips(limit = 500) {
//         try {
//             const { data: trips, error } = await supabase
//                 .from('trips')
//                 .select('*')
//                 .order('created_at', { ascending: false })
//                 .limit(limit);

//             if (error) throw error;
//             return trips || [];
//         } catch (error) {
//             console.error('Error fetching trips:', error);
//             return [];
//         }
//     }

//     async predictCongestion(req, res) {
//         try {
//             if (!this.isInitialized) {
//                 await this.initialize();
//             }

//             console.log('📨 Request body received:', req.body);

//             // ✅ BETTER ERROR HANDLING
//             if (!req.body || Object.keys(req.body).length === 0) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Request body is missing or empty. Please send JSON data with hour, dayOfWeek, lat, lng.'
//                 });
//             }

//             const { hour, dayOfWeek, lat, lng, fare, distance } = req.body;

//             // ✅ Validate required parameters exist
//             if (hour === undefined || dayOfWeek === undefined || lat === undefined || lng === undefined) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Missing required parameters: hour, dayOfWeek, lat, lng'
//                 });
//             }

//             const prediction = this.predictor.predict(
//                 parseInt(hour),
//                 parseInt(dayOfWeek),
//                 parseFloat(lat),
//                 parseFloat(lng),
//                 fare ? parseFloat(fare) : 12,
//                 distance ? parseFloat(distance) : 0
//             );

//             res.json({
//                 success: true,
//                 prediction: {
//                     ...prediction,
//                     timestamp: new Date().toISOString(),
//                     location: { lat: parseFloat(lat), lng: parseFloat(lng) },
//                     time_context: {
//                         hour: parseInt(hour),
//                         dayOfWeek: parseInt(dayOfWeek),
//                         dayName: this.getDayName(parseInt(dayOfWeek)),
//                         isRushHour: this.predictor.isRushHour(parseInt(hour))
//                     }
//                 }
//             });

//         } catch (error) {
//             console.error('Prediction error:', error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     async getSamplePredictions(req, res) {
//         try {
//             if (!this.isInitialized) {
//                 await this.initialize();
//             }

//             const samples = this.predictor.generateSamplePredictions();

//             res.json({
//                 success: true,
//                 samples,
//                 congestion_scale: {
//                     'Very Low': '1-5 passengers (4-20% capacity)',
//                     'Low': '6-15 passengers (24-60% capacity)', 
//                     'Medium': '16-22 passengers (64-88% capacity)',
//                     'High': '23-25 passengers (92-100% capacity)',
//                     'Overcrowded': '26+ passengers (unsafe)'
//                 },
//                 system_info: {
//                     method: this.predictor.model ? 'neural_network' : 'statistical_analysis',
//                     status: 'operational'
//                 }
//             });

//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     async getStatus(req, res) {
//         try {
//             const trips = await this.fetchHistoricalTrips(50);

//             res.json({
//                 success: true,
//                 status: {
//                     initialized: this.isInitialized,
//                     model_trained: this.predictor.isTrained,
//                     recent_trips: trips.length,
//                     prediction_method: this.predictor.model ? 'neural_network' : 'statistical_analysis',
//                     last_updated: new Date().toISOString()
//                 }
//             });

//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     async retrainModel(req, res) {
//         try {
//             console.log('🔄 Retraining model with latest data...');
            
//             const trips = await this.fetchHistoricalTrips(1000);
            
//             if (trips.length < 10) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Insufficient data for retraining. Need at least 10 trips.'
//                 });
//             }

//             await this.predictor.train(trips);
            
//             res.json({
//                 success: true,
//                 message: 'Model retrained successfully',
//                 trips_used: trips.length,
//                 retrained_at: new Date().toISOString()
//             });

//         } catch (error) {
//             console.error('Retraining error:', error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     getDayName(dayOfWeek) {
//         const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         return days[dayOfWeek] || 'Unknown';
//     }
// }

// module.exports = CongestionController;

// congestion-controller.js
// const PassengerDemandPredictor = require('../utils/ml-service'); // NEW
// const { supabase } = require('../database');

// class CongestionController {
//     constructor() {
//         this.predictor = new PassengerDemandPredictor(); // CHANGED
//         this.isInitialized = false;
//     }

//     async initialize() {
//         try {
//             console.log('🚀 Initializing Passenger Demand Prediction System...'); // UPDATED
//             const trips = await this.fetchHistoricalTrips(1000); // INCREASED LIMIT
            
//             if (trips.length > 0) {
//                 await this.predictor.train(trips);
//                 this.isInitialized = true;
//                 console.log(`✅ Passenger Demand System ready! Analyzed ${trips.length} trips`); // UPDATED
//             } else {
//                 console.log('⚠️ No historical data available');
//                 this.isInitialized = true;
//             }
            
//             return { success: true, tripCount: trips.length };
//         } catch (error) {
//             console.error('❌ Initialization failed:', error);
//             return { success: false, error: error.message };
//         }
//     }

//     async fetchHistoricalTrips(limit = 1000) { // INCREASED DEFAULT
//         try {
//             const { data: trips, error } = await supabase
//                 .from('trips')
//                 .select('*')
//                 .order('created_at', { ascending: false })
//                 .limit(limit);

//             if (error) throw error;
//             return trips || [];
//         } catch (error) {
//             console.error('Error fetching trips:', error);
//             return [];
//         }
//     }

//     // NEW: Passenger Demand Prediction Endpoint
//     async predictPassengerDemand(req, res) {
//         try {
//             if (!this.isInitialized) {
//                 await this.initialize();
//             }

//             console.log('📊 Passenger Demand Prediction Request:', req.body);

//             if (!req.body || Object.keys(req.body).length === 0) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Request body is missing. Send hour, dayOfWeek, lat, lng.'
//                 });
//             }

//             const { hour, dayOfWeek, lat, lng } = req.body;

//             if (hour === undefined || dayOfWeek === undefined || lat === undefined || lng === undefined) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Missing required parameters: hour, dayOfWeek, lat, lng'
//                 });
//             }

//             const prediction = this.predictor.predictPassengerDemand(
//                 parseInt(hour),
//                 parseInt(dayOfWeek),
//                 parseFloat(lat),
//                 parseFloat(lng)
//             );

//             res.json({
//                 success: true,
//                 prediction: {
//                     ...prediction,
//                     timestamp: new Date().toISOString(),
//                     location: { lat: parseFloat(lat), lng: parseFloat(lng) },
//                     time_context: {
//                         hour: parseInt(hour),
//                         dayOfWeek: parseInt(dayOfWeek),
//                         dayName: this.getDayName(parseInt(dayOfWeek)),
//                         isRushHour: this.predictor.isRushHour(parseInt(hour))
//                     }
//                 }
//             });

//         } catch (error) {
//             console.error('Passenger demand prediction error:', error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     // NEW: City-wide Passenger Demand Analysis
//     async analyzeCitywideDemand(req, res) {
//         try {
//             if (!this.isInitialized) {
//                 await this.initialize();
//             }

//             const { hour, dayOfWeek } = req.body || {};
//             const currentTime = new Date();
//             const targetHour = hour !== undefined ? parseInt(hour) : currentTime.getHours();
//             const targetDay = dayOfWeek !== undefined ? parseInt(dayOfWeek) : currentTime.getDay();

//             console.log(`🎯 City-wide passenger demand analysis for ${targetHour}:00`);

//             const citywideAnalysis = this.predictor.analyzeCitywidePassengerDemand(targetHour, targetDay);

//             // Sort by demand (highest first)
//             const sortedAnalysis = citywideAnalysis
//                 .filter(pred => pred.method === 'neural_network')
//                 .sort((a, b) => b.predicted_passengers - a.predicted_passengers);

//             res.json({
//                 success: true,
//                 analysis: {
//                     timestamp: new Date().toISOString(),
//                     hour: targetHour,
//                     dayOfWeek: targetDay,
//                     dayName: this.getDayName(targetDay),
//                     areas_analyzed: citywideAnalysis.length,
//                     ml_predictions: sortedAnalysis.length,
//                     highest_demand_areas: sortedAnalysis.slice(0, 10), // Top 10
//                     all_predictions: citywideAnalysis
//                 }
//             });

//         } catch (error) {
//             console.error('City-wide demand analysis error:', error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     // UPDATED: Keep your existing congestion prediction
//     async predictCongestion(req, res) {
//         try {
//             if (!this.isInitialized) {
//                 await this.initialize();
//             }

//             console.log('📨 Congestion Prediction Request:', req.body);

//             if (!req.body || Object.keys(req.body).length === 0) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Request body is missing or empty. Please send JSON data with hour, dayOfWeek, lat, lng.'
//                 });
//             }

//             const { hour, dayOfWeek, lat, lng, fare, distance } = req.body;

//             if (hour === undefined || dayOfWeek === undefined || lat === undefined || lng === undefined) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Missing required parameters: hour, dayOfWeek, lat, lng'
//                 });
//             }

//             // You might want to update this method in your predictor too
//             const prediction = this.predictor.predict(
//                 parseInt(hour),
//                 parseInt(dayOfWeek),
//                 parseFloat(lat),
//                 parseFloat(lng),
//                 fare ? parseFloat(fare) : 12,
//                 distance ? parseFloat(distance) : 0
//             );

//             res.json({
//                 success: true,
//                 prediction: {
//                     ...prediction,
//                     timestamp: new Date().toISOString(),
//                     location: { lat: parseFloat(lat), lng: parseFloat(lng) },
//                     time_context: {
//                         hour: parseInt(hour),
//                         dayOfWeek: parseInt(dayOfWeek),
//                         dayName: this.getDayName(parseInt(dayOfWeek)),
//                         isRushHour: this.predictor.isRushHour(parseInt(hour))
//                     }
//                 }
//             });

//         } catch (error) {
//             console.error('Congestion prediction error:', error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     // UPDATED: Sample predictions for passenger demand
//     async getSamplePredictions(req, res) {
//         try {
//             if (!this.isInitialized) {
//                 await this.initialize();
//             }

//             // Create sample predictions using the new ML system
//             const samples = [
//                 { hour: 8, dayOfWeek: 1, lat: 7.051, lng: 125.569 },
//                 { hour: 14, dayOfWeek: 3, lat: 7.051, lng: 125.569 },
//                 { hour: 18, dayOfWeek: 5, lat: 7.051, lng: 125.569 },
//                 { hour: 12, dayOfWeek: 0, lat: 7.076, lng: 125.616 },
//             ].map(sample => ({
//                 ...sample,
//                 ...this.predictor.predictPassengerDemand(sample.hour, sample.dayOfWeek, sample.lat, sample.lng)
//             }));

//             res.json({
//                 success: true,
//                 samples,
//                 demand_scale: {
//                     'No Demand': '0 passengers',
//                     'Very Low Demand': '1-5 passengers',
//                     'Low Demand': '6-10 passengers', 
//                     'Medium Demand': '11-20 passengers',
//                     'High Demand': '21-30 passengers',
//                     'Very High Demand': '31+ passengers'
//                 },
//                 system_info: {
//                     method: this.predictor.demandModel ? 'neural_network' : 'statistical_analysis',
//                     status: 'operational',
//                     areas_trained: this.predictor.trainingAreas ? this.predictor.trainingAreas.length : 0
//                 }
//             });

//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     // UPDATED: Status endpoint
//     async getStatus(req, res) {
//         try {
//             const trips = await this.fetchHistoricalTrips(100);

//             res.json({
//                 success: true,
//                 status: {
//                     initialized: this.isInitialized,
//                     model_trained: this.predictor.isTrained,
//                     recent_trips: trips.length,
//                     training_areas: this.predictor.trainingAreas ? this.predictor.trainingAreas.length : 0,
//                     prediction_method: this.predictor.demandModel ? 'neural_network' : 'statistical_analysis',
//                     last_updated: new Date().toISOString(),
//                     system_type: 'passenger_demand_ml' // NEW
//                 }
//             });

//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     // UPDATED: Retrain with more data
//     async retrainModel(req, res) {
//         try {
//             console.log('🔄 Retraining Passenger Demand Model with latest data...');
            
//             const trips = await this.fetchHistoricalTrips(2000); // INCREASED
            
//             if (trips.length < 10) {
//                 return res.status(400).json({
//                     success: false,
//                     error: 'Insufficient data for retraining. Need at least 10 trips.'
//                 });
//             }

//             await this.predictor.train(trips);
            
//             res.json({
//                 success: true,
//                 message: 'Passenger Demand Model retrained successfully',
//                 trips_used: trips.length,
//                 areas_analyzed: this.predictor.trainingAreas ? this.predictor.trainingAreas.length : 0,
//                 retrained_at: new Date().toISOString()
//             });

//         } catch (error) {
//             console.error('Retraining error:', error);
//             res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }

//     getDayName(dayOfWeek) {
//         const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         return days[dayOfWeek] || 'Unknown';
//     }
// }

// module.exports = CongestionController;

// congestion.controller.js - UPDATED
const PassengerDemandPredictor = require('../utils/ml-service');
const PassengerCongestionAIAssistant = require('../utils/pass-ai-assistant-service');
const { supabase } = require('../database');

class CongestionController {
    constructor() {
        this.predictor = new PassengerDemandPredictor();
        this.aiAssistant = new PassengerCongestionAIAssistant(this);
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Passenger Demand Prediction System...');
            const trips = await this.fetchHistoricalTrips(1000);
            
            if (trips.length > 0) {
                await this.predictor.train(trips);
                this.isInitialized = true;
                console.log(`✅ Passenger Demand System ready! Analyzed ${trips.length} trips`);
            } else {
                console.log('⚠️ No historical data available');
                this.isInitialized = false;  // ← FIX: Don't mark as initialized without training
                return { success: false, error: 'No training data available', trained: false };
            }
            
            return { success: true, tripCount: trips.length };
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    async fetchHistoricalTrips(limit = 1000) {
        try {
            const { data: trips, error } = await supabase
                .from('trips')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return trips || [];
        } catch (error) {
            console.error('Error fetching trips:', error);
            return [];
        }
    }

    // Passenger Demand Prediction Endpoint
    async predictPassengerDemand(req, res) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log('📊 Passenger Demand Prediction Request:', req.body);

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Request body is missing. Send hour, dayOfWeek, lat, lng.'
                });
            }

            const { hour, dayOfWeek, lat, lng } = req.body;

            if (hour === undefined || dayOfWeek === undefined || lat === undefined || lng === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: hour, dayOfWeek, lat, lng'
                });
            }

            const prediction = this.predictor.predictPassengerDemand(
                parseInt(hour),
                parseInt(dayOfWeek),
                parseFloat(lat),
                parseFloat(lng)
            );

            res.json({
                success: true,
                prediction: {
                    ...prediction,
                    timestamp: new Date().toISOString(),
                    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    time_context: {
                        hour: parseInt(hour),
                        dayOfWeek: parseInt(dayOfWeek),
                        dayName: this.getDayName(parseInt(dayOfWeek)),
                        isRushHour: this.predictor.isRushHour(parseInt(hour))
                    }
                }
            });

        } catch (error) {
            console.error('Passenger demand prediction error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // City-wide Passenger Demand Analysis
    async analyzeCitywideDemand(req, res) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const { hour, dayOfWeek } = req.body || {};
            const currentTime = new Date();
            const targetHour = hour !== undefined ? parseInt(hour) : currentTime.getHours();
            const targetDay = dayOfWeek !== undefined ? parseInt(dayOfWeek) : currentTime.getDay();

            console.log(`🎯 City-wide passenger demand analysis for ${targetHour}:00`);

            const citywideAnalysis = this.predictor.analyzeCitywidePassengerDemand(targetHour, targetDay);

            // Sort by demand (highest first)
            const sortedAnalysis = citywideAnalysis
                .filter(pred => pred.method === 'neural_network')
                .sort((a, b) => b.predicted_passengers - a.predicted_passengers);

            res.json({
                success: true,
                analysis: {
                    timestamp: new Date().toISOString(),
                    hour: targetHour,
                    dayOfWeek: targetDay,
                    dayName: this.getDayName(targetDay),
                    areas_analyzed: citywideAnalysis.length,
                    ml_predictions: sortedAnalysis.length,
                    highest_demand_areas: sortedAnalysis.slice(0, 10),
                    all_predictions: citywideAnalysis
                }
            });

        } catch (error) {
            console.error('City-wide demand analysis error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // AI Assistant endpoint for passenger congestion
    async askAICongestion(req, res) {
        try {
            const { hour, dayOfWeek } = req.body || {};
            
            console.log('🎯 AI Congestion Assistant endpoint called');
            
            // // Ensure ML is initialized
            // if (!this.isInitialized) {
            //     await this.initialize();
            // }

             if (!this.isInitialized || !this.predictor.isTrained) {
            const initResult = await this.initialize();
            if (!initResult.trained) {
                return res.status(400).json({
                    success: false,
                    error: 'AI Assistant unavailable: No training data available',
                    voiceResponse: "I need historical trip data to provide congestion analysis. Please ensure trip data is available in the database."
                });
            }
        }

            const aiReport = await this.aiAssistant.generateCongestionReport(
                hour !== undefined ? parseInt(hour) : null,
                dayOfWeek !== undefined ? parseInt(dayOfWeek) : null
            );

            if (aiReport.success) {
                res.json({
                    success: true,
                    ...aiReport,
                    system_info: {
                        analysis_type: 'city_wide_passenger_congestion',
                        areas_analyzed: aiReport.mlStats?.areasAnalyzed || 0,
                        ml_method: 'neural_network',
                        total_predicted_passengers: aiReport.mlStats?.totalPassengerDemand || 0
                    }
                });
            } else {
                res.status(400).json(aiReport);
            }

        } catch (error) {
            console.error('AI Congestion Assistant endpoint error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                voiceResponse: "The passenger congestion AI assistant is currently unavailable."
            });
        }
    }

    // Sample predictions for passenger demand
    async getSamplePredictions(req, res) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Create sample predictions using the new ML system
            const samples = [
                { hour: 8, dayOfWeek: 1, lat: 7.051, lng: 125.569 },
                { hour: 14, dayOfWeek: 3, lat: 7.051, lng: 125.569 },
                { hour: 18, dayOfWeek: 5, lat: 7.051, lng: 125.569 },
                { hour: 12, dayOfWeek: 0, lat: 7.076, lng: 125.616 },
            ].map(sample => ({
                ...sample,
                ...this.predictor.predictPassengerDemand(sample.hour, sample.dayOfWeek, sample.lat, sample.lng)
            }));

            res.json({
                success: true,
                samples,
                demand_scale: {
                    'No Demand': '0 passengers',
                    'Very Low Demand': '1-5 passengers',
                    'Low Demand': '6-10 passengers', 
                    'Medium Demand': '11-20 passengers',
                    'High Demand': '21-30 passengers',
                    'Very High Demand': '31+ passengers'
                },
                system_info: {
                    method: this.predictor.demandModel ? 'neural_network' : 'statistical_analysis',
                    status: 'operational',
                    areas_trained: this.predictor.trainingAreas ? this.predictor.trainingAreas.length : 0
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Status endpoint
    async getStatus(req, res) {
        try {
            const trips = await this.fetchHistoricalTrips(100);

            res.json({
                success: true,
                status: {
                    initialized: this.isInitialized,
                    model_trained: this.predictor.isTrained,
                    recent_trips: trips.length,
                    training_areas: this.predictor.trainingAreas ? this.predictor.trainingAreas.length : 0,
                    prediction_method: this.predictor.demandModel ? 'neural_network' : 'statistical_analysis',
                    last_updated: new Date().toISOString(),
                    system_type: 'passenger_demand_ml'
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Retrain with more data
    async retrainModel(req, res) {
        try {
            console.log('🔄 Retraining Passenger Demand Model with latest data...');
            
            const trips = await this.fetchHistoricalTrips(2000);
            
            if (trips.length < 10) {
                return res.status(400).json({
                    success: false,
                    error: 'Insufficient data for retraining. Need at least 10 trips.'
                });
            }

            await this.predictor.train(trips);
            
            res.json({
                success: true,
                message: 'Passenger Demand Model retrained successfully',
                trips_used: trips.length,
                areas_analyzed: this.predictor.trainingAreas ? this.predictor.trainingAreas.length : 0,
                retrained_at: new Date().toISOString()
            });

        } catch (error) {
            console.error('Retraining error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    getDayName(dayOfWeek) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek] || 'Unknown';
    }
}

module.exports = CongestionController;