// controllers/tripController.js
const db = require('../database');

const tripController = {

    getRealTimePassengerData: async (req, res) => {
        const { driverID, email } = req.query;

        if (!driverID || !email) {
            return res.status(400).json({
            success: false,
            message: 'Driver ID and email are required'
            });
        }

        try {
            // Get current trip with passenger count
            const currentTripSql = `
            SELECT total_passengers FROM driver_trips 
            WHERE driver_id = $1 AND email = $2 AND trip_date = CURRENT_DATE AND end_time IS NULL
            LIMIT 1
            `;
            
            const currentTrip = await db.query(currentTripSql, [driverID, email]);

            res.json({
            success: true,
            passengerData: {
                totalPassengers: currentTrip.rows[0]?.total_passengers || 0
                // Removed currentCapacity since it's not used
            }
            });
        } catch (err) {
            console.error('Get real-time passenger data error:', err);
            return res.status(500).json({
            success: false,
            message: 'Server error while fetching passenger data'
            });
        }
        },

  // Start a new trip
  startTrip: async (req, res) => {
    const { driverID, email } = req.body;

    if (!driverID || !email) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID and email are required'
      });
    }

    try {
      // Check if there's an active trip for today
      const checkActiveTripSql = `
        SELECT id FROM driver_trips 
        WHERE driver_id = $1 AND email = $2 AND trip_date = CURRENT_DATE AND end_time IS NULL
      `;
      
      const activeTrip = await db.query(checkActiveTripSql, [driverID, email]);
      
      if (activeTrip.rows.length > 0) {
        return res.json({
          success: false,
          message: 'You already have an active trip for today'
        });
      }

      // Start new trip with total_passengers initialized to 0
      const startTripSql = `
        INSERT INTO driver_trips (driver_id, email, trip_date, start_time, total_passengers)
        VALUES ($1, $2, CURRENT_DATE, CURRENT_TIMESTAMP, 0)
        RETURNING id, start_time
      `;

      const result = await db.query(startTripSql, [driverID, email]);

      res.json({
        success: true,
        tripId: result.rows[0].id,
        startTime: result.rows[0].start_time,
        message: 'Trip started successfully'
      });
    } catch (err) {
      console.error('Start trip error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error while starting trip'
      });
    }
  },

  // End a trip and save all data to database
  endTrip: async (req, res) => {
  const { driverID, email } = req.body;

  if (!driverID || !email) {
    return res.status(400).json({
      success: false,
      message: 'Driver ID and email are required'
    });
  }

  try {
    // Get active trip
    const getActiveTripSql = `
      SELECT id, start_time, total_passengers FROM driver_trips 
      WHERE driver_id = $1 AND email = $2 AND trip_date = CURRENT_DATE AND end_time IS NULL
    `;
    
    const activeTrip = await db.query(getActiveTripSql, [driverID, email]);
    
    if (activeTrip.rows.length === 0) {
      return res.json({
        success: false,
        message: 'No active trip found to end'
      });
    }

    const tripId = activeTrip.rows[0].id;
    const startTime = activeTrip.rows[0].start_time;
    const totalPassengers = activeTrip.rows[0].total_passengers || 0;

    // End the trip - KEEP AS INTERVAL FORMAT
    const endTripSql = `
      UPDATE driver_trips 
      SET end_time = CURRENT_TIMESTAMP, 
          trip_duration = (CURRENT_TIMESTAMP - start_time)
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(endTripSql, [tripId]);


    const trip = result.rows[0];
    
    res.json({
      success: true,
      tripData: {
        tripId: trip.id,
        startTime: trip.start_time,
        endTime: trip.end_time,
        totalPassengers: totalPassengers,
        tripDuration: trip.trip_duration, // This will be interval format
        tripDate: trip.trip_date
      },
      message: 'Trip ended successfully'
    });
  } catch (err) {
    console.error('End trip error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while ending trip'
    });
  }
},

  // Get today's summary with real-time updates
 getTodaySummary: async (req, res) => {
    const { driverID, email } = req.query;

    if (!driverID || !email) {
        return res.status(400).json({
        success: false,
        message: 'Driver ID and email are required'
        });
    }

    try {
        // Get today's trip data with latest passenger count
        const todayTripSql = `
        SELECT * FROM driver_trips 
        WHERE driver_id = $1 AND email = $2 AND trip_date = CURRENT_DATE
        ORDER BY created_at DESC
        LIMIT 1
        `;
        
        const todayTrip = await db.query(todayTripSql, [driverID, email]);

        

        // Get historical data (last 7 days)
        const historySql = `
        SELECT trip_date, total_passengers, trip_duration, end_time
        FROM driver_trips 
        WHERE driver_id = $1 AND email = $2 AND end_time IS NOT NULL
            AND trip_duration IS NOT NULL
        ORDER BY end_time DESC 
        LIMIT 7
        `;
        
        const historyResult = await db.query(historySql, [driverID, email]);

        res.json({
        success: true,
        todaySummary: {
            currentTrip: todayTrip.rows[0] || null,
            // Removed currentCapacity since frontend doesn't use it
            historicalData: historyResult.rows
        }
        });
    } catch (err) {
        console.error('Get summary error:', err);
        return res.status(500).json({
        success: false,
        message: 'Server error while fetching summary'
        });
    }
 }
};

module.exports = tripController;