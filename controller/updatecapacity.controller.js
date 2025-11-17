// const db = require('../database');

// const capacityController = {
//   updateCapacity: async (req, res) => {
//     const { driverID, action, email } = req.body;

//     if (!driverID || !action || !email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'All fields are required' 
//       });
//     }

//     const operation = action === 'add' ? '+ 1' : '- 1';
//     const sql = `
//       UPDATE drivers 
//       SET capacity = GREATEST(0, capacity ${operation})
//       WHERE driverid = $1 AND email = $2
//       RETURNING capacity
//     `;

//     try {
//       const result = await db.query(sql, [driverID, email]);

//       if (result.rows.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Driver not found' 
//         });
//       }

//       res.json({
//         success: true,
//         newCapacity: result.rows[0].capacity,
//         message: `Capacity ${action === 'add' ? 'increased' : 'decreased'} successfully`
//       });
//     } catch (err) {
//       console.error('DB error:', err);
//       return res.status(500).json({ 
//         success: false, 
//         message: 'Server error' 
//       });
//     }
//   }
// };

// module.exports = capacityController;



// const db = require('../database');

// const capacityController = {
//   updateCapacity: async (req, res) => {
//     const { driverID, action, email } = req.body;

//     if (!driverID || !action || !email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'All fields are required' 
//       });
//     }

//     try {
//       // First get the current capacity and max capacity
//       const getCapacitySql = `
//         SELECT capacity, max_capacity 
//         FROM drivers 
//         WHERE driverid = $1 AND email = $2
//       `;
      
//       const capacityResult = await db.query(getCapacitySql, [driverID, email]);

//       if (capacityResult.rows.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Driver not found' 
//         });
//       }

//       const { capacity, max_capacity } = capacityResult.rows[0];
      
//       // Check if trying to add when at max capacity
//       if (action === 'add' && capacity >= max_capacity) {
//         return res.json({
//           success: false,
//           currentCapacity: capacity,
//           maxCapacity: max_capacity,
//           message: 'Cannot add more passengers. Maximum capacity reached.'
//         });
//       }

//       // Check if trying to decrease when at 0
//       if (action === 'minus' && capacity <= 0) {
//         return res.json({
//           success: false,
//           currentCapacity: capacity,
//           message: 'Cannot decrease passengers. Capacity is already at 0.'
//         });
//       }

//       // Proceed with the update
//       const operation = action === 'add' ? '+ 1' : '- 1';
//       const updateSql = `
//         UPDATE drivers 
//         SET capacity = GREATEST(0, LEAST(max_capacity, capacity ${operation}))
//         WHERE driverid = $1 AND email = $2
//         RETURNING capacity, max_capacity
//       `;

//       const result = await db.query(updateSql, [driverID, email]);

//       res.json({
//         success: true,
//         newCapacity: result.rows[0].capacity,
//         maxCapacity: result.rows[0].max_capacity,
//         message: `Capacity ${action === 'add' ? 'increased' : 'decreased'} successfully`
//       });
//     } catch (err) {
//       console.error('DB error:', err);
//       return res.status(500).json({ 
//         success: false, 
//         message: 'Server error' 
//       });
//     }
//   }
// };

// module.exports = capacityController;


// controllers/capacityController.js
// const db = require('../database');

// const capacityController = {
//   updateCapacity: async (req, res) => {
//     const { driverID, action, email } = req.body;

//     if (!driverID || !action || !email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'All fields are required' 
//       });
//     }

//     try {
//       // First get the current capacity and max capacity
//       const getCapacitySql = `
//         SELECT capacity, max_capacity 
//         FROM drivers 
//         WHERE driverid = $1 AND email = $2
//       `;
      
//       const capacityResult = await db.query(getCapacitySql, [driverID, email]);

//       if (capacityResult.rows.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Driver not found' 
//         });
//       }

//       const { capacity, max_capacity } = capacityResult.rows[0];
      
//       // Check if trying to add when at max capacity
//       if (action === 'add' && capacity >= max_capacity) {
//         return res.json({
//           success: false,
//           currentCapacity: capacity,
//           maxCapacity: max_capacity,
//           message: 'Cannot add more passengers. Maximum capacity reached.'
//         });
//       }

//       // Check if trying to decrease when at 0
//       if (action === 'minus' && capacity <= 0) {
//         return res.json({
//           success: false,
//           currentCapacity: capacity,
//           message: 'Cannot decrease passengers. Capacity is already at 0.'
//         });
//       }

