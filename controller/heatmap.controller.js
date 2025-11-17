// const db = require('../database');

// const heatmapController = {

//     // 🎯 NEW: Time-specific heatmap endpoint
//    getTimeSpecificHeatmap: async (req, res) => {
//     const { routeName, dayOfWeek, hour } = req.query;

//     try {
//         if (!routeName) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Route name is required'
//             });
//         }

//         const targetDay = parseInt(dayOfWeek) || new Date().getDay();
//         const targetHour = parseInt(hour) || new Date().getHours();

//         const hotspotsSql = `
//             SELECT 
//                 ST_X(boarding_location) as lng, 
//                 ST_Y(boarding_location) as lat,
//                 COUNT(*) as total_passengers,
//                 COUNT(DISTINCT DATE(boarding_time)) as unique_days,
//                 -- FIX: Add CASE WHEN to prevent division by zero
//                 CASE 
//                     WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
//                     THEN ROUND(COUNT(*) / COUNT(DISTINCT DATE(boarding_time)), 1)
//                     ELSE 0 
//                 END as avg_passengers_per_day,
//                 -- FIX: Also for heat_intensity
//                 CASE 
//                     WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
//                     THEN LEAST(1.0, (COUNT(*) / COUNT(DISTINCT DATE(boarding_time))) / 6.0)
//                     ELSE 0 
//                 END as heat_intensity
//             FROM passenger_boarding_events 
//             WHERE driver_route = $1 
//                 AND EXTRACT(DOW FROM boarding_time) = $2
//                 AND EXTRACT(HOUR FROM boarding_time) = $3
//                 AND boarding_time >= NOW() - INTERVAL '60 days'
//                 AND boarding_location IS NOT NULL
//             GROUP BY boarding_location
//             HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
//             ORDER BY avg_passengers_per_day DESC
//             LIMIT 50
//         `;

//         const result = await db.query(hotspotsSql, [routeName, targetDay, targetHour]);
        
//         const heatmapPoints = result.rows.map(spot => [
//             spot.lat,
//             spot.lng,
//             spot.heat_intensity
//         ]);

//         res.json({
//             success: true,
//             routeName: routeName,
//             timeContext: {
//                 dayOfWeek: targetDay,
//                 hour: targetHour,
//                 description: `${getDayName(targetDay)} ${targetHour}:00`
//             },
//             data: {
//                 points: heatmapPoints,
//                 summary: {
//                     totalLocations: result.rows.length,
//                     highDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day > 4).length,
//                     moderateDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day > 2 && spot.avg_passengers_per_day <= 4).length,
//                     lowDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day <= 2).length,
//                     totalPassengers: result.rows.reduce((sum, spot) => sum + parseInt(spot.total_passengers), 0),
//                     avgPassengersPerSpot: result.rows.length > 0 ? 
//                         (result.rows.reduce((sum, spot) => {
//                             const avg = parseFloat(spot.avg_passengers_per_day) || 0;
//                             return sum + avg;
//                         }, 0) / result.rows.length).toFixed(1) : 0
//                 }
//             },
//             generatedAt: new Date()
//         });

//     } catch (error) {
//         console.error('Time-specific heatmap error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Failed to generate time-specific heatmap' 
//         });
//     }
// },

//     testHeatmap: async (req, res) => {
//     try {
//       const { routeName } = req.query;
      
//       console.log('🧪 Testing heatmap for route:', routeName);
      
//       // Test database connection
//       const testSql = `SELECT COUNT(*) as count FROM passenger_boarding_events WHERE driver_route = $1`;
//       const testResult = await db.query(testSql, [routeName || 'Test Route']);
      
//       console.log('📊 Database test - records found:', testResult.rows[0].count);
      
//       // Test the actual heatmap function
//       const heatmapData = await getRouteHeatmapData(routeName || 'Test Route');
      
//       console.log('🔥 Heatmap data generated:', {
//         pointsCount: heatmapData.points.length,
//         summary: heatmapData.summary
//       });
      
//       res.json({
//         success: true,
//         testResults: {
//           databaseRecords: parseInt(testResult.rows[0].count),
//           heatmapPoints: heatmapData.points.length,
//           dataSummary: heatmapData.summary,
//           samplePoints: heatmapData.points.slice(0, 3) // Show first 3 points
//         },
//         message: 'Heatmap test completed successfully'
//       });
      
