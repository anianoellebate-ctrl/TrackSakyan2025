const JeepneyDensityPredictor = require('../utils/jeepney-ml-service');
const { supabase } = require('../database');
const JeepneyAIAssistant = require('../utils/ai-assistant-service');

class JeepneyDensityController {
    constructor() {
        this.predictor = new JeepneyDensityPredictor();
        this.aiAssistant = new JeepneyAIAssistant(this);
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('🚐 Initializing Jeepney Density ML System...');
            const trips = await this.fetchHistoricalTrips(500);
            
            if (trips.length > 0) {
                await this.predictor.train(trips);
                this.isInitialized = true;
                console.log(`✅ Jeepney Density ML System ready! Analyzed ${trips.length} trips`);
            } else {
                console.log('⚠️ No historical data available');
                this.isInitialized = true;
            }
            
            return { success: true, tripCount: trips.length };
        } catch (error) {
            console.error('❌ Jeepney density ML initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    async fetchHistoricalTrips(limit = 500) {
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

    async predictDensity(req, res) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const { hour, dayOfWeek, lat, lng } = req.body;

            if (!hour || !dayOfWeek || !lat || !lng) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: hour, dayOfWeek, lat, lng'
                });
            }

            const prediction = this.predictor.predict(
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
            console.error('Jeepney density prediction error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async debugTrainingData(req, res) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
    
            const trainingData = this.predictor.trainingData || [];
            
            // Find all Thursday data
            const thursdayData = trainingData.filter(item => item.dayOfWeek === 4);
            
            // Get unique hours for Thursday
            const thursdayHours = [...new Set(thursdayData.map(item => item.hour))].sort((a, b) => a - b);
            
            // Detailed breakdown
            const hourBreakdown = {};
            thursdayData.forEach(item => {
                const key = `Hour ${item.hour}`;
                if (!hourBreakdown[key]) {
                    hourBreakdown[key] = {
                        entries: 0,
                        totalTrips: 0,
                        areas: []
                    };
                }
                hourBreakdown[key].entries++;
                hourBreakdown[key].totalTrips += item.total_trips;
                hourBreakdown[key].areas.push(`(${item.area_lat}, ${item.area_lng})`);
            });
    
            res.json({
                success: true,
                total_training_points: trainingData.length,
                thursday_training_points: thursdayData.length,
                thursday_hours_available: thursdayHours,
                thursday_hour_breakdown: hourBreakdown,
                sample_thursday_entries: thursdayData.slice(0, 5).map(item => ({
                    hour: item.hour,
                    area: `(${item.area_lat}, ${item.area_lng})`,
                    trips: item.total_trips,
                    jeepneys: item.jeepney_count
                }))
            });
    
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // NEW: City-wide analysis endpoint
    async analyzeCitywide(req, res) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const { hour, dayOfWeek } = req.body || {};
            // const currentTime = new Date();
            // const targetHour = hour !== undefined ? parseInt(hour) : currentTime.getHours();
            // const targetDay = dayOfWeek !== undefined ? parseInt(dayOfWeek) : currentTime.getDay();

            // console.log(`🎯 City-wide analysis requested for ${targetHour}:00`);

            const currentTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"});
            const phTime = new Date(currentTime);
            
            const targetHour = hour !== undefined ? parseInt(hour) : phTime.getHours();
            const targetDay = dayOfWeek !== undefined ? parseInt(dayOfWeek) : phTime.getDay();
    
            console.log(`🎯 City-wide analysis requested for ${targetHour}:00 (PH Time)`);

            const citywideAnalysis = this.predictor.analyzeCitywideDensity(targetHour, targetDay);

            res.json({
                success: true,
                analysis: {
                    timestamp: new Date().toISOString(),
                    hour: targetHour,
                    dayOfWeek: targetDay,
                    dayName: this.getDayName(targetDay),
                    areasAnalyzed: citywideAnalysis.length,
                    predictions: citywideAnalysis
                }
            });

        } catch (error) {
            console.error('City-wide analysis error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // AI Assistant endpoint
    async askAI(req, res) {
        try {
            const { hour, dayOfWeek } = req.body || {};
            
            console.log('🎯 AI Assistant endpoint called');
            
            // Ensure ML is initialized
            if (!this.isInitialized) {
                await this.initialize();
            }

            const currentTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"});
            const phTime = new Date(currentTime);
            
            const targetHour = hour !== undefined ? parseInt(hour) : phTime.getHours();
            const targetDay = dayOfWeek !== undefined ? parseInt(dayOfWeek) : phTime.getDay();
    
            const aiReport = await this.aiAssistant.generateDensityReport(targetHour, targetDay);

            if (aiReport.success) {
                res.json({
                    success: true,
                    ...aiReport,
                    system_info: {
                        analysis_type: 'city_wide_ml_analysis',
                        areas_analyzed: aiReport.mlStats?.areasAnalyzed || 0,
                        ml_method: 'neural_network'
                    }
                });
            } else {
                res.status(400).json(aiReport);
            }

        } catch (error) {
            console.error('AI Assistant endpoint error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                voiceResponse: "The AI assistant is currently unavailable."
            });
        }
    }

    async getSamplePredictions(req, res) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const samples = [
                { hour: 8, dayOfWeek: 1, lat: 7.051, lng: 125.569 },
                { hour: 18, dayOfWeek: 5, lat: 7.051, lng: 125.569 },
                { hour: 14, dayOfWeek: 3, lat: 7.076, lng: 125.616 }
            ];

            const predictions = samples.map(sample => ({
                ...sample,
                ...this.predictor.predict(sample.hour, sample.dayOfWeek, sample.lat, sample.lng)
            }));

            res.json({
                success: true,
                samples: predictions
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getStatus(req, res) {
        try {
            const trips = await this.fetchHistoricalTrips(50);

            res.json({
                success: true,
                status: {
                    initialized: this.isInitialized,
                    model_trained: this.predictor.isTrained,
                    recent_trips: trips.length,
                    training_areas: this.predictor.trainingAreas ? this.predictor.trainingAreas.length : 0,
                    prediction_method: this.predictor.model ? 'neural_network' : 'statistical'
                }
            });

        } catch (error) {
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

module.exports = JeepneyDensityController;
