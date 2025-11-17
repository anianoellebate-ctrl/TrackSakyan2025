const db = require('../database'); // ✅ same as your driversignup.controller.js

const routeController = {
  // ✅ Fetch route by route_name
  getRouteByName: async (req, res) => {
    const { routeName } = req.params;

    if (!routeName) {
      return res.status(400).json({ success: false, message: 'Route name is required' });
    }

    const sql = `
      SELECT id, route_name, coordinates
      FROM routes
      WHERE route_name = $1
    `;

    try {
      const result = await db.query(sql, [routeName]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Route not found' });
      }

      let coordinates = [];
      try {
         coordinates = result.rows[0].coordinates;
      } catch (e) {
        console.error('Invalid coordinates format');
      }

      res.json({
        success: true,
        route: {
          id: result.rows[0].id,
          route_name: result.rows[0].route_name,
          coordinates: coordinates,
        },
      });
    } catch (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  },
};

module.exports = routeController;