//     } catch (error) {
//       console.error('❌ Heatmap test failed:', error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//         message: 'Heatmap test failed'
//       });
//     }
//   },

//   getRouteHeatmap: async (req, res) => {
//     const { routeName } = req.query;

//     try {
//       if (!routeName) {
//         return res.status(400).json({
//           success: false,
//           message: 'Route name is required'
//         });
//       }

//       const heatmapData = await getRouteHeatmapData(routeName);
      
//       res.json({
//         success: true,
//         routeName: routeName,
//         data: heatmapData,
//         generatedAt: new Date()
//       });
//     } catch (error) {
//       console.error('Heatmap generation error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Failed to generate heatmap' 
//       });
//     }
//   },

//   getDriverHeatmap: async (req, res) => {
//     const { driverID, email } = req.query;

//     try {
//       if (!driverID || !email) {
//         return res.status(400).json({
//           success: false,
//           message: 'Driver ID and email are required'
//         });
//       }

//       // Get driver's route first
//       const driverSql = `
//         SELECT route FROM drivers 
//         WHERE driverid = $1 AND email = $2
//       `;
      
//       const driverResult = await db.query(driverSql, [driverID, email]);

//       if (driverResult.rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'Driver not found'
//         });
//       }

//       const route = driverResult.rows[0].route;
//       const heatmapData = await getRouteHeatmapData(route);
      
//       res.json({
//         success: true,
//         routeName: route,
//         data: heatmapData,
//         generatedAt: new Date()
//       });

//     } catch (error) {
//       console.error('Driver heatmap error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Failed to generate driver heatmap' 
//       });
//     }
//   },

//   getHeatmapSummary: async (req, res) => {
//     const { routeName } = req.query;

//     try {
//       if (!routeName) {
//         return res.status(400).json({
//           success: false,
//           message: 'Route name is required'
//         });
//       }

//       const summary = await getHeatmapSummaryData(routeName);
      
//       res.json({
//         success: true,
//         routeName: routeName,
//         summary: summary,
//         generatedAt: new Date()
//       });
//     } catch (error) {
//       console.error('Heatmap summary error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Failed to get heatmap summary' 
//       });
//     }
//   }
// };

// // 🎯 ROUTE-SPECIFIC HEATMAP GENERATION
// async function getRouteHeatmapData(routeName) {
//   try {
//     const now = new Date();
//     const currentDay = now.getDay();
//     const currentHour = now.getHours();
    
//     // 🎯 FIXED: Group by location and count passengers per time session
//         const hotspotsSql = `
//         SELECT 
//             ST_X(boarding_location) as lng, 
//             ST_Y(boarding_location) as lat,
//             COUNT(DISTINCT DATE(boarding_time)) as unique_days,
//             COUNT(*) as total_passengers,
//             -- FIX: Add CASE WHEN to prevent division by zero
//             CASE 
//                 WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
//                 THEN ROUND(COUNT(*) / COUNT(DISTINCT DATE(boarding_time)), 1)
//                 ELSE 0 
//             END as avg_passengers_per_day,
//             -- FIX: Also for heat_intensity
//             CASE 
//                 WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
//                 THEN LEAST(1.0, (COUNT(*) / COUNT(DISTINCT DATE(boarding_time))) / 6.0)
//                 ELSE 0 
//             END as heat_intensity
//         FROM passenger_boarding_events 
//         WHERE driver_route = $1 
//             AND EXTRACT(DOW FROM boarding_time) = $2
//             AND EXTRACT(HOUR FROM boarding_time) = $3
//             AND boarding_time >= NOW() - INTERVAL '60 days'
//             AND boarding_location IS NOT NULL
//         GROUP BY boarding_location
//         HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
//         ORDER BY avg_passengers_per_day DESC
//         LIMIT 50
//         `;

//     const result = await db.query(hotspotsSql, [routeName, currentDay, currentHour]);
    
//     // Convert to heatmap format [lat, lng, intensity]
//     const heatmapPoints = result.rows.map(spot => [
//       spot.lat,
//       spot.lng,
//       spot.heat_intensity
//     ]);

//     return {
//       points: heatmapPoints,
//       totalPoints: result.rows.length,
//       summary: {
//         highDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day > 4).length,
//         moderateDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day > 2 && spot.avg_passengers_per_day <= 4).length,
//         lowDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day <= 2).length,
//         timeContext: `${getDayName(currentDay)} ${currentHour}:00`,
//         totalPassengers: result.rows.reduce((sum, spot) => sum + parseInt(spot.total_passengers), 0),
//        avgPassengersPerSpot: result.rows.length > 0 ? 
//         (result.rows.reduce((sum, spot) => {
//             const avg = parseFloat(spot.avg_passengers_per_day) || 0; // Convert to number, default to 0 if NaN
//             return sum + avg;
//         }, 0) / result.rows.length).toFixed(1) : 0
//       }
//     };
    