//       // Proceed with the update
//       const operation = action === 'add' ? '+ 1' : '- 1';
//       const updateSql = `
//         UPDATE drivers 
//         SET capacity = GREATEST(0, LEAST(max_capacity, capacity ${operation}))
//         WHERE driverid = $1 AND email = $2
//         RETURNING capacity, max_capacity
//       `;

//       const result = await db.query(updateSql, [driverID, email]);

//       // ✅ UPDATE: Track passenger counts for summary (only for 'add' actions)
//       if (action === 'add') {
//         // Get active trip for today
//         const getActiveTripSql = `
//           SELECT id FROM driver_trips 
//           WHERE driver_id = $1 AND email = $2 AND trip_date = CURRENT_DATE AND end_time IS NULL
//         `;
        
//         const activeTrip = await db.query(getActiveTripSql, [driverID, email]);
        
//         if (activeTrip.rows.length > 0) {
//           const tripId = activeTrip.rows[0].id;
          
//           // Update total_passengers in driver_trips (accumulate count)
//           const updatePassengerCountSql = `
//             UPDATE driver_trips 
//             SET total_passengers = COALESCE(total_passengers, 0) + 1
//             WHERE id = $1
//           `;
//           await db.query(updatePassengerCountSql, [tripId]);
//         }
//       }

//       res.json({
//         success: true,
//         newCapacity: result.rows[0].capacity,
//         maxCapacity: result.rows[0].max_capacity,
//         message: `Capacity ${action === 'add' ? 'increased' : 'decreased'} successfully`
//       });
//     } catch (err) {
//       console.error('DB error:', err);
//       return res.status(500).json({ 
//         success: false, 
//         message: 'Server error' 
//       });
//     }
//   }
// };

// module.exports = capacityController;



// const db = require('../database');
// const mlService = require('./ml-predict'); 

// const capacityController = {
//   updateCapacity: async (req, res) => {
//     const { driverID, action, email, passengerLocation } = req.body;

//     if (!driverID || !action || !email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'All fields are required' 
//       });
//     }

//     try {
//       // Get driver details - only existing columns
//       const getDriverSql = `
//         SELECT capacity, max_capacity, route
//         FROM drivers 
//         WHERE driverid = $1 AND email = $2
//       `;
      
//       const driverResult = await db.query(getDriverSql, [driverID, email]);

//       if (driverResult.rows.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Driver not found' 
//         });
//       }

//       const { capacity, max_capacity, route } = driverResult.rows[0];
      
//       // Capacity validation
//       if (action === 'add' && capacity >= max_capacity) {
//         return res.json({
//           success: false,
//           currentCapacity: capacity,
//           maxCapacity: max_capacity,
//           message: 'Cannot add more passengers. Maximum capacity reached.'
//         });
//       }

//       if (action === 'minus' && capacity <= 0) {
//         return res.json({
//           success: false,
//           currentCapacity: capacity,
//           message: 'Cannot decrease passengers. Capacity is already at 0.'
//         });
//       }

//       // Update capacity
//       const operation = action === 'add' ? '+ 1' : '- 1';
//       const updateSql = `
//         UPDATE drivers 
//         SET capacity = GREATEST(0, LEAST(max_capacity, capacity ${operation}))
//         WHERE driverid = $1 AND email = $2
//         RETURNING capacity, max_capacity
//       `;

//       const result = await db.query(updateSql, [driverID, email]);
//       const newCapacity = result.rows[0].capacity;

//       // 🎯 SIMPLIFIED ML DATA COLLECTION
//       if (action === 'add') {
//         await collectSimpleMLData({
//           driverID,
//           driverRoute: route,
//           boardingLocation: passengerLocation, // Passenger's location from QR scan
//           boardingTime: new Date()
//         });

//         // Your existing trip update logic
//         const getActiveTripSql = `
//           SELECT id FROM driver_trips 
//           WHERE driver_id = $1 AND email = $2 AND trip_date = CURRENT_DATE AND end_time IS NULL
//         `;
        
//         const activeTrip = await db.query(getActiveTripSql, [driverID, email]);
        
//         if (activeTrip.rows.length > 0) {
//           const tripId = activeTrip.rows[0].id;
//           const updatePassengerCountSql = `
//             UPDATE driver_trips 
//             SET total_passengers = COALESCE(total_passengers, 0) + 1
//             WHERE id = $1
//           `;
//           await db.query(updatePassengerCountSql, [tripId]);
//         }
//       }

