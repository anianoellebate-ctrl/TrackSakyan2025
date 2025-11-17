// const synaptic = require('synaptic');
// const { Architect, Trainer } = synaptic;
// const db = require('../database');

// class HybridPredictor {
//   constructor() {
//     this.mlReady = false;
//     this.minDataForML = 200;
//     this.network = null;
//     this.trainer = null;
//   }

//   async initialize() {
//     console.log('🚀 Initializing Synaptic.js Hybrid Prediction System...');
//     const dataCount = await this.getDataCount();
//     this.mlReady = (dataCount >= this.minDataForML);
    
//     // Create neural network
//     this.network = new Architect.Perceptron(4, 6, 3); // 4 inputs, 6 hidden, 3 outputs
//     this.trainer = new Trainer(this.network);
    
//     if (this.mlReady) {
//       await this.trainModel();
//     }
    
//     console.log(this.mlReady ? 
//       '🤖 ML Mode: Active' : 
//       `📊 Rule-Based Mode: Active (${dataCount}/${this.minDataForML} scans)`
//     );
//   }

//   async trainModel() {
//     try {
//       const trainingData = await this.getTrainingData();
      
//       if (trainingData.length >= 30) {
//         this.trainer.train(trainingData, {
//           rate: 0.3,
//           iterations: 2000,
//           error: 0.005,
//           shuffle: true,
//           log: 0
//         });
//         console.log('✅ Synaptic.js Model trained successfully');
//       }
//     } catch (error) {
//       console.error('Synaptic.js training failed:', error);
//     }
//   }

// async getTrainingData() {
//   const sql = `
//     SELECT 
//       hour_of_day,
//       day_of_week,
//       is_peak_hour,
//       -- 🎯 Use average passengers per day for demand level
//       CASE 
//         WHEN (COUNT(*) / GREATEST(1, COUNT(DISTINCT DATE(boarding_time)))) > 4 THEN 'high'
//         WHEN (COUNT(*) / GREATEST(1, COUNT(DISTINCT DATE(boarding_time)))) > 2 THEN 'medium'
//         ELSE 'low'
//       END as demand_level
//     FROM passenger_boarding_events 
//     WHERE boarding_time >= NOW() - INTERVAL '60 days'
//     GROUP BY hour_of_day, day_of_week, is_peak_hour
//     HAVING COUNT(DISTINCT DATE(boarding_time)) >= 3  -- Need consistent patterns
//     LIMIT 500
//   `;

//   const result = await db.query(sql);
  
//   return result.rows.map(row => {
//     const input = [
//       row.hour_of_day / 24,
//       row.day_of_week / 7,
//       row.is_peak_hour ? 1 : 0,
//       1
//     ];

//     let output;
//     switch(row.demand_level) {
//       case 'low': output = [1, 0, 0]; break;
//       case 'medium': output = [0, 1, 0]; break;
//       case 'high': output = [0, 0, 1]; break;
//       default: output = [0, 1, 0];
//     }

//     return { input, output };
//   });
// }

//   async getDataCount() {
//     const sql = `SELECT COUNT(*) as count FROM passenger_boarding_events`;
//     const result = await db.query(sql);
//     return parseInt(result.rows[0].count);
//   }

//   mlPredict(features) {
//     const output = this.network.activate(features);
    
//     // Find the highest probability
//     const maxIndex = output.indexOf(Math.max(...output));
//     const demandLevels = ['low', 'medium', 'high'];
//     const confidence = Math.round(output[maxIndex] * 100);

//     return {
//       demandLevel: demandLevels[maxIndex],
//       confidence: confidence,
//       method: 'ml'
//     };
//   }

//   ruleBasedPredict(scanCount) {
//     let demandLevel, message;
//     if (scanCount > 10) {
//       demandLevel = 'high';
//       message = 'High passenger demand - many scans recently';
//     } else if (scanCount > 5) {
//       demandLevel = 'medium'; 
//       message = 'Moderate passenger flow';
//     } else {
//       demandLevel = 'low';
//       message = 'Few passengers scanning';
//     }

//     return { demandLevel, message, method: 'rules' };
//   }

//   async predict(routeName) {
//     // Get recent scan count
//     const recentScansSql = `
//       SELECT COUNT(*) as scan_count
//       FROM passenger_boarding_events 
//       WHERE driver_route = $1 
//         AND boarding_time >= NOW() - INTERVAL '1 hour'
//     `;

//     const recentResult = await db.query(recentScansSql, [routeName]);
//     const scanCount = recentResult.rows[0]?.scan_count || 0;

//     // Get current time features
//     const now = new Date();
//     const hour = now.getHours();
//     const dayOfWeek = now.getDay();
//     const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