//   } catch (error) {
//     console.error('Heatmap data error:', error);
//     return {
//       points: [],
//       totalPoints: 0,
//       summary: { 
//         highDemandAreas: 0, 
//         moderateDemandAreas: 0, 
//         lowDemandAreas: 0,
//         timeContext: 'No data',
//         totalPassengers: 0,
//         avgPassengersPerSpot: 0
//       }
//     };
//   }
// }

// // Add helper function
// function getDayName(dayIndex) {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   return days[dayIndex];
// }


// // 🎯 HEATMAP SUMMARY DATA
// async function getHeatmapSummaryData(routeName) {
//   try {
//     const summarySql = `
//       SELECT 
//         COUNT(*) as total_scans,
//         COUNT(DISTINCT DATE(boarding_time)) as active_days,
//         AVG(CASE WHEN is_peak_hour THEN 1 ELSE 0 END) as peak_hour_ratio,
//         MAX(boarding_time) as last_scan_time
//       FROM passenger_boarding_events 
//       WHERE driver_route = $1 
//         AND boarding_time >= NOW() - INTERVAL '7 days'
//     `;

//     const result = await db.query(summarySql, [routeName]);
//     const data = result.rows[0];
    
//     return {
//       totalScans: parseInt(data.total_scans) || 0,
//       activeDays: parseInt(data.active_days) || 0,
//       peakHourPercentage: Math.round((data.peak_hour_ratio || 0) * 100),
//       lastScanTime: data.last_scan_time,
//       dataQuality: data.total_scans > 50 ? 'High' : data.total_scans > 20 ? 'Medium' : 'Low'
//     };
    
//   } catch (error) {
//     console.error('Heatmap summary error:', error);
//     return {
//       totalScans: 0,
//       activeDays: 0,
//       peakHourPercentage: 0,
//       lastScanTime: null,
//       dataQuality: 'No data'
//     };
//   }
// }

// module.exports = heatmapController;

const db = require('../database');