//       // 🎯 GET HYBRID ML PREDICTION
//       let mlPrediction = { 
//         demandLevel: 'medium', 
//         message: 'Initializing prediction system...',
//         method: 'rules',
//         hotSpots: []
//       };
      
//      if (route) {
//         mlPrediction = await mlService.predict(route);
//         // Add your existing hotspots and volume summary
//         mlPrediction.hotSpots = await getHotSpots(route);
//         mlPrediction.volumeSummary = getVolumeSummary(mlPrediction.hotSpots);
//       }

//       res.json({
//         success: true,
//         newCapacity: newCapacity,
//         maxCapacity: max_capacity,
//         message: `Capacity ${action === 'add' ? 'increased' : 'decreased'} successfully`,
//         mlPrediction: mlPrediction,
//         routeName: route || 'Unknown Route'
//       });
//     } catch (err) {
//       console.error('DB error:', err);
//       return res.status(500).json({ 
//         success: false, 
//         message: 'Server error' 
//       });
//     }
//   }
// };

// // 🎯 SIMPLE ML DATA COLLECTION (POSTGIS VERSION)
// async function collectSimpleMLData(data) {
//   try {
//     const now = new Date();
//     const hour = now.getHours();
//     const dayOfWeek = now.getDay();
//     const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

//     // For PostGIS, create a POINT geometry from passenger location
//     let boardingPoint = null;
    
//     if (data.boardingLocation && data.boardingLocation.latitude && data.boardingLocation.longitude) {
//       const lat = data.boardingLocation.latitude;
//       const lng = data.boardingLocation.longitude;
//       boardingPoint = `POINT(${lng} ${lat})`; // PostGIS uses (lng lat) order
//     }
//     // If passenger location is not available, we'll still record the event without location

//     const insertSql = `
//       INSERT INTO passenger_boarding_events 
//       (driver_id, driver_route, boarding_location, boarding_time, hour_of_day, day_of_week, is_peak_hour)
//       VALUES ($1, $2, ST_GeomFromText($3, 4326), $4, $5, $6, $7)
//     `;
    
//     await db.query(insertSql, [
//       data.driverID,
//       data.driverRoute,
//       boardingPoint,
//       data.boardingTime,
//       hour,
//       dayOfWeek,
//       isPeakHour
//     ]);
    
//     console.log(`📊 ML data collected: Route ${data.driverRoute}, Time: ${hour}:00`);
    
//   } catch (error) {
//     console.error('ML data collection error:', error);
//   }
// }

// // 🎯 GET HOTSPOTS FUNCTION
// // 🎯 FIXED HOTSPOTS FUNCTION
// async function getHotSpots(routeName) {
//   try {
//     const now = new Date();
//     const currentDay = now.getDay();
//     const currentHour = now.getHours();
    
//     const hotspotsSql = `
//       SELECT 
//         ST_X(boarding_location) as lng, 
//         ST_Y(boarding_location) as lat,
//         COUNT(*) as total_passengers,
//         COUNT(DISTINCT DATE(boarding_time)) as unique_days,
//         ROUND(COUNT(*) / COUNT(DISTINCT DATE(boarding_time)), 1) as avg_passengers_per_day,
//         CASE 
//           WHEN (COUNT(*) / COUNT(DISTINCT DATE(boarding_time))) > 4 THEN 'heavy'
//           WHEN (COUNT(*) / COUNT(DISTINCT DATE(boarding_time))) > 2 THEN 'medium' 
//           ELSE 'light'
//         END as volume_level
//       FROM passenger_boarding_events 
//       WHERE driver_route = $1 
//         AND EXTRACT(DOW FROM boarding_time) = $2
//         AND EXTRACT(HOUR FROM boarding_time) = $3
//         AND boarding_time >= NOW() - INTERVAL '60 days'
//         AND boarding_location IS NOT NULL
//       GROUP BY boarding_location
//       HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
//       ORDER BY avg_passengers_per_day DESC
//       LIMIT 5
//     `;

