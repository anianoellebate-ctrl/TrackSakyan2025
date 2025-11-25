// const db = require('../database');

// const loginController = {
//   login: async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Email and password are required.' });
//     }

//     // Determine which table to query
//     const isDriver = email.endsWith('@driver.com');
//     const table = isDriver ? 'drivers' : 'commuters';

//     // Check if email verification is required for this table
//     const hasEmailVerification = table === 'commuters'; // Only commuters need email verification

//     let sql;
//     if (hasEmailVerification) {
//       sql = `SELECT * FROM ${table} WHERE email = $1 AND password = $2`;
//     } else {
//       sql = `SELECT * FROM ${table} WHERE email = $1 AND password = $2`;
//     }

//     try {
//       const result = await db.query(sql, [email, password]);

//       if (result.rows.length > 0) {
//         const user = result.rows[0];
        
//         // Check if email is verified (for commuters only)
//         if (hasEmailVerification && !user.is_verified) {
//           return res.json({ 
//             success: false, 
//             message: 'Email not verified. Please check your email for verification code.',
//             requiresVerification: true,
//             email: email
//           });
//         }
        
//         // Check driver verification status
//         if (isDriver) {
//           // Use the 'status' column from the drivers table
//           // Expected values: 'verified', 'pending', 'rejected', etc.
//           const driverStatus = user.status || 'pending';
          
//           return res.json({ 
//             success: true, 
//             user: user,
//             status: driverStatus,
//             role: 'driver'
//           });
//         }

//         // For commuters
//         res.json({ 
//           success: true, 
//           user: user,
//           role: 'passenger'
//         });
//       } else {
//         res.json({ success: false, message: 'Invalid credentials' });
//       }
//     } catch (err) {
//       console.error('SQL Error:', err);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   }
// };

// module.exports = loginController;

// const db = require('../database');

// const loginController = {
//   login: async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Email and password are required.' });
//     }

//     try {
//       // Check only commuters table
//       const commuterResult = await db.query('SELECT * FROM commuters WHERE email = $1 AND password = $2', [email, password]);

//       if (commuterResult.rows.length > 0) {
//         const user = commuterResult.rows[0];
        
//         // Check if email is verified for commuters
//         if (!user.is_verified) {
//           return res.json({ 
//             success: false, 
//             message: 'Email not verified. Please check your email for verification code.',
//             requiresVerification: true,
//             email: email,
//             foundIn: 'commuters'
//           });
//         }
        
//         return res.json({ 
//           success: true, 
//           user: user,
//           role: 'passenger',
//           foundIn: 'commuters'
//         });
//       } else {
//         // Check if email exists but password is wrong
//         const commuterEmailCheck = await db.query('SELECT * FROM commuters WHERE email = $1', [email]);
        
//         if (commuterEmailCheck.rows.length > 0) {
//           return res.json({ success: false, message: 'Invalid password' });
//         } else {
//           return res.json({ success: false, message: 'Email not registered' });
//         }
//       }
//     } catch (err) {
//       console.error('SQL Error:', err);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   }
// };

// module.exports = loginController;

const db = require('../database');
const crypto = require('crypto'); // Add this import

// Password verification function using crypto
const verifyPassword = (password, storedHash) => {
  // Split the stored hash into salt and hash
  const [salt, originalHash] = storedHash.split(':');
  
  // Hash the provided password with the same salt
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  
  // Compare the hashes
  return hash === originalHash;
};

const loginController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
      // Check only commuters table - remove password from initial query
      const commuterResult = await db.query('SELECT * FROM commuters WHERE email = $1', [email]);

      if (commuterResult.rows.length > 0) {
        const user = commuterResult.rows[0];
        
        // Verify the hashed password
        if (!verifyPassword(password, user.password)) {
          return res.json({ success: false, message: 'Invalid password' });
        }
        
        // Check if email is verified for commuters
        if (!user.is_verified) {
          return res.json({ 
            success: false, 
            message: 'Email not verified. Please check your email for verification code.',
            requiresVerification: true,
            email: email,
            foundIn: 'commuters'
          });
        }
        
        return res.json({ 
          success: true, 
          user: user,
          role: 'passenger',
          foundIn: 'commuters'
        });
      } else {
        return res.json({ success: false, message: 'Email not registered' });
      }
    } catch (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

module.exports = loginController;