const heatmapController = {

  // 🆕 ADD JEEPNEY CONGESTION ENDPOINT TO EXISTING CONTROLLER
  getJeepneyCongestion: async (req, res) => {
    const { routeName, hour, dayOfWeek } = req.query;

    try {
      if (!routeName) {
        return res.status(400).json({
          success: false,
          message: 'Route name is required'
        });
      }

      const targetHour = parseInt(hour) || new Date().getHours();
      const targetDay = parseInt(dayOfWeek) || new Date().getDay();

      const congestionSql = `
        SELECT 
          -- Group by location areas (approx 100m radius)
          ROUND(ST_X(boarding_location)::numeric, 4) as lng,
          ROUND(ST_Y(boarding_location)::numeric, 4) as lat,
          
          -- Count UNIQUE jeepneys in this area
          COUNT(DISTINCT driver_id) as jeepney_count,
          
          -- Count total passengers (demand indicator)
          COUNT(*) as total_passengers,
          
          -- Calculate passengers per jeepney
          ROUND(COUNT(*)::decimal / COUNT(DISTINCT driver_id), 1) as passengers_per_jeepney,
          
          -- Determine congestion level
          CASE 
            WHEN COUNT(DISTINCT driver_id) >= 4 THEN 'high'
            WHEN COUNT(DISTINCT driver_id) >= 2 THEN 'medium' 
            ELSE 'low'
          END as congestion_level,

          -- Confidence based on data points
          CASE 
            WHEN COUNT(*) >= 20 THEN 'high'
            WHEN COUNT(*) >= 10 THEN 'medium'
            ELSE 'low'
          END as confidence

        FROM passenger_boarding_events 
        WHERE driver_route = $1 
          AND hour_of_day = $2
          AND day_of_week = $3
          AND boarding_time >= NOW() - INTERVAL '60 days'
          AND boarding_location IS NOT NULL
        GROUP BY 
          ROUND(ST_X(boarding_location)::numeric, 4),
          ROUND(ST_Y(boarding_location)::numeric, 4)
        HAVING COUNT(DISTINCT driver_id) >= 1
        ORDER BY jeepney_count DESC
        LIMIT 50
      `;

      const result = await db.query(congestionSql, [routeName, targetHour, targetDay]);
      
      const congestionData = result.rows.map(area => ({
        coordinates: {
          lat: parseFloat(area.lat),
          lng: parseFloat(area.lng)
        },
        jeepneyCount: area.jeepney_count,
        totalPassengers: area.total_passengers,
        passengersPerJeepney: area.passengers_per_jeepney,
        congestionLevel: area.congestion_level,
        confidence: area.confidence,
        recommendation: getJeepneyRecommendation(area.jeepney_count, area.passengers_per_jeepney)
      }));

      // Summary statistics
      const totalJeepneys = result.rows.reduce((sum, area) => sum + area.jeepney_count, 0);
      const highCongestionAreas = result.rows.filter(area => area.congestion_level === 'high').length;
      const mediumCongestionAreas = result.rows.filter(area => area.congestion_level === 'medium').length;

      res.json({
        success: true,
        routeName: routeName,
        timeContext: {
          dayOfWeek: targetDay,
          hour: targetHour,
          description: `${getDayName(targetDay)} ${targetHour}:00`
        },
        data: {
          areas: congestionData,
          summary: {
            totalAreas: result.rows.length,
            totalJeepneys: totalJeepneys,
            highCongestionAreas: highCongestionAreas,
            mediumCongestionAreas: mediumCongestionAreas,
            lowCongestionAreas: result.rows.length - highCongestionAreas - mediumCongestionAreas,
            avgJeepneysPerArea: result.rows.length > 0 ? (totalJeepneys / result.rows.length).toFixed(1) : 0
          }
        },
        generatedAt: new Date()
      });

    } catch (error) {
      console.error('Jeepney congestion analysis error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to analyze jeepney congestion' 
      });
    }
  },

  // 🆕 ADD CONGESTION TEST ENDPOINT
  testCongestion: async (req, res) => {
    const { routeName } = req.query;
    
    try {
      console.log('🧪 Testing jeepney congestion for route:', routeName);
      
      // Test with current time
      const now = new Date();
      const testData = await getJeepneyCongestionData(routeName || 'Puan', now.getHours(), now.getDay());
      
      res.json({
        success: true,
        testResults: {
          route: routeName || 'Puan',
          areasAnalyzed: testData.areas.length,
          congestionSummary: testData.summary,
          sampleAreas: testData.areas.slice(0, 3)
        },
        message: 'Jeepney congestion test completed successfully'
      });
      
    } catch (error) {
      console.error('❌ Congestion test failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Congestion test failed'
      });
    }
  },

    // 🎯 NEW: Time-specific heatmap endpoint
   getTimeSpecificHeatmap: async (req, res) => {
    const { routeName, dayOfWeek, hour } = req.query;

    try {
        if (!routeName) {
            return res.status(400).json({
                success: false,
                message: 'Route name is required'
            });
        }

        const targetDay = parseInt(dayOfWeek) || new Date().getDay();
        const targetHour = parseInt(hour) || new Date().getHours();

        // 🆕 GET DATA-DRIVEN MAX DAILY AVERAGE
        const maxDailyAvg = await getMaxDailyAverage(routeName, targetDay, targetHour);

        const hotspotsSql = `
            SELECT 
                ST_X(boarding_location) as lng, 
                ST_Y(boarding_location) as lat,
                COUNT(*) as total_passengers,
                COUNT(DISTINCT DATE(boarding_time)) as unique_days,
                -- FIX: Add CASE WHEN to prevent division by zero
                CASE 
                    WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
                    THEN ROUND(COUNT(*) / COUNT(DISTINCT DATE(boarding_time)), 1)
                    ELSE 0 
                END as avg_passengers_per_day,
                -- 🆕 IMPROVED: Data-driven intensity calculation
                CASE 
                    WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
                    THEN LEAST(1.0, (COUNT(*)::DECIMAL / COUNT(DISTINCT DATE(boarding_time))) / $4)
                    ELSE 0 
                END as heat_intensity,
                -- 🆕 ADD CONFIDENCE SCORE
                CASE 
                    WHEN COUNT(DISTINCT DATE(boarding_time)) >= 5 THEN 'high'
                    WHEN COUNT(DISTINCT DATE(boarding_time)) >= 3 THEN 'medium' 
                    ELSE 'low'
                END as confidence
            FROM passenger_boarding_events 
            WHERE driver_route = $1 
                AND day_of_week = $2                
                AND hour_of_day = $3 
                AND boarding_time >= NOW() - INTERVAL '60 days'
                AND boarding_location IS NOT NULL
            GROUP BY boarding_location
            HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
            ORDER BY avg_passengers_per_day DESC
            LIMIT 50
        `;

        const result = await db.query(hotspotsSql, [routeName, targetDay, targetHour, maxDailyAvg]);
        
        const heatmapPoints = result.rows.map(spot => [
            spot.lat,
            spot.lng,
            spot.heat_intensity
        ]);

        res.json({
            success: true,
            routeName: routeName,
            timeContext: {
                dayOfWeek: targetDay,
                hour: targetHour,
                description: `${getDayName(targetDay)} ${targetHour}:00`
            },
            data: {
                points: heatmapPoints,
                summary: {
                    totalLocations: result.rows.length,
                    highDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day > 4).length,
                    moderateDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day > 2 && spot.avg_passengers_per_day <= 4).length,
                    lowDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day <= 2).length,
                    totalPassengers: result.rows.reduce((sum, spot) => sum + parseInt(spot.total_passengers), 0),
                    avgPassengersPerSpot: result.rows.length > 0 ? 
                        (result.rows.reduce((sum, spot) => {
                            const avg = parseFloat(spot.avg_passengers_per_day) || 0;
                            return sum + avg;
                        }, 0) / result.rows.length).toFixed(1) : 0,
                    // 🆕 ADD CONFIDENCE METRICS
                    highConfidenceSpots: result.rows.filter(spot => spot.confidence === 'high').length,
                    dataQuality: result.rows.length >= 10 ? 'Excellent' : 
                                result.rows.length >= 5 ? 'Good' : 
                                result.rows.length >= 2 ? 'Fair' : 'Limited'
                },
                // 🆕 INCLUDE CONFIDENCE IN POINTS DATA
                pointsWithConfidence: result.rows.map(spot => ({
                    coordinates: [spot.lat, spot.lng],
                    intensity: spot.heat_intensity,
                    confidence: spot.confidence,
                    avgPassengers: spot.avg_passengers_per_day,
                    totalObservations: spot.unique_days
                }))
            },
            generatedAt: new Date(),
            // 🆕 ADD PREDICTION METADATA
            predictionInfo: {
                maxDailyAverageUsed: maxDailyAvg,
                dataTimeRange: '60 days',
                minimumObservations: 2
            }
        });

    } catch (error) {
        console.error('Time-specific heatmap error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate time-specific heatmap' 
        });
    }
},

    testHeatmap: async (req, res) => {
    try {
      const { routeName } = req.query;
      
      console.log('🧪 Testing heatmap for route:', routeName);
      
      // Test database connection
      const testSql = `SELECT COUNT(*) as count FROM passenger_boarding_events WHERE driver_route = $1`;
      const testResult = await db.query(testSql, [routeName || 'Test Route']);
      
      console.log('📊 Database test - records found:', testResult.rows[0].count);
      
      // Test the actual heatmap function
      const heatmapData = await getRouteHeatmapData(routeName || 'Test Route');
      
      console.log('🔥 Heatmap data generated:', {
        pointsCount: heatmapData.points.length,
        summary: heatmapData.summary
      });
      
      res.json({
        success: true,
        testResults: {
          databaseRecords: parseInt(testResult.rows[0].count),
          heatmapPoints: heatmapData.points.length,
          dataSummary: heatmapData.summary,
          samplePoints: heatmapData.points.slice(0, 3) // Show first 3 points
        },
        message: 'Heatmap test completed successfully'
      });
      
    } catch (error) {
      console.error('❌ Heatmap test failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Heatmap test failed'
      });
    }
  },

  getRouteHeatmap: async (req, res) => {
    const { routeName } = req.query;

    try {
      if (!routeName) {
        return res.status(400).json({
          success: false,
          message: 'Route name is required'
        });
      }

      const heatmapData = await getRouteHeatmapData(routeName);
      
      res.json({
        success: true,
        routeName: routeName,
        data: heatmapData,
        generatedAt: new Date()
      });
    } catch (error) {
      console.error('Heatmap generation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate heatmap' 
      });
    }
  },

  getDriverHeatmap: async (req, res) => {
    const { driverID, email } = req.query;

    try {
      if (!driverID || !email) {
        return res.status(400).json({
          success: false,
          message: 'Driver ID and email are required'
        });
      }

      // Get driver's route first
      const driverSql = `
        SELECT route FROM drivers 
        WHERE driverid = $1 AND email = $2
      `;
      
      const driverResult = await db.query(driverSql, [driverID, email]);

      if (driverResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      const route = driverResult.rows[0].route;
      const heatmapData = await getRouteHeatmapData(route);
      
      res.json({
        success: true,
        routeName: route,
        data: heatmapData,
        generatedAt: new Date()
      });

    } catch (error) {
      console.error('Driver heatmap error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate driver heatmap' 
      });
    }
  },

  getHeatmapSummary: async (req, res) => {
    const { routeName } = req.query;

    try {
      if (!routeName) {
        return res.status(400).json({
          success: false,
          message: 'Route name is required'
        });
      }

      const summary = await getHeatmapSummaryData(routeName);
      
      res.json({
        success: true,
        routeName: routeName,
        summary: summary,
        generatedAt: new Date()
      });
    } catch (error) {
      console.error('Heatmap summary error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get heatmap summary' 
      });
    }
  }
};

