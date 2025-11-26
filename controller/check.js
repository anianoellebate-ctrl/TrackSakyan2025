// controllers/tripController.js
const { supabase } = require('../database');

const getAllTrips = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*'); // This gets EVERY column and EVERY row

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Always return 200 — even if empty
    res.status(200).json({
      message: data.length > 0 ? 'Trips retrieved successfully' : 'No trips found',
      trips: data,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllTrips };
