// ai-assistant-service.js - Passenger Congestion Version
class PassengerCongestionAIAssistant {
    constructor(congestionController) {
        this.congestionController = congestionController;
        this.mapboxToken = 'pk.eyJ1IjoibWFyY2FuaWEiLCJhIjoiY21lbDNyZXpjMGRuOTJpb285YmY2aDlscCJ9.udUoHaHGJ_-XDF7uVJB5Zg';
    }

    async generateCongestionReport(hour = null, dayOfWeek = null) {
        try {
            const currentTime = new Date();
            const targetHour = hour !== null ? hour : currentTime.getHours();
            const targetDay = dayOfWeek !== null ? dayOfWeek : currentTime.getDay();
            
            console.log(`🤖 AI Assistant: Passenger Congestion Analysis for ${targetHour}:00`);

            // Ensure ML is trained
            await this.ensureModelTrained();

            // Get PURE ML city-wide analysis
            const citywideAnalysis = this.congestionController.predictor.analyzeCitywidePassengerDemand(
                targetHour, targetDay
            );
            
            if (citywideAnalysis.length === 0) {
                return {
                    success: false,
                    voiceResponse: "The neural network cannot generate congestion predictions with current training data.",
                    report: "ML model unavailable"
                };
            }

            console.log(`📍 Geocoding ${citywideAnalysis.length} congestion predictions`);

            // Geocode the ML predictions
            const analysisWithPlaces = await this.addPlaceNamesToPredictions(citywideAnalysis);
            
            // Categorize PURE ML results by congestion levels
            const categorized = this.categorizeCongestionPredictions(analysisWithPlaces);
            
            // Generate AI report from PURE ML only
            const report = this.generateCongestionMLReport(categorized, targetHour, targetDay);

            return {
                success: true,
                ...report,
                categorizedAreas: categorized,
                mlStats: {
                    areasAnalyzed: citywideAnalysis.length,
                    analysisTime: `${targetHour}:00`,
                    dataSource: 'Machine Learning',
                    mlMethod: 'Neural Network',
                    geocodingProvider: 'Mapbox',
                    totalPassengerDemand: categorized.highDemand.reduce((sum, area) => sum + area.predicted_passengers, 0) +
                                        categorized.mediumDemand.reduce((sum, area) => sum + area.predicted_passengers, 0) +
                                        categorized.lowDemand.reduce((sum, area) => sum + area.predicted_passengers, 0)
                },
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('AI Assistant error:', error);
            return {
                success: false,
                voiceResponse: "The passenger congestion prediction system is currently unavailable."
            };
        }
    }

    // async ensureModelTrained() {
    //     if (!this.congestionController.isInitialized || !this.congestionController.predictor.isTrained) {
    //         console.log('🔄 ML Model not trained. Training now...');
    //         await this.congestionController.initialize();
    //     }
    //     return true;
    // }

    async ensureModelTrained() {
    if (!this.congestionController.isInitialized || !this.congestionController.predictor.isTrained) {
        console.log('🔄 ML Model not trained. Training now...');
        const initResult = await this.congestionController.initialize();
        if (!initResult.trained) {
            throw new Error('Cannot train ML model: No historical data available');
        }
    }
    return true;
}

    categorizeCongestionPredictions(predictions) {
        return {
            highDemand: predictions.filter(p => 
                p.demand_level === 'High Demand' || p.demand_level === 'Very High Demand'
            ),
            mediumDemand: predictions.filter(p => 
                p.demand_level === 'Medium Demand'
            ),
            lowDemand: predictions.filter(p => 
                p.demand_level === 'Low Demand' || p.demand_level === 'Very Low Demand'
            ),
            noDemand: predictions.filter(p => 
                p.demand_level === 'No Demand' || p.method === 'no_training_data'
            ),
            noData: predictions.filter(p => 
                p.method === 'no_training_data'
            )
        };
    }

    generateCongestionMLReport(categorized, hour, dayOfWeek) {
        const dayName = this.getDayName(dayOfWeek);
        const totalAreas = categorized.highDemand.length + categorized.mediumDemand.length + 
                          categorized.lowDemand.length + categorized.noDemand.length;
        
        // COUNT ACTUAL ML PREDICTIONS vs NO-DATA
        const mlPredictions = categorized.highDemand.length + categorized.mediumDemand.length + categorized.lowDemand.length;
        const totalPredictedPassengers = categorized.highDemand.reduce((sum, area) => sum + area.predicted_passengers, 0) +
                                       categorized.mediumDemand.reduce((sum, area) => sum + area.predicted_passengers, 0) +
                                       categorized.lowDemand.reduce((sum, area) => sum + area.predicted_passengers, 0);
       
        // HONEST VOICE RESPONSE
        let voiceResponse;
        if (mlPredictions === 0) {
            voiceResponse = `I have no machine learning data for passenger congestion on ${dayName} ${hour}:00. The neural network cannot make predictions without historical passenger patterns.`;
        } else {
            voiceResponse = `Based on passenger demand analysis for ${dayName} ${hour}:00: `;
            
            // Include ALL congestion levels in voice response
            const parts = [];
            
            if (categorized.highDemand.length > 0) {
                const areas = categorized.highDemand.map(a => a.placeName).slice(0, 2).join(', ');
                const avgPassengers = Math.round(categorized.highDemand.reduce((sum, area) => sum + area.predicted_passengers, 0) / categorized.highDemand.length);
                parts.push(`high passenger demand in ${areas} with average ${avgPassengers} passengers`);
            }

            if (categorized.mediumDemand.length > 0) {
                const areas = categorized.mediumDemand.map(a => a.placeName).slice(0, 2).join(', ');
                parts.push(`medium demand in ${areas}`);
            }

            if (categorized.lowDemand.length > 0) {
                const areas = categorized.lowDemand.map(a => a.placeName).slice(0, 2).join(', ');
                parts.push(`low demand in ${areas}`);
            }

            if (parts.length > 0) {
                if (parts.length === 1) {
                    voiceResponse += `Neural network predicts ${parts[0]}. `;
                } else if (parts.length === 2) {
                    voiceResponse += `Neural network predicts ${parts[0]} and ${parts[1]}. `;
                } else {
                    voiceResponse += `Neural network predicts ${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}. `;
                }
            }

            // Add congestion insights
            if (totalPredictedPassengers > 100) {
                voiceResponse += `Overall, expecting high passenger congestion across the city. `;
            } else if (totalPredictedPassengers > 50) {
                voiceResponse += `Moderate passenger levels expected. `;
            } else {
                voiceResponse += `Generally light passenger traffic expected. `;
            }

            voiceResponse += `Note: Predictions are based on limited historical passenger data.`;
        }

        // HONEST TEXT REPORT
        let textReport = `🧠 PASSENGER CONGESTION ML REPORT\n`;
        textReport += `Time: ${dayName} ${hour}:00\n`;
        textReport += `Status: ${mlPredictions > 0 ? 'LIMITED DATA' : 'NO DATA AVAILABLE'}\n`;
        textReport += `ML Predictions: ${mlPredictions} areas\n`;
        textReport += `Total Predicted Passengers: ${totalPredictedPassengers}\n`;

        if (mlPredictions === 0) {
            textReport += `\n❌ NO CONGESTION PREDICTIONS POSSIBLE\n`;
            textReport += `The neural network has no training data for ${dayName} ${hour}:00.\n`;
            textReport += `ML requires historical passenger patterns to make predictions.\n`;
            textReport += `\nConsider using real-time passenger data instead of ML predictions.`;
        } else {
            textReport += `\n⚠️ LIMITED CONFIDENCE CONGESTION PREDICTIONS\n`;
            textReport += `Based on sparse passenger data for this time period.\n\n`;
            
            // Show ALL congestion levels in text report
            if (categorized.highDemand.length > 0) {
                textReport += `🚨 HIGH PASSENGER DEMAND (Limited ML Prediction):\n`;
                categorized.highDemand.forEach(area => {
                    textReport += `• ${area.placeName} - ${area.predicted_passengers} passengers (${Math.round(area.confidence * 100)}% confidence)\n`;
                });
                textReport += `\n`;
            }

            if (categorized.mediumDemand.length > 0) {
                textReport += `🟡 MEDIUM DEMAND (Limited ML Prediction):\n`;
                categorized.mediumDemand.slice(0, 5).forEach(area => {
                    textReport += `• ${area.placeName} - ${area.predicted_passengers} passengers\n`;
                });
                textReport += `\n`;
            }

            if (categorized.lowDemand.length > 0) {
                textReport += `🟢 LOW DEMAND (Limited ML Prediction):\n`;
                categorized.lowDemand.slice(0, 5).forEach(area => {
                    textReport += `• ${area.placeName} - ${area.predicted_passengers} passengers\n`;
                });
                textReport += `\n`;
            }

            if (categorized.noDemand.length > 0) {
                textReport += `🚫 NO DEMAND (Limited ML Prediction):\n`;
                categorized.noDemand.slice(0, 3).forEach(area => {
                    textReport += `• ${area.placeName} - ${area.reason || 'No passengers predicted'}\n`;
                });
                textReport += `\n`;
            }

            if (categorized.noData.length > 0) {
                textReport += `❓ NO TRAINING DATA:\n`;
                categorized.noData.slice(0, 3).forEach(area => {
                    textReport += `• ${area.placeName} - ${area.reason}\n`;
                });
                textReport += `\n`;
            }

            // Add congestion summary
            textReport += `📊 CONGESTION SUMMARY:\n`;
            textReport += `• High Demand Areas: ${categorized.highDemand.length}\n`;
            textReport += `• Medium Demand Areas: ${categorized.mediumDemand.length}\n`;
            textReport += `• Low Demand Areas: ${categorized.lowDemand.length}\n`;
            textReport += `• Total Predicted Passengers: ${totalPredictedPassengers}\n\n`;

            textReport += `⚠️ NOTE: These congestion predictions are based on very limited training data and should be used with caution.`;
        }

        return {
            voiceResponse: voiceResponse.trim(),
            textReport: textReport.trim(),
            hour: hour,
            dayOfWeek: dayOfWeek,
            dayName: dayName,
            hasData: mlPredictions > 0,
            stats: {
                totalAreas: totalAreas,
                highDemand: categorized.highDemand.length,
                mediumDemand: categorized.mediumDemand.length,
                lowDemand: categorized.lowDemand.length,
                noDemand: categorized.noDemand.length,
                mlPredictions: mlPredictions,
                totalPassengers: totalPredictedPassengers
            }
        };
    }

    async addPlaceNamesToPredictions(predictions) {
        const predictionsWithPlaces = [];
        
        for (const prediction of predictions) {
            try {
                const placeName = await this.reverseGeocodeWithMapbox(prediction.lat, prediction.lng);
                predictionsWithPlaces.push({
                    ...prediction,
                    placeName: placeName
                });
                
                console.log(`📍 Congestion Prediction: (${prediction.lat}, ${prediction.lng}) → ${placeName} [${prediction.demand_level}]`);
                
            } catch (error) {
                console.error(`❌ Mapbox failed for congestion prediction (${prediction.lat}, ${prediction.lng}):`, error.message);
                
                // Fallback to OpenStreetMap
                try {
                    const fallbackName = await this.reverseGeocodeWithOSM(prediction.lat, prediction.lng);
                    predictionsWithPlaces.push({
                        ...prediction,
                        placeName: fallbackName
                    });
                } catch (fallbackError) {
                    predictionsWithPlaces.push({
                        ...prediction,
                        placeName: `Area (${prediction.lat.toFixed(3)}, ${prediction.lng.toFixed(3)})`
                    });
                }
            }
        }
        
        return predictionsWithPlaces;
    }

    async reverseGeocodeWithMapbox(lat, lng) {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxToken}&limit=1`
            );
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Mapbox API error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                return feature.place_name || feature.text || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            }
            
            throw new Error('No Mapbox results found');
            
        } catch (error) {
            console.error('Mapbox geocoding error:', error.message);
            throw error;
        }
    }

    async reverseGeocodeWithOSM(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
            );
            
            const data = await response.json();
            
            if (data.address) {
                return data.address.road || 
                       data.address.neighbourhood || 
                       data.address.suburb || 
                       data.address.city_district || 
                       `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
            }
            
            return `Area (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
        } catch (error) {
            throw new Error(`OSM geocoding failed: ${error.message}`);
        }
    }

    getDayName(dayOfWeek) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek] || 'Unknown';
    }
}

module.exports = PassengerCongestionAIAssistant;