// 🎯 ROUTE-SPECIFIC HEATMAP GENERATION
async function getRouteHeatmapData(routeName) {
  try {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    
    // 🆕 GET DATA-DRIVEN MAX DAILY AVERAGE
    const maxDailyAvg = await getMaxDailyAverage(routeName, currentDay, currentHour);
    
    // 🎯 FIXED: Group by location and count passengers per time session
    // const hotspotsSql = `
    //     SELECT 
    //         ST_X(boarding_location) as lng, 
    //         ST_Y(boarding_location) as lat,
    //         COUNT(DISTINCT DATE(boarding_time)) as unique_days,
    //         COUNT(*) as total_passengers,
    //         -- FIX: Add CASE WHEN to prevent division by zero
    //         CASE 
    //             WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
    //             THEN ROUND(COUNT(*) / COUNT(DISTINCT DATE(boarding_time)), 1)
    //             ELSE 0 
    //         END as avg_passengers_per_day,
    //         -- 🆕 IMPROVED: Data-driven intensity calculation
    //         CASE 
    //             WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
    //             THEN LEAST(1.0, (COUNT(*)::DECIMAL / COUNT(DISTINCT DATE(boarding_time))) / $4)
    //             ELSE 0 
    //         END as heat_intensity,
    //         -- 🆕 ADD CONFIDENCE SCORE
    //         CASE 
    //             WHEN COUNT(DISTINCT DATE(boarding_time)) >= 5 THEN 'high'
    //             WHEN COUNT(DISTINCT DATE(boarding_time)) >= 3 THEN 'medium' 
    //             ELSE 'low'
    //         END as confidence
    //     FROM passenger_boarding_events 
    //     WHERE driver_route = $1 
    //         AND EXTRACT(DOW FROM boarding_time) = $2
    //         AND EXTRACT(HOUR FROM boarding_time) = $3
    //         AND boarding_time >= NOW() - INTERVAL '60 days'
    //         AND boarding_location IS NOT NULL
    //     GROUP BY boarding_location
    //     HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
    //     ORDER BY avg_passengers_per_day DESC
    //     LIMIT 50
    //     `;

      const hotspotsSql = `
        SELECT 
          ROUND(AVG(ST_X(boarding_location))::numeric, 6) as lng,
          ROUND(AVG(ST_Y(boarding_location))::numeric, 6) as lat,
          COUNT(*) as total_passengers,
          COUNT(DISTINCT DATE(boarding_time)) as unique_days,
          CASE 
            WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
            THEN ROUND(COUNT(*)::DECIMAL / COUNT(DISTINCT DATE(boarding_time)), 1)
            ELSE 0 
          END as avg_passengers_per_day,
          CASE 
            WHEN COUNT(DISTINCT DATE(boarding_time)) > 0 
            THEN LEAST(1.0, (COUNT(*)::DECIMAL / COUNT(DISTINCT DATE(boarding_time))) / $4)
            ELSE 0 
          END as heat_intensity,
          CASE 
            WHEN COUNT(DISTINCT DATE(boarding_time)) >= 5 THEN 'high'
            WHEN COUNT(DISTINCT DATE(boarding_time)) >= 3 THEN 'medium' 
            ELSE 'low'
          END as confidence
        FROM passenger_boarding_events 
        WHERE driver_route = $1 
          AND EXTRACT(DOW FROM boarding_time) = $2
          AND EXTRACT(HOUR FROM boarding_time) = $3
          AND boarding_time >= NOW() - INTERVAL '60 days'
          AND boarding_location IS NOT NULL
        GROUP BY 
          ROUND(ST_X(boarding_location)::numeric, 4),  -- ~11 meter grid
          ROUND(ST_Y(boarding_location)::numeric, 4)   -- ~11 meter grid
        HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
        ORDER BY avg_passengers_per_day DESC
        LIMIT 50
      `;

    const result = await db.query(hotspotsSql, [routeName, currentDay, currentHour, maxDailyAvg]);
    
    // Convert to heatmap format [lat, lng, intensity]
    const heatmapPoints = result.rows.map(spot => [
      spot.lat,
      spot.lng,
      spot.heat_intensity
    ]);

    return {
      points: heatmapPoints,
      totalPoints: result.rows.length,
      summary: {
        highDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day > 4).length,
        moderateDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day > 2 && spot.avg_passengers_per_day <= 4).length,
        lowDemandAreas: result.rows.filter(spot => spot.avg_passengers_per_day <= 2).length,
        timeContext: `${getDayName(currentDay)} ${currentHour}:00`,
        totalPassengers: result.rows.reduce((sum, spot) => sum + parseInt(spot.total_passengers), 0),
        avgPassengersPerSpot: result.rows.length > 0 ? 
          (result.rows.reduce((sum, spot) => {
              const avg = parseFloat(spot.avg_passengers_per_day) || 0;
              return sum + avg;
          }, 0) / result.rows.length).toFixed(1) : 0,
        // 🆕 ADD CONFIDENCE METRICS
        highConfidenceSpots: result.rows.filter(spot => spot.confidence === 'high').length,
        dataQuality: result.rows.length >= 10 ? 'Excellent' : 
                    result.rows.length >= 5 ? 'Good' : 
                    result.rows.length >= 2 ? 'Fair' : 'Limited'
      },
      // 🆕 INCLUDE CONFIDENCE DATA
      pointsWithConfidence: result.rows.map(spot => ({
        coordinates: [spot.lat, spot.lng],
        intensity: spot.heat_intensity,
        confidence: spot.confidence,
        avgPassengers: spot.avg_passengers_per_day,
        totalObservations: spot.unique_days
      }))
    };
    
  } catch (error) {
    console.error('Heatmap data error:', error);
    return {
      points: [],
      totalPoints: 0,
      summary: { 
        highDemandAreas: 0, 
        moderateDemandAreas: 0, 
        lowDemandAreas: 0,
        timeContext: 'No data',
        totalPassengers: 0,
        avgPassengersPerSpot: 0,
        highConfidenceSpots: 0,
        dataQuality: 'No data'
      },
      pointsWithConfidence: []
    };
  }
}

