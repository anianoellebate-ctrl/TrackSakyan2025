// // ai-assistant-service.js
// class JeepneyAIAssistant {
//     constructor(densityController) {
//         this.densityController = densityController;
//     }

//     async generateDensityReport(hour = null, dayOfWeek = null) {
//         try {
//             const currentTime = new Date();
//             const targetHour = hour !== null ? hour : currentTime.getHours();
//             const targetDay = dayOfWeek !== null ? dayOfWeek : currentTime.getDay();
            
//             console.log(`🤖 AI Assistant analyzing PURE ML predictions for hour ${targetHour}, day ${targetDay}`);

//             // Generate grid points across the city
//             const gridPoints = this.generateCityGrid();
            
//             // Get predictions for ALL grid points using your ML model
//             const predictions = await this.getMLPredictionsForGrid(gridPoints, targetHour, targetDay);
            
//             if (predictions.length === 0) {
//                 return {
//                     success: false,
//                     voiceResponse: "The machine learning model cannot generate predictions at this time.",
//                     report: "ML model unavailable"
//                 };
//             }

//             console.log(`📊 ML Analysis: Got ${predictions.length} grid predictions from neural network`);

//             // Add place names to ML results
//             const predictionsWithPlaces = await this.addPlaceNamesToPredictions(predictions);
            
//             // Categorize PURE ML predictions
//             const categorized = this.categorizePredictions(predictionsWithPlaces);
            
//             // Generate report from PURE ML data only
//             const report = await this.generateMLBasedReport(categorized, targetHour, targetDay);

//             return {
//                 success: true,
//                 ...report,
//                 categorizedAreas: categorized,
//                 mlStats: {
//                     totalGridPoints: predictions.length,
//                     highDensityPoints: categorized.highDensity.length,
//                     mediumDensityPoints: categorized.mediumDensity.length,
//                     lowDensityPoints: categorized.lowDensity.length,
//                     noServicePoints: categorized.noService.length,
//                     mlMethod: predictions[0]?.method || 'neural_network'
//                 },
//                 timestamp: new Date().toISOString()
//             };

//         } catch (error) {
//             console.error('AI Assistant error:', error);
//             return {
//                 success: false,
//                 error: error.message,
//                 voiceResponse: "The machine learning system is currently unavailable."
//             };
//         }
//     }

//     // Generate grid points across Davao City
//     generateCityGrid() {
//         const gridPoints = [];
        
//         // Davao City bounds (approximate)
//         const minLat = 6.95;
//         const maxLat = 7.20;
//         const minLng = 125.45;
//         const maxLng = 125.70;
        
//         // Create a grid (5x5 points across the city)
//         const latStep = (maxLat - minLat) / 4;
//         const lngStep = (maxLng - minLng) / 4;
        
//         for (let latIndex = 0; latIndex < 5; latIndex++) {
//             for (let lngIndex = 0; lngIndex < 5; lngIndex++) {
//                 const lat = minLat + (latIndex * latStep);
//                 const lng = minLng + (lngIndex * lngStep);
                
//                 gridPoints.push({
//                     lat: parseFloat(lat.toFixed(4)),
//                     lng: parseFloat(lng.toFixed(4)),
//                     isGridPoint: true
//                 });
//             }
//         }
        
//         console.log(`📍 Generated ${gridPoints.length} ML grid points across Davao City`);
//         return gridPoints;
//     }

//     // Get predictions ONLY from your neural network
//     async getMLPredictionsForGrid(gridPoints, hour, dayOfWeek) {
//         const predictions = [];
        
//         for (const point of gridPoints) {
//             try {
//                 // This calls YOUR actual ML predictor
//                 const prediction = this.densityController.predictor.predict(
//                     hour, 
//                     dayOfWeek, 
//                     point.lat, 
//                     point.lng
//                 );
                
//                 console.log(`🧠 ML Prediction for (${point.lat}, ${point.lng}): ${prediction.jeepney_count} jeepneys, ${prediction.density_level}, method: ${prediction.method}`);
                
//                 predictions.push({
//                     lat: point.lat,
//                     lng: point.lng,
//                     isGridPoint: true,
//                     density_level: prediction.density_level,
//                     jeepney_count: prediction.jeepney_count,
//                     confidence: prediction.confidence,
//                     method: prediction.method,
//                     raw_prediction: prediction.raw_prediction,
//                     reason: prediction.reason
//                 });
//             } catch (error) {
//                 console.log(`❌ ML prediction failed for grid point (${point.lat}, ${point.lng}):`, error.message);
//             }
//         }
        