//     const features = [
//       hour / 24,                    // hour (0-1)
//       dayOfWeek / 7,                // day (0-1)  
//       isPeakHour ? 1 : 0,           // peak hour
//       1                             // bias
//     ];

//     // Try ML first if ready
//     if (this.mlReady && this.network) {
//       try {
//         const mlResult = this.mlPredict(features);
//         return { 
//           ...mlResult, 
//           recentScanCount: scanCount,
//           message: `ML prediction (${mlResult.confidence}% confidence)`
//         };
//       } catch (error) {
//         console.log('ML prediction failed, falling back to rules:', error);
//       }
//     }

//     // Use rules as fallback
//     const ruleResult = this.ruleBasedPredict(scanCount);
//     return { ...ruleResult, recentScanCount: scanCount };
//   }
// }


// module.exports = new HybridPredictor();

// const synaptic = require('synaptic');
// const { Architect, Trainer } = synaptic;
// const db = require('../database');

// class HybridPredictor {
//   constructor() {
//     this.mlReady = false;
//     this.minDataForML = 200;
//     this.network = null;
//     this.trainer = null;
//   }

//   async initialize() {
//     console.log('🚀 Initializing Synaptic.js Hybrid Prediction System...');
//     const dataCount = await this.getDataCount();
//     this.mlReady = (dataCount >= this.minDataForML);
    
//     // Create neural network - increased input neurons for new features
//     this.network = new Architect.Perceptron(7, 8, 3); // 7 inputs, 8 hidden, 3 outputs
//     this.trainer = new Trainer(this.network);
    
//     if (this.mlReady) {
//       await this.trainModel();
//     }
    
//     console.log(this.mlReady ? 
//       '🤖 ML Mode: Active' : 
//       `📊 Rule-Based Mode: Active (${dataCount}/${this.minDataForML} scans)`
//     );
//   }

//   async trainModel() {
//     try {
//       const trainingData = await this.getTrainingData();
      
//       if (trainingData.length >= 30) {
//         this.trainer.train(trainingData, {
//           rate: 0.3,
//           iterations: 2000,
//           error: 0.005,
//           shuffle: true,
//           log: 0
//         });
//         console.log('✅ Synaptic.js Model trained successfully');
//       }
//     } catch (error) {
//       console.error('Synaptic.js training failed:', error);
//     }
//   }

//   async getTrainingData() {
//     // First get the basic time patterns
//     const basicSql = `
//       SELECT 
//         hour_of_day,
//         day_of_week,
//         is_peak_hour,
//         -- 🎯 Use average passengers per day for demand level
//         CASE 
//           WHEN (COUNT(*) / GREATEST(1, COUNT(DISTINCT DATE(boarding_time)))) > 4 THEN 'high'
//           WHEN (COUNT(*) / GREATEST(1, COUNT(DISTINCT DATE(boarding_time)))) > 2 THEN 'medium'
//           ELSE 'low'
//         END as demand_level
//       FROM passenger_boarding_events 
//       WHERE boarding_time >= NOW() - INTERVAL '60 days'
//       GROUP BY hour_of_day, day_of_week, is_peak_hour
//       HAVING COUNT(DISTINCT DATE(boarding_time)) >= 3
//       LIMIT 500
//     `;

//     const result = await db.query(basicSql);
    
//     // 🎯 ENHANCE WITH REAL FEATURES FOR EACH ROW
//     const enhancedTrainingData = await Promise.all(
//       result.rows.map(async (row) => {
//         // Get real features for this specific time pattern
//         const realFeatures = await this.getRealFeaturesForTraining(row.hour_of_day, row.day_of_week);
        
//         const input = [
//           row.hour_of_day / 24,
//           row.day_of_week / 7,
//           row.is_peak_hour ? 1 : 0,
//           realFeatures.avgPassengers,  // 🎯 REAL data
//           realFeatures.hotspotDensity, // 🎯 REAL data  
//           realFeatures.seasonality,    // 🎯 REAL data
//           1
//         ];

//         let output;
//         switch(row.demand_level) {
//           case 'low': output = [1, 0, 0]; break;
//           case 'medium': output = [0, 1, 0]; break;
//           case 'high': output = [0, 0, 1]; break;
//           default: output = [0, 1, 0];
//         }

//         return { input, output };
//       })
//     );

//     return enhancedTrainingData;
//   }