// 🆕 ADD HELPER FUNCTION FOR MAX DAILY AVERAGE
async function getMaxDailyAverage(routeName, targetDay, targetHour) {
    try {
        const maxSql = `
            SELECT MAX(daily_avg) as max_avg
            FROM (
                SELECT 
                    boarding_location,
                    COUNT(*) / COUNT(DISTINCT DATE(boarding_time)) as daily_avg
                FROM passenger_boarding_events 
                WHERE driver_route = $1 
                    AND EXTRACT(DOW FROM boarding_time) = $2
                    AND EXTRACT(HOUR FROM boarding_time) = $3
                    AND boarding_time >= NOW() - INTERVAL '60 days'
                GROUP BY boarding_location
                HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
            ) as location_averages
        `;
        
        const result = await db.query(maxSql, [routeName, targetDay, targetHour]);
        const maxAvg = parseFloat(result.rows[0]?.max_avg) || 8.0;
        
        // 🎯 DEBUG: Log what's happening
        console.log('🔥 [HEATMAP DEBUG] Max daily avg calculation:');
        console.log('🔥 [HEATMAP DEBUG] - Raw max_avg:', result.rows[0]?.max_avg);
        console.log('🔥 [HEATMAP DEBUG] - Parsed maxAvg:', maxAvg);
        console.log('🔥 [HEATMAP DEBUG] - Final return value:', Math.max(maxAvg, 15.0));
        
        // 🎯 FORCE MINIMUM SCALING: Always use at least 15
        return Math.max(maxAvg, 15.0);
    } catch (error) {
        console.error('Max daily average error:', error);
        return 15.0; // Force minimum scaling
    }
}

