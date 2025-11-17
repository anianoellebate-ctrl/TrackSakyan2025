// // // controller/driverinfo.controller.js
// // const db = require('../database');

// // const driverInfoController = {
// //   getDriverByEmail: async (req, res) => {
// //     const { email } = req.params;

// //     if (!email) {
// //       return res.status(400).json({ success: false, message: 'Email is required' });
// //     }

// //     const sql = `
// //       SELECT * FROM drivers WHERE email = $1
// //     `;

// //     try {
// //       const result = await db.query(sql, [email]);

// //       if (result.rows.length === 0) {
// //         return res.status(404).json({ success: false, message: 'Driver not found' });
// //       }

// //       res.json({
// //         success: true,
// //         driver: result.rows[0],
// //       });
// //     } catch (err) {
// //       console.error('DB Error:', err);
// //       return res.status(500).json({ success: false, message: 'Database error' });
// //     }
// //   },
// // };

// // module.exports = driverInfoController;

// // controller/driverinfo.controller.js

// // const { supabase } = require('../database');

// // const driverInfoController = {
// //   getDriverByEmail: async (req, res) => {
// //     const { email } = req.params;

// //     if (!email) {
// //       return res.status(400).json({ success: false, message: 'Email is required' });
// //     }

// //     try {
// //       const { data: driver, error } = await supabase
// //         .from('drivers')
// //         .select('*')
// //         .eq('email', email)
// //         .maybeSingle();

// //       if (error) {
// //         console.error('Supabase Error:', error);
// //         return res.status(500).json({ success: false, message: 'Database error' });
// //       }

// //       if (!driver) {
// //         return res.status(404).json({ success: false, message: 'Driver not found' });
// //       }

// //       let imageurl = null;
// //       let route = null;

// //       res.json({
// //         success: true,
// //         driver: driver,
// //       });
// //     } catch (err) {
// //       console.error('Error:', err);
// //       return res.status(500).json({ success: false, message: 'Server error' });
// //     }
// //   },
// // };

// // module.exports = driverInfoController;

// // controller/driverinfo.controller.js
// // const { supabase } = require('../database');
// // const pool = require('../database'); // Import the Neon PostgreSQL pool

// // const driverInfoController = {
// //   getDriverByEmail: async (req, res) => {
// //     const { email } = req.params;

// //     if (!email) {
// //       return res.status(400).json({ success: false, message: 'Email is required' });
// //     }

// //     try {
// //       // Fetch basic driver info from Supabase
// //       const { data: driver, error } = await supabase
// //         .from('drivers')
// //         .select('*')
// //         .eq('email', email)
// //         .maybeSingle();

// //       if (error) {
// //         console.error('Supabase Error:', error);
// //         return res.status(500).json({ success: false, message: 'Database error' });
// //       }

// //       if (!driver) {
// //         return res.status(404).json({ success: false, message: 'Driver not found' });
// //       }

// //       // Fetch additional data from Neon PostgreSQL
// //       let imageurl = null;
// //       let route = null;

// //       try {
// //         // Fetch imageurl and route from Neon
// //         const neonResult = await pool.query(
// //           'SELECT imageurl, route FROM drivers WHERE email = $1',
// //           [email]
// //         );
        
// //         if (neonResult.rows.length > 0) {
// //           imageurl = neonResult.rows[0].imageurl;
// //           route = neonResult.rows[0].route;
// //         }

// //       } catch (neonError) {
// //         console.error('Neon database error:', neonError);
// //         // Continue with Supabase data even if Neon fails
// //       }

// //       // Combine data from both databases
// //       const combinedDriver = {
// //         ...driver,
// //         imageurl: imageurl, // From Neon
// //         route: route,       // From Neon
// //       };

// //       res.json({
// //         success: true,
// //         driver: combinedDriver,
// //       });
// //     } catch (err) {
// //       console.error('Error:', err);
// //       return res.status(500).json({ success: false, message: 'Server error' });
// //     }
// //   },

// //   // New method to update driver route in Neon
// //   updateDriverRoute: async (req, res) => {
// //     const { email, route } = req.body;

// //     if (!email || !route) {
// //       return res.status(400).json({ success: false, message: 'Email and route are required' });
// //     }

// //     try {
// //       // Update route in Neon PostgreSQL
// //       const result = await pool.query(
// //         'UPDATE drivers SET route = $1 WHERE email = $2 RETURNING *',
// //         [route, email]
// //       );