//   async getRealFeaturesForTraining(hour, dayOfWeek) {
//     try {
//       const featuresSql = `
//         SELECT 
//           AVG(passenger_avg) as avg_passengers,
//           COUNT(DISTINCT location_count) as hotspot_count,
//           CASE 
//             WHEN COUNT(DISTINCT location_count) > 5 THEN 1.0
//             WHEN COUNT(DISTINCT location_count) > 2 THEN 0.5
//             ELSE 0.1
//           END as hotspot_density
//         FROM (
//           SELECT 
//             boarding_location,
//             COUNT(*) / COUNT(DISTINCT DATE(boarding_time)) as passenger_avg,
//             COUNT(*) as location_count
//           FROM passenger_boarding_events 
//           WHERE EXTRACT(HOUR FROM boarding_time) = $1
//             AND EXTRACT(DOW FROM boarding_time) = $2
//             AND boarding_time >= NOW() - INTERVAL '60 days'
//           GROUP BY boarding_location
//           HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
//         ) as location_stats
//       `;
      
//       const result = await db.query(featuresSql, [hour, dayOfWeek]);
//       const row = result.rows[0];
      
//       // Calculate real seasonality
//       const now = new Date();
//       const realSeasonality = this.calculateSeasonality(now.getMonth(), dayOfWeek);
      
//       return {
//         avgPassengers: (parseFloat(row?.avg_passengers) || 2) / 10, // Normalize
//         hotspotDensity: parseFloat(row?.hotspot_density) || 0.1,
//         seasonality: realSeasonality
//       };
//     } catch (error) {
//       console.error('Training features error:', error);
//       // Fallback to reasonable defaults if query fails
//       const now = new Date();
//       return {
//         avgPassengers: 0.2,
//         hotspotDensity: 0.1,
//         seasonality: this.calculateSeasonality(now.getMonth(), dayOfWeek)
//       };
//     }
//   }

//   async getDataCount() {
//     const sql = `SELECT COUNT(*) as count FROM passenger_boarding_events`;
//     const result = await db.query(sql);
//     return parseInt(result.rows[0].count);
//   }

//   // 🆕 ADD LOCATION FEATURES METHOD
//   async getLocationFeatures(routeName, hour, dayOfWeek) {
//     try {
//         const locationSql = `
//             SELECT 
//                 AVG(avg_passengers) as avg_passengers,
//                 COUNT(*) as hotspot_count,
//                 CASE 
//                     WHEN COUNT(*) > 5 THEN 1.0
//                     WHEN COUNT(*) > 2 THEN 0.5
//                     ELSE 0.1
//                 END as hotspot_density
//             FROM (
//                 SELECT 
//                     boarding_location,
//                     COUNT(*) / COUNT(DISTINCT DATE(boarding_time)) as avg_passengers
//                 FROM passenger_boarding_events 
//                 WHERE driver_route = $1 
//                     AND EXTRACT(HOUR FROM boarding_time) = $2
//                     AND EXTRACT(DOW FROM boarding_time) = $3
//                     AND boarding_time >= NOW() - INTERVAL '60 days'
//                 GROUP BY boarding_location
//                 HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
//             ) as location_stats
//         `;
        
//         const result = await db.query(locationSql, [routeName, hour, dayOfWeek]);
//         const row = result.rows[0];
        
//         // 🇵🇭 USE PHILIPPINE-SPECIFIC SEASONALITY
//         const now = new Date();
//         const phSeasonality = this.calculateSeasonality(now.getMonth(), dayOfWeek);
        
//         return {
//             avgPassengers: parseFloat(row.avg_passengers) / 10 || 0.1,
//             hotspotDensity: parseFloat(row.hotspot_density) || 0.1,
//             seasonality: phSeasonality  // 🇵🇭 PHILIPPINE CALCULATION
//         };
//     } catch (error) {
//         console.error('Location features error:', error);
//         // 🇵🇭 FALLBACK WITH PHILIPPINE SEASONALITY
//         const now = new Date();
//         const phSeasonality = this.calculateSeasonality(now.getMonth(), now.getDay());
        
//         return { 
//             avgPassengers: 0.1, 
//             hotspotDensity: 0.1, 
//             seasonality: phSeasonality 
//         };
//     }
//   }

//   // 🇵🇭 PHILIPPINES-SPECIFIC SEASONAL CALCULATION - FIXED
//   calculateSeasonality(month, dayOfWeek, isHoliday = false) {
//     const now = new Date();
//     const date = now.getDate();
    
//     // 🇵🇭 PHILIPPINES-SPECIFIC SEASONAL FACTORS
//     const seasonalFactors = {
//         // Monthly patterns based on Philippine climate and events
//         monthly: [
//             1.0,  // January    - Holiday season end
//             0.9,  // February   - Regular
//             1.1,  // March      - Graduation season start
//             1.3,  // April      - Summer, Holy Week, graduation
//             1.2,  // May        - Summer, school break
//             1.0,  // June       - School opening
//             0.9,  // July       - Rainy season
//             0.8,  // August     - Rainy season peak
//             0.9,  // September  - Rainy season
//             1.0,  // October    - Ber months start
//             1.2,  // November   - Christmas season, All Saints
//             1.5   // December   - Christmas peak, holiday season
//         ],
        