//         return predictions;
//     }

//     categorizePredictions(predictions) {
//         return {
//             highDensity: predictions.filter(p => 
//                 p.density_level === 'Jeepney Congestion' || p.density_level === 'Many Jeepneys'
//             ),
//             mediumDensity: predictions.filter(p => 
//                 p.density_level === 'Few Jeepneys'
//             ),
//             lowDensity: predictions.filter(p => 
//                 p.density_level === 'Single Jeepney'
//             ),
//             noService: predictions.filter(p => 
//                 p.density_level === 'No Jeepneys'
//             )
//         };
//     }

//     // Generate report from ML results
//     async generateMLBasedReport(categorized, hour, dayOfWeek) {
//         const dayName = this.getDayName(dayOfWeek);
        
//         // Build report using ONLY ML results
//         let voiceResponse = `Based on neural network analysis of ${categorized.highDensity.length + categorized.mediumDensity.length + categorized.lowDensity.length + categorized.noService.length} city grid points: `;

//         if (categorized.highDensity.length > 0) {
//             const highPlaces = await this.getTopPlaces(categorized.highDensity, 3);
//             voiceResponse += `The machine learning model detects HIGH jeepney density in ${highPlaces}. `;
//         }

//         if (categorized.mediumDensity.length > 0) {
//             const mediumPlaces = await this.getTopPlaces(categorized.mediumDensity, 3);
//             voiceResponse += `MEDIUM density areas include ${mediumPlaces}. `;
//         }

//         if (categorized.lowDensity.length > 0 && categorized.highDensity.length === 0) {
//             voiceResponse += `The ML model predicts generally low jeepney availability across the city.`;
//         }

//         if (categorized.noService.length > 0) {
//             voiceResponse += ` Some grid points show no jeepney service.`;
//         }

//         // Text report showing ML confidence and methods
//         let textReport = `🤖 MACHINE LEARNING DENSITY REPORT\n`;
//         textReport += `Generated: ${dayName} ${hour}:00\n`;
//         textReport += `Method: Neural Network Analysis\n`;
//         textReport += `Grid Points Analyzed: ${categorized.highDensity.length + categorized.mediumDensity.length + categorized.lowDensity.length + categorized.noService.length}\n\n`;

//         if (categorized.highDensity.length > 0) {
//             textReport += `🚨 HIGH DENSITY (ML Prediction):\n`;
//             categorized.highDensity.forEach(area => {
//                 textReport += `• ${area.placeName} - ${area.jeepney_count} jeepneys (${Math.round(area.confidence * 100)}% ML confidence)\n`;
//             });
//             textReport += `\n`;
//         }

//         if (categorized.mediumDensity.length > 0) {
//             textReport += `🟡 MEDIUM DENSITY (ML Prediction):\n`;
//             categorized.mediumDensity.forEach(area => {
//                 textReport += `• ${area.placeName} - ${area.jeepney_count} jeepneys\n`;
//             });
//             textReport += `\n`;
//         }

//         if (categorized.lowDensity.length > 0) {
//             textReport += `🟢 LOW DENSITY (ML Prediction):\n`;
//             categorized.lowDensity.slice(0, 5).forEach(area => {
//                 textReport += `• ${area.placeName} - ${area.jeepney_count} jeepney\n`;
//             });
//         }

//         return {
//             voiceResponse: voiceResponse.trim(),
//             textReport: textReport.trim(),
//             hour: hour,
//             dayOfWeek: dayOfWeek,
//             dayName: dayName
//         };
//     }

//     async getTopPlaces(areas, limit) {
//         const places = [];
//         for (let i = 0; i < Math.min(limit, areas.length); i++) {
//             const placeName = await this.reverseGeocode(areas[i].lat, areas[i].lng);
//             places.push(placeName);
//         }
//         return places.join(', ');
//     }

//     async addPlaceNamesToPredictions(predictions) {
//         const predictionsWithPlaces = [];
        