// Add helper function
function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

// 🎯 HEATMAP SUMMARY DATA
async function getHeatmapSummaryData(routeName) {
  try {
    const summarySql = `
      SELECT 
        COUNT(*) as total_scans,
        COUNT(DISTINCT DATE(boarding_time)) as active_days,
        AVG(CASE WHEN is_peak_hour THEN 1 ELSE 0 END) as peak_hour_ratio,
        MAX(boarding_time) as last_scan_time
      FROM passenger_boarding_events 
      WHERE driver_route = $1 
        AND boarding_time >= NOW() - INTERVAL '7 days'
    `;

    const result = await db.query(summarySql, [routeName]);
    const data = result.rows[0];
    
    return {
      totalScans: parseInt(data.total_scans) || 0,
      activeDays: parseInt(data.active_days) || 0,
      peakHourPercentage: Math.round((data.peak_hour_ratio || 0) * 100),
      lastScanTime: data.last_scan_time,
      dataQuality: data.total_scans > 50 ? 'High' : data.total_scans > 20 ? 'Medium' : 'Low'
    };
    
  } catch (error) {
    console.error('Heatmap summary error:', error);
    return {
      totalScans: 0,
      activeDays: 0,
      peakHourPercentage: 0,
      lastScanTime: null,
      dataQuality: 'No data'
    };
  }
}