//         // Day of week patterns (Philippine context)
//         weekly: [0.6, 1.1, 1.0, 1.0, 1.2, 1.4, 0.8], // Sun-Sat (higher on Fri/Sat)
        
//         // Philippine-specific special periods
//         specialPeriods: {
//             'summer-break': 1.3,      // Mar-May: Higher travel
//             'ber-months': 1.4,        // Sept-Dec: Christmas season
//             'school-opening': 1.2,    // June: Back to school
//             'graduation-season': 1.3, // Mar-Apr: Graduations
//             'rainy-season': 0.7,      // Jul-Oct: Lower travel
//             'semester-break': 1.1,    // Oct: Short break
//             'christmas-season': 1.6   // Dec: Peak season
//         }
//     };
    
//     // 🇵🇭 BASE SEASONALITY CALCULATION
//     let seasonality = 1.0;
    
//     // Monthly adjustment
//     seasonality *= seasonalFactors.monthly[month];
    
//     // Weekly adjustment  
//     seasonality *= seasonalFactors.weekly[dayOfWeek];
    
//     // 🇵🇭 PHILIPPINE SPECIAL PERIOD DETECTION
//     const currentPeriod = this.detectPhilippineSpecialPeriod(month, date);
//     if (currentPeriod) {
//         seasonality *= seasonalFactors.specialPeriods[currentPeriod];
//     }
    
//     // Philippine holiday adjustment
//     if (isHoliday) {
//         seasonality *= this.getPhilippineHolidayMultiplier(month, date);
//     }
    
//     // Normalize to 0-1 range for ML features
//     return Math.max(0.3, Math.min(1.8, seasonality)) / 1.8;
//   }

//   // 🆕 PHILIPPINE SPECIAL PERIOD DETECTION
//   detectPhilippineSpecialPeriod(month, date) {
//     // Summer Break (March-May)
//     if (month >= 2 && month <= 4) {
//         return 'summer-break';
//     }
    
//     // Ber Months - Christmas Season (September-December)
//     if (month >= 8 && month <= 11) {
//         if (month === 11) return 'christmas-season'; // December
//         return 'ber-months'; // Sept-Nov
//     }
    
//     // School Opening (June)
//     if (month === 5) { // June
//         return 'school-opening';
//     }
    
//     // Graduation Season (March-April)
//     if ((month === 2 && date >= 15) || (month === 3 && date <= 30)) {
//         return 'graduation-season';
//     }
    
//     // Rainy Season (July-October)
//     if (month >= 6 && month <= 9) {
//         return 'rainy-season';
//     }
    
//     // Semester Break (October)
//     if (month === 9 && date >= 1 && date <= 15) {
//         return 'semester-break';
//     }
    
//     return null;
//   }

//   // 🆕 PHILIPPINE HOLIDAY MULTIPLIERS
//   getPhilippineHolidayMultiplier(month, date) {
//     // Major holidays with significant travel impact
//     const majorHolidays = [
//         { month: 0, date: 1 },   // New Year's Day
//         { month: 3, date: 9 },   // Araw ng Kagitingan
//         { month: 4, date: 1 },   // Labor Day
//         { month: 5, date: 12 },  // Independence Day
//         { month: 7, date: 21 },  // Ninoy Aquino Day
//         { month: 7, date: 28 },  // National Heroes Day
//         { month: 10, date: 1 },  // All Saints Day
//         { month: 10, date: 30 }, // Bonifacio Day
//         { month: 11, date: 25 }, // Christmas Day
//         { month: 11, date: 30 }, // Rizal Day
//     ];
    
//     // Holy Week (variable dates - you might want to calculate dynamically)
//     const holyWeek = this.calculateHolyWeek(new Date().getFullYear());
    
//     // Check if today is a major holiday
//     const isMajorHoliday = majorHolidays.some(holiday => 
//         holiday.month === month && holiday.date === date
//     );
    
//     // Check if today is Holy Week
//     const isHolyWeek = holyWeek.some(day => 
//         day.month === month && day.date === date
//     );
    
//     if (isHolyWeek) return 0.3;  // Very low during Holy Week (people leave cities)
//     if (isMajorHoliday) return 0.6; // Lower on regular holidays
    
//     return 0.8; // Regular holiday multiplier
//   }