//     const hotspotsResult = await db.query(hotspotsSql, [routeName, currentDay, currentHour]);
//     return hotspotsResult.rows.map(spot => ({
//       latitude: spot.lat,
//       longitude: spot.lng,
//       totalPassengers: spot.total_passengers,
//       uniqueDays: spot.unique_days,
//       avgPassengersPerDay: spot.avg_passengers_per_day,
//       volumeLevel: spot.volume_level,
//       coordinates: `${spot.lat.toFixed(6)}, ${spot.lng.toFixed(6)}`
//     }));
//   } catch (error) {
//     console.error('Hotspots error:', error);
//     return [];
//   }
// }

// // 🆕 HELPER FUNCTION TO CREATE VOLUME SUMMARY
// // 🆕 UPDATED VOLUME SUMMARY
// function getVolumeSummary(hotSpots) {
//   if (hotSpots.length === 0) return 'No boarding data for this time';
  
//   const heavySpots = hotSpots.filter(spot => spot.volumeLevel === 'heavy');
//   const mediumSpots = hotSpots.filter(spot => spot.volumeLevel === 'medium');
  
//   if (heavySpots.length > 0) {
//     return `${heavySpots.length} busy area${heavySpots.length > 1 ? 's' : ''} (4+ passengers avg)`;
//   } else if (mediumSpots.length > 0) {
//     return `${mediumSpots.length} moderate area${mediumSpots.length > 1 ? 's' : ''} (2-4 passengers avg)`;
//   } else {
//     return 'Light passenger traffic (1-2 passengers avg)';
//   }
// }

// module.exports = capacityController;

const db = require('../database');
const mlService = require('./ml-predict'); 