//         for (const prediction of predictions) {
//             try {
//                 const placeName = await this.reverseGeocode(prediction.lat, prediction.lng);
//                 predictionsWithPlaces.push({
//                     ...prediction,
//                     placeName: placeName
//                 });
//             } catch (error) {
//                 predictionsWithPlaces.push({
//                     ...prediction,
//                     placeName: `Grid Point (${prediction.lat.toFixed(3)}, ${prediction.lng.toFixed(3)})`
//                 });
//             }
//         }
        
//         return predictionsWithPlaces;
//     }

//     async reverseGeocode(lat, lng) {
//         try {
//             const response = await fetch(
//                 `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
//             );
            
//             const data = await response.json();
            
//             if (data.address) {
//                 return data.address.suburb || 
//                        data.address.neighbourhood || 
//                        data.address.quarter || 
//                        data.address.city_district || 
//                        data.address.city ||
//                        data.address.town ||
//                        `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
//             }
            
//             return `Area (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
//         } catch (error) {
//             return `Grid Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
//         }
//     }

//     getDayName(dayOfWeek) {
//         const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         return days[dayOfWeek] || 'Unknown';
//     }
// }

// module.exports = JeepneyAIAssistant;


class JeepneyAIAssistant {
    constructor(densityController) {
        this.densityController = densityController;
        this.mapboxToken = 'pk.eyJ1IjoibWFyY2FuaWEiLCJhIjoiY21lbDNyZXpjMGRuOTJpb285YmY2aDlscCJ9.udUoHaHGJ_-XDF7uVJB5Zg';
    }