//   // 🆕 HOLY WEEK CALCULATION (Movable feast)
//   calculateHolyWeek(year) {
//     // Simplified Holy Week calculation (Palm Sunday to Easter Sunday)
//     // In practice, you might want to hardcode these dates
//     const holyWeekDates = [
//         // Example for 2024 - you'll need to update annually
//         // or use a proper liturgical calendar calculation
//         { month: 2, date: 24 }, // Palm Sunday
//         { month: 2, date: 28 }, // Holy Thursday
//         { month: 2, date: 29 }, // Good Friday
//         { month: 2, date: 30 }, // Black Saturday
//         { month: 3, date: 31 }  // Easter Sunday
//     ];
    
//     return holyWeekDates;
//   }

//   mlPredict(features) {
//     const output = this.network.activate(features);
    
//     // Find the highest probability
//     const maxIndex = output.indexOf(Math.max(...output));
//     const demandLevels = ['low', 'medium', 'high'];
//     const confidence = Math.round(output[maxIndex] * 100);

//     return {
//       demandLevel: demandLevels[maxIndex],
//       confidence: confidence,
//       method: 'ml'
//     };
//   }

//   ruleBasedPredict(scanCount) {
//     let demandLevel, message;
//     if (scanCount > 10) {
//       demandLevel = 'high';
//       message = 'High passenger demand - many scans recently';
//     } else if (scanCount > 5) {
//       demandLevel = 'medium'; 
//       message = 'Moderate passenger flow';
//     } else {
//       demandLevel = 'low';
//       message = 'Few passengers scanning';
//     }

//     return { demandLevel, message, method: 'rules' };
//   }

//   async predict(routeName) {
//     // Get recent scan count
//     const recentScansSql = `
//       SELECT COUNT(*) as scan_count
//       FROM passenger_boarding_events 
//       WHERE driver_route = $1 
//         AND boarding_time >= NOW() - INTERVAL '1 hour'
//     `;

//     const recentResult = await db.query(recentScansSql, [routeName]);
//     const scanCount = recentResult.rows[0]?.scan_count || 0;

//     // Get current time features
//     const now = new Date();
//     const hour = now.getHours();
//     const dayOfWeek = now.getDay();
//     const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

//     // 🆕 ENHANCED: Get location-based features for this route
//     const locationFeatures = await this.getLocationFeatures(routeName, hour, dayOfWeek);

//     const features = [
//       hour / 24,                    // hour (0-1)
//       dayOfWeek / 7,                // day (0-1)  
//       isPeakHour ? 1 : 0,           // peak hour
//       locationFeatures.avgPassengers, // 🆕 Average passengers for this time
//       locationFeatures.hotspotDensity, // 🆕 Density of hotspots
//       locationFeatures.seasonality,  // 🆕 Seasonal factor
//       1                             // bias
//     ];

//     // Try ML first if ready
//     if (this.mlReady && this.network) {
//       try {
//         const mlResult = this.mlPredict(features);
//         return { 
//           ...mlResult, 
//           recentScanCount: scanCount,
//           message: `ML prediction (${mlResult.confidence}% confidence)`,
//           featuresUsed: ['time', 'location', 'seasonality'] // 🆕 Track features used
//         };
//       } catch (error) {
//         console.log('ML prediction failed, falling back to rules:', error);
//       }
//     }

//     // Use rules as fallback
//     const ruleResult = this.ruleBasedPredict(scanCount);
//     return { ...ruleResult, recentScanCount: scanCount };
//   }
// }

// module.exports = new HybridPredictor();

const synaptic = require('synaptic');
const { Architect, Trainer } = synaptic;
const db = require('../database');

class HybridPredictor {
  constructor() {
    this.mlReady = false;
    this.minDataPerRoute = 200; // 🎯 CHANGED: Per route threshold
    this.routeModels = new Map(); // 🎯 NEW: Store models per route
    this.routeDataCounts = new Map(); // 🎯 NEW: Cache route data counts
    this.trainer = null;
  }

  async initialize() {
    console.log('🚀 Initializing Route-Specific ML Prediction System...');
    // 🎯 REMOVED global ML activation check
    console.log('📊 Route-Specific ML Mode: Each route needs 200+ scans');
  }

  // 🎯 NEW: Check if specific route has enough data for ML
  async isRouteMLReady(routeName) {
    if (this.routeDataCounts.has(routeName)) {
      return this.routeDataCounts.get(routeName) >= this.minDataPerRoute;
    }
    
    const routeDataCount = await this.getRouteDataCount(routeName);
    this.routeDataCounts.set(routeName, routeDataCount);
    
    return routeDataCount >= this.minDataPerRoute;
  }