const capacityController = {
  updateCapacity: async (req, res) => {
    const { driverID, action, email, passengerLocation } = req.body;

    if (!driverID || !action || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    try {
      // Get driver details - only existing columns
      const getDriverSql = `
        SELECT capacity, max_capacity, route
        FROM drivers 
        WHERE driverid = $1 AND email = $2
      `;
      
      const driverResult = await db.query(getDriverSql, [driverID, email]);

      if (driverResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Driver not found' 
        });
      }

      const { capacity, max_capacity, route } = driverResult.rows[0];
      
      // Capacity validation
      if (action === 'add' && capacity >= max_capacity) {
        return res.json({
          success: false,
          currentCapacity: capacity,
          maxCapacity: max_capacity,
          message: 'Cannot add more passengers. Maximum capacity reached.'
        });
      }

      if (action === 'minus' && capacity <= 0) {
        return res.json({
          success: false,
          currentCapacity: capacity,
          message: 'Cannot decrease passengers. Capacity is already at 0.'
        });
      }

      // Update capacity
      const operation = action === 'add' ? '+ 1' : '- 1';
      const updateSql = `
        UPDATE drivers 
        SET capacity = GREATEST(0, LEAST(max_capacity, capacity ${operation}))
        WHERE driverid = $1 AND email = $2
        RETURNING capacity, max_capacity
      `;

      const result = await db.query(updateSql, [driverID, email]);
      const newCapacity = result.rows[0].capacity;

      // 🎯 SIMPLIFIED ML DATA COLLECTION
      if (action === 'add') {
        await collectSimpleMLData({
          driverID,
          driverRoute: route,
          boardingLocation: passengerLocation, // Passenger's location from QR scan
          boardingTime: new Date()
        });

        // Your existing trip update logic
        const getActiveTripSql = `
          SELECT id FROM driver_trips 
          WHERE driver_id = $1 AND email = $2 AND trip_date = CURRENT_DATE AND end_time IS NULL
        `;
        
        const activeTrip = await db.query(getActiveTripSql, [driverID, email]);
        
        if (activeTrip.rows.length > 0) {
          const tripId = activeTrip.rows[0].id;
          const updatePassengerCountSql = `
            UPDATE driver_trips 
            SET total_passengers = COALESCE(total_passengers, 0) + 1
            WHERE id = $1
          `;
          await db.query(updatePassengerCountSql, [tripId]);
        }
      }

      // 🎯 GET ENHANCED ML PREDICTION
      let mlPrediction = { 
        demandLevel: 'medium', 
        message: 'Initializing prediction system...',
        method: 'rules',
        hotSpots: [],
        featuresUsed: ['time'] // Default
      };
      
      if (route) {
        mlPrediction = await mlService.predict(route);
        // Add your existing hotspots and volume summary
        mlPrediction.hotSpots = await getHotSpots(route);
        mlPrediction.volumeSummary = getVolumeSummary(mlPrediction.hotSpots);

        mlPrediction.routeDataCount = mlPrediction.routeDataCount || 0;
      }

      res.json({
        success: true,
        newCapacity: newCapacity,
        maxCapacity: max_capacity,
        message: `Capacity ${action === 'add' ? 'increased' : 'decreased'} successfully`,
        mlPrediction: mlPrediction,
        routeName: route || 'Unknown Route'
      });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

// 🎯 SIMPLE ML DATA COLLECTION (POSTGIS VERSION)
async function collectSimpleMLData(data) {
  try {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

    // For PostGIS, create a POINT geometry from passenger location
    let boardingPoint = null;
    
    if (data.boardingLocation && data.boardingLocation.latitude && data.boardingLocation.longitude) {
      const lat = data.boardingLocation.latitude;
      const lng = data.boardingLocation.longitude;
      boardingPoint = `POINT(${lng} ${lat})`; // PostGIS uses (lng lat) order
    }
    // If passenger location is not available, we'll still record the event without location

    const insertSql = `
      INSERT INTO passenger_boarding_events 
      (driver_id, driver_route, boarding_location, boarding_time, hour_of_day, day_of_week, is_peak_hour)
      VALUES ($1, $2, ST_GeomFromText($3, 4326), $4, $5, $6, $7)
    `;
    
    await db.query(insertSql, [
      data.driverID,
      data.driverRoute,
      boardingPoint,
      data.boardingTime,
      hour,
      dayOfWeek,
      isPeakHour
    ]);
    
    console.log(`📊 ML data collected: Route ${data.driverRoute}, Time: ${hour}:00`);
    
  } catch (error) {
    console.error('ML data collection error:', error);
  }
}

// 🎯 GET HOTSPOTS FUNCTION
async function getHotSpots(routeName) {
  try {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    
    const hotspotsSql = `
      SELECT 
        ST_X(boarding_location) as lng, 
        ST_Y(boarding_location) as lat,
        COUNT(*) as total_passengers,
        COUNT(DISTINCT DATE(boarding_time)) as unique_days,
        ROUND(COUNT(*) / COUNT(DISTINCT DATE(boarding_time)), 1) as avg_passengers_per_day,
        CASE 
          WHEN (COUNT(*) / COUNT(DISTINCT DATE(boarding_time))) > 4 THEN 'heavy'
          WHEN (COUNT(*) / COUNT(DISTINCT DATE(boarding_time))) > 2 THEN 'medium' 
          ELSE 'light'
        END as volume_level
      FROM passenger_boarding_events 
      WHERE driver_route = $1 
        AND EXTRACT(DOW FROM boarding_time) = $2
        AND EXTRACT(HOUR FROM boarding_time) = $3
        AND boarding_time >= NOW() - INTERVAL '60 days'
        AND boarding_location IS NOT NULL
      GROUP BY boarding_location
      HAVING COUNT(DISTINCT DATE(boarding_time)) >= 2
      ORDER BY avg_passengers_per_day DESC
      LIMIT 5
    `;

    const hotspotsResult = await db.query(hotspotsSql, [routeName, currentDay, currentHour]);
    return hotspotsResult.rows.map(spot => ({
      latitude: spot.lat,
      longitude: spot.lng,
      totalPassengers: spot.total_passengers,
      uniqueDays: spot.unique_days,
      avgPassengersPerDay: spot.avg_passengers_per_day,
      volumeLevel: spot.volume_level,
      coordinates: `${spot.lat.toFixed(6)}, ${spot.lng.toFixed(6)}`
    }));
  } catch (error) {
    console.error('Hotspots error:', error);
    return [];
  }
}

// 🆕 HELPER FUNCTION TO CREATE VOLUME SUMMARY
function getVolumeSummary(hotSpots) {
  if (hotSpots.length === 0) return 'No boarding data for this time';
  
  const heavySpots = hotSpots.filter(spot => spot.volumeLevel === 'heavy');
  const mediumSpots = hotSpots.filter(spot => spot.volumeLevel === 'medium');
  
  if (heavySpots.length > 0) {
    return `${heavySpots.length} busy area${heavySpots.length > 1 ? 's' : ''} (4+ passengers avg)`;
  } else if (mediumSpots.length > 0) {
    return `${mediumSpots.length} moderate area${mediumSpots.length > 1 ? 's' : ''} (2-4 passengers avg)`;
  } else {
    return 'Light passenger traffic (1-2 passengers avg)';
  }
}

module.exports = capacityController;