// 🆕 HELPER FUNCTION FOR JEEPNEY RECOMMENDATIONS
function getJeepneyRecommendation(jeepneyCount, passengersPerJeepney) {
  if (jeepneyCount >= 4 && passengersPerJeepney < 5) {
    return "🚨 TOO MANY JEEPS - Low passenger ratio, consider moving";
  } else if (jeepneyCount >= 4) {
    return "⚠️  HIGH CONGESTION - Many jeepneys in area";
  } else if (jeepneyCount <= 1 && passengersPerJeepney > 8) {
    return "✅ GOOD OPPORTUNITY - Few jeepneys, high demand";
  } else if (jeepneyCount <= 2) {
    return "🟢 LOW CONGESTION - Good operating conditions";
  } else {
    return "🟡 MODERATE - Normal operations";
  }
}

// 🆕 STANDALONE FUNCTION FOR CONGESTION DATA
async function getJeepneyCongestionData(routeName, hour, dayOfWeek) {
  try {
    const congestionSql = `
      SELECT 
        ROUND(ST_X(boarding_location)::numeric, 4) as lng,
        ROUND(ST_Y(boarding_location)::numeric, 4) as lat,
        COUNT(DISTINCT driver_id) as jeepney_count,
        COUNT(*) as total_passengers,
        ROUND(COUNT(*)::decimal / COUNT(DISTINCT driver_id), 1) as passengers_per_jeepney,
        CASE 
          WHEN COUNT(DISTINCT driver_id) >= 4 THEN 'high'
          WHEN COUNT(DISTINCT driver_id) >= 2 THEN 'medium' 
          ELSE 'low'
        END as congestion_level
      FROM passenger_boarding_events 
      WHERE driver_route = $1 
        AND hour_of_day = $2
        AND day_of_week = $3
        AND boarding_time >= NOW() - INTERVAL '60 days'
      GROUP BY 
        ROUND(ST_X(boarding_location)::numeric, 4),
        ROUND(ST_Y(boarding_location)::numeric, 4)
      HAVING COUNT(DISTINCT driver_id) >= 1
      ORDER BY jeepney_count DESC
    `;

    const result = await db.query(congestionSql, [routeName, hour, dayOfWeek]);
    
    return {
      areas: result.rows.map(area => ({
        coordinates: { lat: parseFloat(area.lat), lng: parseFloat(area.lng) },
        jeepneyCount: area.jeepney_count,
        congestionLevel: area.congestion_level,
        passengersPerJeepney: area.passengers_per_jeepney
      })),
      summary: {
        totalAreas: result.rows.length,
        totalJeepneys: result.rows.reduce((sum, area) => sum + area.jeepney_count, 0),
        highCongestionAreas: result.rows.filter(area => area.congestion_level === 'high').length
      }
    };
    
  } catch (error) {
    console.error('Congestion data error:', error);
    return { areas: [], summary: { totalAreas: 0, totalJeepneys: 0, highCongestionAreas: 0 } };
  }
}




module.exports = heatmapController;