  // 🎯 NEW: Get data count for specific route
  async getRouteDataCount(routeName) {
    const sql = `SELECT COUNT(*) as count FROM passenger_boarding_events WHERE driver_route = $1`;
    const result = await db.query(sql, [routeName]);
    return parseInt(result.rows[0].count);
  }

  // 🎯 NEW: Train model for specific route
  async trainRouteModel(routeName) {
    try {
      const trainingData = await this.getTrainingDataForRoute(routeName);
      
      if (trainingData.length >= 30) {
        const network = new Architect.Perceptron(7, 8, 3);
        const trainer = new Trainer(network);
        
        trainer.train(trainingData, {
          rate: 0.3,
          iterations: 2000,
          error: 0.005,
          shuffle: true,
          log: 0
        });
        
        this.routeModels.set(routeName, network);
        console.log(`✅ Route ML Model trained: ${routeName} (${trainingData.length} patterns)`);
        return true;
      } else {
        console.log(`⚠️  Insufficient training patterns for ${routeName}: ${trainingData.length}/30`);
        return false;
      }
    } catch (error) {
      console.error(`Route model training failed for ${routeName}:`, error);
      return false;
    }
  }

  // 🎯 MODIFIED: Get training data for specific route
  async getTrainingDataForRoute(routeName) {
    const sql = `
      SELECT 
        hour_of_day,
        day_of_week,
        is_peak_hour,
        -- 🎯 Use average passengers per day for demand level
        CASE 
          WHEN (COUNT(*) / GREATEST(1, COUNT(DISTINCT DATE(boarding_time)))) > 4 THEN 'high'
          WHEN (COUNT(*) / GREATEST(1, COUNT(DISTINCT DATE(boarding_time)))) > 2 THEN 'medium'
          ELSE 'low'
        END as demand_level
      FROM passenger_boarding_events 
      WHERE driver_route = $1  -- 🎯 SPECIFIC ROUTE!
        AND boarding_time >= NOW() - INTERVAL '60 days'
      GROUP BY hour_of_day, day_of_week, is_peak_hour
      HAVING COUNT(DISTINCT DATE(boarding_time)) >= 3
      LIMIT 500
    `;

    const result = await db.query(sql, [routeName]);
    
    // Enhanced training data with real features
    const enhancedTrainingData = await Promise.all(
      result.rows.map(async (row) => {
        const realFeatures = await this.getRealFeaturesForTraining(routeName, row.hour_of_day, row.day_of_week);
        
        const input = [
          row.hour_of_day / 24,
          row.day_of_week / 7,
          row.is_peak_hour ? 1 : 0,
          realFeatures.avgPassengers,
          realFeatures.hotspotDensity,
          realFeatures.seasonality,
          1
        ];

        let output;
        switch(row.demand_level) {
          case 'low': output = [1, 0, 0]; break;
          case 'medium': output = [0, 1, 0]; break;
          case 'high': output = [0, 0, 1]; break;
          default: output = [0, 1, 0];
        }

        return { input, output };
      })
    );

    return enhancedTrainingData;
  }

  async getRealFeaturesForTraining(routeName, hour, dayOfWeek) {
    try {
      const featuresSql = `
        SELECT 
          AVG(passenger_avg) as avg_passengers,
          COUNT(DISTINCT location_count) as hotspot_count,
          CASE 
            WHEN COUNT(DISTINCT location_count) > 5 THEN 1.0
            WHEN COUNT(DISTINCT location_count) > 2 THEN 0.5
            ELSE 0.1
          END as hotspot_density
        FROM (
          SELECT 
            boarding_location,
            COUNT(*) / COUNT(DISTINCT DATE(boarding_time)) as passenger_avg,
            COUNT(*) as location_count
          FROM passenger_boarding_events 
          WHERE driver_route = $1  -- 🎯 SPECIFIC ROUTE!
            AND EXTRACT(HOUR FROM boarding_time) = $2
            AND EXTRACT(DOW FROM boarding_time) = $3
            AND boarding_time >= NOW() - INTERVAL '60 days'
          GROUP BY boarding_location
          HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
        ) as location_stats
      `;
      
      const result = await db.query(featuresSql, [routeName, hour, dayOfWeek]);
      const row = result.rows[0];
      
      // Calculate real seasonality
      const now = new Date();
      const realSeasonality = this.calculateSeasonality(now.getMonth(), dayOfWeek);
      
      return {
        avgPassengers: (parseFloat(row?.avg_passengers) || 2) / 10,
        hotspotDensity: parseFloat(row?.hotspot_density) || 0.1,
        seasonality: realSeasonality
      };
    } catch (error) {
      console.error('Training features error:', error);
      const now = new Date();
      return {
        avgPassengers: 0.2,
        hotspotDensity: 0.1,
        seasonality: this.calculateSeasonality(now.getMonth(), dayOfWeek)
      };
    }
  }

