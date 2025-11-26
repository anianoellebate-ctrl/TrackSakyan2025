// const db = require('../database');

// exports.getProfileByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;
    
//     if (!email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Email is required' 
//       });
//     }

//     // Determine which table to query based on email domain
//     const isDriver = email.endsWith('@driver.com');
//     const table = isDriver ? 'drivers' : 'commuters';

//     const sql = `SELECT * FROM ${table} WHERE email = $1`;
//     const result = await db.query(sql, [email]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     const user = result.rows[0];
    
//     res.json({
//       success: true,
//       user: {
//         email: user.email,
//         fname: user.fname,
//         lastname: user.lastname,
//         role: isDriver ? 'driver' : 'passenger',
//         imageurl: user.imageurl,
//         capacity: user.capacity,
//         max_capacity: user.max_capacity,
//         route: user.route,
//         ...user
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     });
//   }
// };

// const db = require('../database');

// exports.getProfileByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;
    
//     if (!email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Email is required' 
//       });
//     }

//     // Check both tables to find where the user exists
//     const [driverResult, commuterResult] = await Promise.all([
//       db.query('SELECT * FROM drivers WHERE email = $1', [email]),
//       db.query('SELECT * FROM commuters WHERE email = $1', [email])
//     ]);

//     let user = null;
//     let role = null;
//     let table = null;

//     if (driverResult.rows.length > 0) {
//       user = driverResult.rows[0];
//       role = 'driver';
//       table = 'drivers';
//     } else if (commuterResult.rows.length > 0) {
//       user = commuterResult.rows[0];
//       role = 'passenger';
//       table = 'commuters';
//     } else {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     // Prepare response data based on user role
//     const userData = {
//       email: user.email,
//       fname: user.fname,
//       role: role,
//       foundIn: table,
//       ...user
//     };

//     // Add role-specific fields
//     if (role === 'driver') {
//       userData.lastname = user.lastname;
//       userData.route = user.route;
//       userData.capacity = user.capacity;
//       userData.max_capacity = user.max_capacity;
//       userData.status = user.status;
//       userData.qr_add = user.qr_add;
//       userData.qr_minus = user.qr_minus;
//     } else if (role === 'passenger') {
//       // Add any passenger-specific fields here
//       userData.profile_image = user['profile-image']; // Handle the hyphen in column name
//     }

//     res.json({
//       success: true,
//       user: userData
//     });
//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     });
//   }
// };


const db = require('../database');

exports.getProfileByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check both tables to find where the user exists
    const [driverResult, commuterResult] = await Promise.all([
      db.query('SELECT * FROM drivers WHERE email = $1', [email]),
      db.query('SELECT * FROM commuters WHERE email = $1', [email])
    ]);

    let user = null;
    let role = null;
    let table = null;

    if (driverResult.rows.length > 0) {
      user = driverResult.rows[0];
      role = 'driver';
      table = 'drivers';
    } else if (commuterResult.rows.length > 0) {
      user = commuterResult.rows[0];
      role = 'passenger';
      table = 'commuters';
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prepare response data based on user role
    const userData = {
      email: user.email,
      fname: user.fname,
      role: role,
      foundIn: table,
      ...user
    };

    // Add role-specific fields
    if (role === 'driver') {
      userData.lastname = user.lastname;
      userData.route = user.route;
      userData.capacity = user.capacity;
      userData.max_capacity = user.max_capacity;
      userData.status = user.status;
      userData.qr_add = user.qr_add;
      userData.qr_minus = user.qr_minus;
    } else if (role === 'passenger') {
      // Add any passenger-specific fields here
      userData.profile_image = user['profile-image']; // Handle the hyphen in column name
    }

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