// //       if (result.rows.length === 0) {
// //         return res.status(404).json({ success: false, message: 'Driver not found in Neon database' });
// //       }

// //       res.json({
// //         success: true,
// //         message: 'Route updated successfully',
// //         driver: result.rows[0]
// //       });

// //     } catch (err) {
// //       console.error('Neon database error:', err);
// //       return res.status(500).json({ success: false, message: 'Database error' });
// //     }
// //   },

// //   // New method to get all available routes
// //   getAllRoutes: async (req, res) => {
// //     try {
// //       // Fetch routes from Neon (assuming you have a routes table)
// //       const result = await pool.query(
// //         'SELECT route_name, description FROM routes ORDER BY route_name'
// //       );

// //       // If no routes table exists, return some default routes
// //       if (result.rows.length === 0) {
// //         const defaultRoutes = [
// //           { route_name: "Route 1", description: "Main Highway Route" },
// //           { route_name: "Route 2", description: "City Center Route" },
// //           { route_name: "Route 3", description: "Suburban Route" },
// //           { route_name: "Route 4", description: "Express Route" }
// //         ];
// //         return res.json({
// //           success: true,
// //           routes: defaultRoutes
// //         });
// //       }

// //       res.json({
// //         success: true,
// //         routes: result.rows
// //       });

// //     } catch (err) {
// //       console.error('Error fetching routes:', err);
// //       // Return default routes in case of error
// //       const defaultRoutes = [
// //         { route_name: "Route 1", description: "Main Highway Route" },
// //         { route_name: "Route 2", description: "City Center Route" },
// //         { route_name: "Route 3", description: "Suburban Route" },
// //         { route_name: "Route 4", description: "Express Route" }
// //       ];
// //       res.json({
// //         success: true,
// //         routes: defaultRoutes
// //       });
// //     }
// //   }
// // };

// // module.exports = driverInfoController;


// // controller/driverinfo.controller.js
// const { supabase } = require('../database');
// const pool = require('../database');

// const driverInfoController = {
//   getDriverByEmail: async (req, res) => {
//     const { email } = req.params;

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required' });
//     }

//     try {
//       // ✅ FIX: Use case-insensitive search with ilike
//       const normalizedEmail = email.toLowerCase();
      
      
//       // Fetch basic driver info from Supabase (case insensitive)
//       const { data: driver, error } = await supabase
//         .from('drivers')
//         .select('*')
//         .ilike('email', normalizedEmail)
//         .maybeSingle();

//       if (error) {
//         console.error('Supabase Error:', error);
//         return res.status(500).json({ success: false, message: 'Database error' });
//       }

//       if (!driver) {
//         console.log('❌ Driver not found for email:', normalizedEmail);
//         return res.status(404).json({ success: false, message: 'Driver not found' });
//       }


//       // Fetch additional data from Neon PostgreSQL
//       let imageurl = null;
//       let route = null;

//       try {
//         // ✅ FIX: Use case-insensitive search in Neon too
//         const neonResult = await pool.query(
//           'SELECT imageurl, route FROM drivers WHERE LOWER(email) = LOWER($1)', // ✅ CHANGED: Added LOWER()
//           [email]
//         );
        
//         if (neonResult.rows.length > 0) {
//           imageurl = neonResult.rows[0].imageurl;
//           route = neonResult.rows[0].route;
//         } else {
//           console.log('❌ Driver not found in Neon database');
//         }

//       } catch (neonError) {
//         console.error('Neon database error:', neonError);
//         // Continue with Supabase data even if Neon fails
//       }

//       // Combine data from both databases
//       const combinedDriver = {
//         ...driver,
//         imageurl: imageurl, // From Neon
//         route: route,       // From Neon
//       };

//       res.json({
//         success: true,
//         driver: combinedDriver,
//       });
//     } catch (err) {
//       console.error('Error:', err);
//       return res.status(500).json({ success: false, message: 'Server error' });
//     }
//   },

//   // Also update the other methods to use case-insensitive matching
//   updateDriverRoute: async (req, res) => {
//     const { email, route } = req.body;

//     if (!email || !route) {
//       return res.status(400).json({ success: false, message: 'Email and route are required' });
//     }