  // 🎯 NEW: Route-specific ML prediction
  mlPredictForRoute(routeName, features) {
    const network = this.routeModels.get(routeName);
    if (!network) {
      throw new Error(`No ML model found for route: ${routeName}`);
    }
    
    const output = network.activate(features);
    
    const maxIndex = output.indexOf(Math.max(...output));
    const demandLevels = ['low', 'medium', 'high'];
    const confidence = Math.round(output[maxIndex] * 100);

    return {
      demandLevel: demandLevels[maxIndex],
      confidence: confidence,
      method: 'ml'
    };
  }

  // 🎯 MODIFIED: Enhanced rule-based with time awareness
  enhancedRuleBasedPredict(scanCount, hour, dayOfWeek) {
    let demandLevel, message;
    
    // Base level from recent scans
    if (scanCount > 10) {
      demandLevel = 'high';
      message = 'High passenger demand - many scans recently';
    } else if (scanCount > 5) {
      demandLevel = 'medium'; 
      message = 'Moderate passenger flow';
    } else {
      demandLevel = 'low';
      message = 'Few passengers scanning';
    }

    // 🎯 ENHANCE with time awareness
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isPeakHour && demandLevel === 'medium') {
      demandLevel = 'high';
      message += ' (peak hour boost)';
    } else if (isWeekend && demandLevel === 'low') {
      demandLevel = 'medium';
      message += ' (weekend adjustment)';
    }