    async generateDensityReport(hour = null, dayOfWeek = null) {
        try {
            const currentTime = new Date();
            const targetHour = hour !== null ? hour : currentTime.getHours();
            const targetDay = dayOfWeek !== null ? dayOfWeek : currentTime.getDay();
            
            console.log(`🤖 AI Assistant: PURE ML Analysis for ${targetHour}:00`);

            // Ensure ML is trained
            await this.ensureModelTrained();

            // Get PURE ML city-wide analysis
            const citywideAnalysis = this.densityController.predictor.analyzeCitywideDensity(
                targetHour, targetDay
            );
            
            if (citywideAnalysis.length === 0) {
                return {
                    success: false,
                    voiceResponse: "The neural network cannot generate predictions with current training data.",
                    report: "ML model unavailable"
                };
            }

            console.log(`📍 Geocoding ${citywideAnalysis.length} PURE ML predictions`);

            // Geocode the ML predictions
            const analysisWithPlaces = await this.addPlaceNamesToPredictions(citywideAnalysis);
            
            // Categorize PURE ML results
            const categorized = this.categorizePredictions(analysisWithPlaces);
            
            // Generate AI report from PURE ML only
            const report = this.generatePureMLReport(categorized, targetHour, targetDay);

            return {
                success: true,
                ...report,
                categorizedAreas: categorized,
                mlStats: {
                    areasAnalyzed: citywideAnalysis.length,
                    analysisTime: `${targetHour}:00`,
                    dataSource: 'Machine Learning',
                    mlMethod: 'Neural Network',
                    geocodingProvider: 'Mapbox'
                },
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('AI Assistant error:', error);
            return {
                success: false,
                voiceResponse: "The machine learning system is currently unavailable."
            };
        }
    }

    async ensureModelTrained() {
        if (!this.densityController.isInitialized || !this.densityController.predictor.isTrained) {
            console.log('🔄 ML Model not trained. Training now...');
            await this.densityController.initialize();
        }
        return true;
    }

    categorizePredictions(predictions) {
        return {
            highDensity: predictions.filter(p => 
                p.density_level === 'Jeepney Congestion' || p.density_level === 'Many Jeepneys'
            ),
            mediumDensity: predictions.filter(p => 
                p.density_level === 'Few Jeepneys'
            ),
            lowDensity: predictions.filter(p => 
                p.density_level === 'Single Jeepney'
            ),
            noService: predictions.filter(p => 
                p.density_level === 'No Jeepneys' || p.density_level === 'No Training Data'
            ),
            noData: predictions.filter(p => 
                p.method === 'no_training_data'
            )
        };
    }

    generatePureMLReport(categorized, hour, dayOfWeek) {
    const dayName = this.getDayName(dayOfWeek);
    const totalAreas = categorized.highDensity.length + categorized.mediumDensity.length + 
                      categorized.lowDensity.length + categorized.noService.length;
    
    // COUNT ACTUAL ML PREDICTIONS vs NO-DATA
    const mlPredictions = categorized.highDensity.length + categorized.mediumDensity.length + categorized.lowDensity.length;
   
    // HONEST VOICE RESPONSE
    let voiceResponse;
    if (mlPredictions === 0) {
        voiceResponse = `I have no machine learning data for ${dayName} ${hour}:00. The neural network cannot make predictions without historical trip patterns.`;
    } else {
        voiceResponse = `Based on limited ML data for ${dayName} ${hour}:00: `;
        
        // Include ALL density levels in voice response
        const parts = [];
        
        if (categorized.highDensity.length > 0) {
            const areas = categorized.highDensity.map(a => a.placeName).slice(0, 2).join(', ');
            parts.push(`high density in ${areas}`);
        }

        if (categorized.mediumDensity.length > 0) {
            const areas = categorized.mediumDensity.map(a => a.placeName).slice(0, 2).join(', ');
            parts.push(`medium density in ${areas}`);
        }

        if (categorized.lowDensity.length > 0) {
            const areas = categorized.lowDensity.map(a => a.placeName).slice(0, 2).join(', ');
            parts.push(`low density in ${areas}`);
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


        voiceResponse += `Note: Predictions are based on very limited historical data.`;
    }

    // HONEST TEXT REPORT
    let textReport = `🧠 HONEST MACHINE LEARNING REPORT\n`;
    textReport += `Time: ${dayName} ${hour}:00\n`;
    textReport += `Status: ${mlPredictions > 0 ? 'LIMITED DATA' : 'NO DATA AVAILABLE'}\n`;
    textReport += `ML Predictions: ${mlPredictions} areas\n`;

    if (mlPredictions === 0) {
        textReport += `❌ NO ML PREDICTIONS POSSIBLE\n`;
        textReport += `The neural network has no training data for ${dayName} ${hour}:00.\n`;
        textReport += `ML requires historical trip patterns to make predictions.\n`;
        textReport += `\nConsider using real-time data instead of ML predictions.`;
    } else {
        textReport += `⚠️ LIMITED CONFIDENCE PREDICTIONS\n`;
        textReport += `Based on sparse training data for this time period.\n\n`;
        
        // Show ALL density levels in text report
        if (categorized.highDensity.length > 0) {
            textReport += `🚨 HIGH DENSITY (Limited ML Prediction):\n`;
            categorized.highDensity.forEach(area => {
                textReport += `• ${area.placeName} - ${area.jeepney_count} jeepneys (${area.method})\n`;
            });
            textReport += `\n`;
        }

        if (categorized.mediumDensity.length > 0) {
            textReport += `🟡 MEDIUM DENSITY (Limited ML Prediction):\n`;
            categorized.mediumDensity.slice(0, 5).forEach(area => {
                textReport += `• ${area.placeName} - ${area.jeepney_count} jeepneys (${area.method})\n`;
            });
            textReport += `\n`;
        }

        if (categorized.lowDensity.length > 0) {
            textReport += `🟢 LOW DENSITY (Limited ML Prediction):\n`;
            categorized.lowDensity.slice(0, 5).forEach(area => {
                textReport += `• ${area.placeName} - ${area.jeepney_count} jeepney (${area.method})\n`;
            });
            textReport += `\n`;
        }

        if (categorized.noService.length > 0) {
            textReport += `🚫 NO SERVICE (Limited ML Prediction):\n`;
            categorized.noService.slice(0, 3).forEach(area => {
                textReport += `• ${area.placeName} - ${area.reason || 'No jeepneys predicted'}\n`;
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

        textReport += `⚠️ NOTE: These predictions are based on very limited training data and should be used with caution.`;
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
            highDensity: categorized.highDensity.length,
            mediumDensity: categorized.mediumDensity.length,
            lowDensity: categorized.lowDensity.length,
            noService: categorized.noService.length,
            mlPredictions: mlPredictions,
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
                
                console.log(`📍 ML Prediction: (${prediction.lat}, ${prediction.lng}) → ${placeName} [${prediction.method}]`);
                
            } catch (error) {
                console.error(`❌ Mapbox failed for ML prediction (${prediction.lat}, ${prediction.lng}):`, error.message);
                
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

module.exports = JeepneyAIAssistant;