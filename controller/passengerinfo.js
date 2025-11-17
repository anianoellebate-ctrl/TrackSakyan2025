// controller/driverinfo.controller.js
const db = require('../database');

const passengerInfoController = {
  getPassengerByEmail: async (req, res) => {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const sql = `
      SELECT * FROM commuters WHERE email = $1
    `;

    try {
      const result = await db.query(sql, [email]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }

      res.json({
        success: true,
        passenger: result.rows[0],
      });
    } catch (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  },
};

module.exports = passengerInfoController;