    return { demandLevel, message, method: 'rules' };
  }

  // 🆕 ADD LOCATION FEATURES METHOD (keep your existing one)
  async getLocationFeatures(routeName, hour, dayOfWeek) {
    try {
        const locationSql = `
            SELECT 
                AVG(avg_passengers) as avg_passengers,
                COUNT(*) as hotspot_count,
                CASE 
                    WHEN COUNT(*) > 5 THEN 1.0
                    WHEN COUNT(*) > 2 THEN 0.5
                    ELSE 0.1
                END as hotspot_density
            FROM (
                SELECT 
                    boarding_location,
                    COUNT(*) / COUNT(DISTINCT DATE(boarding_time)) as avg_passengers
                FROM passenger_boarding_events 
                WHERE driver_route = $1 
                    AND EXTRACT(HOUR FROM boarding_time) = $2
                    AND EXTRACT(DOW FROM boarding_time) = $3
                    AND boarding_time >= NOW() - INTERVAL '60 days'
                GROUP BY boarding_location
                HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
            ) as location_stats
        `;
        
        const result = await db.query(locationSql, [routeName, hour, dayOfWeek]);
        const row = result.rows[0];
        
        const now = new Date();
        const phSeasonality = this.calculateSeasonality(now.getMonth(), dayOfWeek);
        
        return {
            avgPassengers: parseFloat(row?.avg_passengers) / 10 || 0.1,
            hotspotDensity: parseFloat(row?.hotspot_density) || 0.1,
            seasonality: phSeasonality
        };
    } catch (error) {
        console.error('Location features error:', error);
        const now = new Date();
        const phSeasonality = this.calculateSeasonality(now.getMonth(), now.getDay());
        
        return { 
            avgPassengers: 0.1, 
            hotspotDensity: 0.1, 
            seasonality: phSeasonality 
        };
    }
  }

  // 🎯 COMPLETELY REWRITTEN: Main predict method
  async predict(routeName) {
    if (!routeName) {
      return this.enhancedRuleBasedPredict(0, new Date().getHours(), new Date().getDay());
    }

    // Get recent scan count for this route
    const recentScansSql = `
      SELECT COUNT(*) as scan_count
      FROM passenger_boarding_events 
      WHERE driver_route = $1 
        AND boarding_time >= NOW() - INTERVAL '1 hour'
    `;
    const recentResult = await db.query(recentScansSql, [routeName]);
    const scanCount = recentResult.rows[0]?.scan_count || 0;

    // Get current time features
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

    // 🎯 CHECK ROUTE-SPECIFIC ML ELIGIBILITY
    const routeMLReady = await this.isRouteMLReady(routeName);
    
    if (routeMLReady) {
      // 🎯 ROUTE HAS 200+ DATA - USE ML
      try {
        // Ensure model is trained for this route
        if (!this.routeModels.has(routeName)) {
          console.log(`🔄 Training ML model for route: ${routeName}`);
          await this.trainRouteModel(routeName);
        }

        if (this.routeModels.has(routeName)) {
          // Get location-based features
          const locationFeatures = await this.getLocationFeatures(routeName, hour, dayOfWeek);

          const features = [
            hour / 24,
            dayOfWeek / 7,
            isPeakHour ? 1 : 0,
            locationFeatures.avgPassengers,
            locationFeatures.hotspotDensity,
            locationFeatures.seasonality,
            1
          ];

          const mlResult = this.mlPredictForRoute(routeName, features);
          const routeDataCount = this.routeDataCounts.get(routeName);
          
          return { 
            ...mlResult, 
            recentScanCount: scanCount,
            message: `Route ML (${mlResult.confidence}% confidence, ${routeDataCount} records)`,
            featuresUsed: ['time', 'location', 'seasonality'],
            routeDataCount: routeDataCount
          };
        }
      } catch (error) {
        console.log(`Route ML failed for ${routeName}, falling back to rules:`, error);
      }
    }

    // 🎯 ROUTE HAS <200 DATA - USE ENHANCED RULE-BASED
    const routeDataCount = this.routeDataCounts.get(routeName) || await this.getRouteDataCount(routeName);
    const ruleResult = this.enhancedRuleBasedPredict(scanCount, hour, dayOfWeek);
    
    return { 
      ...ruleResult, 
      recentScanCount: scanCount,
      routeDataCount: routeDataCount,
      message: `${ruleResult.message} (${routeDataCount}/${this.minDataPerRoute} route records)`
    };
  }

  // 🇵🇭 KEEP ALL YOUR EXISTING HELPER METHODS BELOW
  calculateSeasonality(month, dayOfWeek, isHoliday = false) {
    // Your existing seasonality calculation...
    const now = new Date();
    const date = now.getDate();
    
    const seasonalFactors = {
        monthly: [1.0, 0.9, 1.1, 1.3, 1.2, 1.0, 0.9, 0.8, 0.9, 1.0, 1.2, 1.5],
        weekly: [0.6, 1.1, 1.0, 1.0, 1.2, 1.4, 0.8],
        specialPeriods: {
            'summer-break': 1.3, 'ber-months': 1.4, 'school-opening': 1.2,
            'graduation-season': 1.3, 'rainy-season': 0.7, 'semester-break': 1.1,
            'christmas-season': 1.6
        }
    };
    
    let seasonality = 1.0;
    seasonality *= seasonalFactors.monthly[month];
    seasonality *= seasonalFactors.weekly[dayOfWeek];
    
    const currentPeriod = this.detectPhilippineSpecialPeriod(month, date);
    if (currentPeriod) {
        seasonality *= seasonalFactors.specialPeriods[currentPeriod];
    }
    
    if (isHoliday) {
        seasonality *= this.getPhilippineHolidayMultiplier(month, date);
    }
    
    return Math.max(0.3, Math.min(1.8, seasonality)) / 1.8;
  }

  detectPhilippineSpecialPeriod(month, date) {
    if (month >= 2 && month <= 4) return 'summer-break';
    if (month >= 8 && month <= 11) {
        if (month === 11) return 'christmas-season';
        return 'ber-months';
    }
    if (month === 5) return 'school-opening';
    if ((month === 2 && date >= 15) || (month === 3 && date <= 30)) return 'graduation-season';
    if (month >= 6 && month <= 9) return 'rainy-season';
    if (month === 9 && date >= 1 && date <= 15) return 'semester-break';
    return null;
  }

  getPhilippineHolidayMultiplier(month, date) {
    const majorHolidays = [
        { month: 0, date: 1 }, { month: 3, date: 9 }, { month: 4, date: 1 },
        { month: 5, date: 12 }, { month: 7, date: 21 }, { month: 7, date: 28 },
        { month: 10, date: 1 }, { month: 10, date: 30 }, { month: 11, date: 25 },
        { month: 11, date: 30 },
    ];
    
    const holyWeek = this.calculateHolyWeek(new Date().getFullYear());
    const isMajorHoliday = majorHolidays.some(holiday => 
        holiday.month === month && holiday.date === date
    );
    const isHolyWeek = holyWeek.some(day => 
        day.month === month && day.date === date
    );
    
    if (isHolyWeek) return 0.3;
    if (isMajorHoliday) return 0.6;
    return 0.8;
  }

  calculateHolyWeek(year) {
    const holyWeekDates = [
        { month: 2, date: 24 }, { month: 2, date: 28 }, 
        { month: 2, date: 29 }, { month: 2, date: 30 }, 
        { month: 3, date: 31 }
    ];
    return holyWeekDates;
  }
}

module.exports = new HybridPredictor();