//     try {
//       // ✅ FIX: Use case-insensitive update in Neon
//       const result = await pool.query(
//         'UPDATE drivers SET route = $1 WHERE LOWER(email) = LOWER($2) RETURNING *', // ✅ CHANGED: Added LOWER()
//         [route, email]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({ success: false, message: 'Driver not found in Neon database' });
//       }

//       res.json({
//         success: true,
//         message: 'Route updated successfully',
//         driver: result.rows[0]
//       });

//     } catch (err) {
//       console.error('Neon database error:', err);
//       return res.status(500).json({ success: false, message: 'Database error' });
//     }
//   },

//   getAllRoutes: async (req, res) => {
//     try {
//       // Fetch routes from Neon (assuming you have a routes table)
//       const result = await pool.query(
//         'SELECT route_name, description FROM routes ORDER BY route_name'
//       );

//       // If no routes table exists, return some default routes
//       if (result.rows.length === 0) {
//         const defaultRoutes = [
//           { route_name: "Route 1", description: "Main Highway Route" },
//           { route_name: "Route 2", description: "City Center Route" },
//           { route_name: "Route 3", description: "Suburban Route" },
//           { route_name: "Route 4", description: "Express Route" }
//         ];
//         return res.json({
//           success: true,
//           routes: defaultRoutes
//         });
//       }

//       res.json({
//         success: true,
//         routes: result.rows
//       });

//     } catch (err) {
//       console.error('Error fetching routes:', err);
//       // Return default routes in case of error
//       const defaultRoutes = [
//         { route_name: "Route 1", description: "Main Highway Route" },
//         { route_name: "Route 2", description: "City Center Route" },
//         { route_name: "Route 3", description: "Suburban Route" },
//         { route_name: "Route 4", description: "Express Route" }
//       ];
//       res.json({
//         success: true,
//         routes: defaultRoutes
//       });
//     }
//   }
// };

// module.exports = driverInfoController;

// controller/driverinfo.controller.js
const { supabase } = require('../database');
const pool = require('../database');

const driverInfoController = {
  getDriverByEmail: async (req, res) => {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
      // Fetch basic driver info from Supabase
      const { data: driver, error } = await supabase
        .from('drivers')
        .select('*')
        .ilike('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Supabase Error:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }


      // Fetch imageurl and route from Neon
      let imageurl = null;
      let route = null;

      try {
        const neonResult = await pool.query(
          'SELECT imageurl, route FROM drivers WHERE LOWER(email) = LOWER($1)',
          [email]
        );
        
        if (neonResult.rows.length > 0) {
          imageurl = neonResult.rows[0].imageurl;
          route = neonResult.rows[0].route;
        }
      } catch (neonError) {
        console.error('Neon database error:', neonError);
      }

      // Combine data from both databases
      const combinedDriver = {
        ...driver,
        imageurl: imageurl,
        route: route,
      };

      res.json({
        success: true,
        driver: combinedDriver,
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updateDriverRoute: async (req, res) => {
    const { email, route } = req.body;

    if (!email || !route) {
      return res.status(400).json({ success: false, message: 'Email and route are required' });
    }

    try {
      const result = await pool.query(
        'UPDATE drivers SET route = $1 WHERE LOWER(email) = LOWER($2) RETURNING *',
        [route, email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Driver not found in Neon database' });
      }

      res.json({
        success: true,
        message: 'Route updated successfully',
        driver: result.rows[0]
      });

    } catch (err) {
      console.error('Neon database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  },

  getAllRoutes: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT route_name, description FROM routes ORDER BY route_name'
      );

      if (result.rows.length === 0) {
        const defaultRoutes = [
          { route_name: "Route 1", description: "Main Highway Route" },
          { route_name: "Route 2", description: "City Center Route" },
          { route_name: "Route 3", description: "Suburban Route" },
          { route_name: "Route 4", description: "Express Route" }
        ];
        return res.json({
          success: true,
          routes: defaultRoutes
        });
      }

      res.json({
        success: true,
        routes: result.rows
      });

    } catch (err) {
      console.error('Error fetching routes:', err);
      const defaultRoutes = [
        { route_name: "Route 1", description: "Main Highway Route" },
        { route_name: "Route 2", description: "City Center Route" },
        { route_name: "Route 3", description: "Suburban Route" },
        { route_name: "Route 4", description: "Express Route" }
      ];
      res.json({
        success: true,
        routes: defaultRoutes
      });
    }
  }
};

module.exports = driverInfoController;