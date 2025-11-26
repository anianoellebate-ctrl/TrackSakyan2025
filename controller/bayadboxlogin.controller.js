// // controllers/authController.js
// const { supabase } = require('../database');

// const authController = {
//   login: async (req, res) => {
//     const { email, password } = req.body;

//     try {
//       // Validate input
//       if (!email || !password) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email and password are required' 
//         });
//       }

//       console.log('🔐 Attempting login for:', email);

//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       if (error) {
//         console.log('❌ Login failed:', error.message);
        
//         let errorMessage = 'Login failed. Please try again.';
        
//         if (error.message.includes('Invalid login credentials')) {
//           errorMessage = 'Invalid email or password';
//         } else if (error.message.includes('Email not confirmed')) {
//           errorMessage = 'Please verify your email address';
//         } else if (error.message.includes('Too many requests')) {
//           errorMessage = 'Too many attempts. Please try again later';
//         }
        
//         return res.status(401).json({
//           success: false,
//           error: errorMessage
//         });
//       }

//       console.log('✅ Login successful for:', data.user.email);
      
//       res.json({
//         success: true,
//         user: data.user,
//         session: data.session
//       });

//     } catch (err) {
//       console.error('🚨 Unexpected error in login:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Internal server error' 
//       });
//     }
//   },

//   checkUserType: async (req, res) => {
//     const { email } = req.body;

//     try {
//       if (!email) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email is required' 
//         });
//       }

//       console.log('🔍 Checking user type for:', email);

//       // Check commuter
//       const { data: commuter, error: commuterError } = await supabase
//         .from("commuters")
//         .select("commuter_id, is_verified")
//         .eq("email", email)
//         .maybeSingle();

//       if (commuterError) {
//         console.error('❌ Commuter check error:', commuterError.message);
//         throw commuterError;
//       }

//       if (commuter) {
//         console.log('✅ User found as commuter');
//         return res.json({ 
//           success: true,
//           userType: 'commuter', 
//           data: commuter 
//         });
//       }

//       // Check driver
//       const { data: driver, error: driverError } = await supabase
//         .from("drivers")
//         .select("driver_id, is_verified")
//         .eq("email", email)
//         .maybeSingle();

//       if (driverError) {
//         console.error('❌ Driver check error:', driverError.message);
//         throw driverError;
//       }

//       if (driver) {
//         console.log('✅ User found as driver');
//         return res.json({ 
//           success: true,
//           userType: 'driver', 
//           data: driver 
//         });
//       }

//       console.log('❓ User not found in system:', email);
//       return res.json({ 
//         success: true,
//         userType: 'unknown' 
//       });

//     } catch (err) {
//       console.error('🚨 Check user type error:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Failed to check user type' 
//       });
//     }
//   }
// };

// module.exports = authController;


// const { supabase } = require('../database');
// const db = require('../database'); // Import the pool for Neon PostgreSQL
// const cloudinary = require('cloudinary').v2;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const authController = {
//   login: async (req, res) => {
//     const { email, password } = req.body;

//     try {
//       // Validate input
//       if (!email || !password) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email and password are required' 
//         });
//       }

//       console.log('🔐 Attempting login for:', email);

//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       if (error) {
//         console.log('❌ Login failed:', error.message);
        
//         let errorMessage = 'Login failed. Please try again.';
        
//         if (error.message.includes('Invalid login credentials')) {
//           errorMessage = 'Invalid email or password';
//         } else if (error.message.includes('Email not confirmed')) {
//           errorMessage = 'Please verify your email address';
//         } else if (error.message.includes('Too many requests')) {
//           errorMessage = 'Too many attempts. Please try again later';
//         }
        
//         return res.status(401).json({
//           success: false,
//           error: errorMessage
//         });
//       }

//       console.log('✅ Login successful for:', data.user.email);

//       // ✅ NEW: Create/update driver record in Neon database
//       await createOrUpdateDriverRecord(data.user);

//       res.json({
//         success: true,
//         user: data.user,
//         session: data.session
//       });

//     } catch (err) {
//       console.error('🚨 Unexpected error in login:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Internal server error' 
//       });
//     }
//   },

//   checkUserType: async (req, res) => {
//     const { email } = req.body;

//     try {
//       if (!email) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email is required' 
//         });
//       }

//       console.log('🔍 Checking user type for:', email);

//       // Check commuter
//       const { data: commuter, error: commuterError } = await supabase
//         .from("commuters")
//         .select("commuter_id, is_verified")
//         .eq("email", email)
//         .maybeSingle();

//       if (commuterError) {
//         console.error('❌ Commuter check error:', commuterError.message);
//         throw commuterError;
//       }

//       if (commuter) {
//         console.log('✅ User found as commuter');
//         return res.json({ 
//           success: true,
//           userType: 'commuter', 
//           data: commuter 
//         });
//       }

//       // Check driver
//       const { data: driver, error: driverError } = await supabase
//         .from("drivers")
//         .select("driver_id, is_verified")
//         .eq("email", email)
//         .maybeSingle();

//       if (driverError) {
//         console.error('❌ Driver check error:', driverError.message);
//         throw driverError;
//       }

//       if (driver) {
//         console.log('✅ User found as driver');
//         return res.json({ 
//           success: true,
//           userType: 'driver', 
//           data: driver 
//         });
//       }

//       console.log('❓ User not found in system:', email);
//       return res.json({ 
//         success: true,
//         userType: 'unknown' 
//       });

//     } catch (err) {
//       console.error('🚨 Check user type error:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Failed to check user type' 
//       });
//     }
//   }
// };

// // ✅ NEW FUNCTION: Create or update driver record in Neon database
// // ✅ UPDATED FUNCTION: Create or update driver record in Neon database
// const createOrUpdateDriverRecord = async (user) => {
//   try {
//     // Check if driver already exists in Neon database
//     const checkDriverSql = 'SELECT * FROM drivers WHERE email = $1';
//     const driverResult = await db.query(checkDriverSql, [user.email]);
//     const existingDriver = driverResult.rows[0];

//     if (existingDriver) {
//       console.log('✅ Driver already exists in Neon database:', user.email);
//       return existingDriver;
//     }

//     console.log('🆕 Creating new driver record for:', user.email);
    
//     // ✅ GET DRIVER INFO FROM YOUR API TO GET THE CORRECT NAMES
//     let firstName = '';
//     let lastName = '';
    
//     try {
//       const driverInfoResponse = await fetch(`http://192.168.1.66:21108/api/v1/driverinfo/${encodeURIComponent(user.email)}`);
//       const driverInfo = await driverInfoResponse.json();
      
//       if (driverInfo.success && driverInfo.driver) {
//         firstName = driverInfo.driver.first_name || '';
//         lastName = driverInfo.driver.last_name || '';
//         console.log('✅ Got names from driverinfo API:', { firstName, lastName });
//       }
//     } catch (error) {
//       console.log('⚠️ Could not fetch driver info, will use fallback');
//     }
    
//     // Fallback if driver info API fails
//     if (!firstName) {
//       firstName = user.email.split('@')[0];
//       firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
//       console.log('⚠️ Using fallback name from email:', firstName);
//     }

//     console.log(`👤 Final names - First: "${firstName}", Last: "${lastName}"`);

//     // Generate profile image
//     const timestamp = Date.now();
//     const displayName = firstName + (lastName ? ' ' + lastName : '');
//     const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=200&timestamp=${timestamp}`;
    
//     // Upload to Cloudinary
//     let imageUrl = '';
//     try {
//       const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
//         folder: 'driver-profiles',
//         public_id: `driver-${user.email}-${timestamp}`,
//         overwrite: true
//       });
//       imageUrl = uploadedImage.secure_url;
//       console.log('✅ Profile image uploaded to Cloudinary');
//     } catch (cloudinaryError) {
//       console.error('❌ Cloudinary upload failed:', cloudinaryError);
//       imageUrl = avatarUrl;
//     }

//     // Insert new driver record into Neon PostgreSQL
//     const insertSql = `
//       INSERT INTO drivers (email, fname, lastname, imageurl, is_verified, created_at) 
//       VALUES ($1, $2, $3, $4, $5, NOW()) 
//       RETURNING *
//     `;
    
//     const insertResult = await db.query(insertSql, [
//       user.email,
//       firstName,
//       lastName || '',
//       imageUrl,
//       true
//     ]);
    
//     const newDriver = insertResult.rows[0];
//     console.log('✅ New driver created in Neon PostgreSQL:', {
//       email: newDriver.email,
//       fname: newDriver.fname,
//       lastname: newDriver.lastname
//     });
//     return newDriver;

//   } catch (error) {
//     console.error('❌ Error in createOrUpdateDriverRecord:', error);
//     return null;
//   }
// };
// module.exports = authController;

// const { supabase } = require('../database');
// const db = require('../database');
// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const authController = {
//   login: async (req, res) => {
//     const { email, password } = req.body;

//     try {
//       if (!email || !password) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email and password are required' 
//         });
//       }

//       console.log('🔐 Attempting login for:', email);

//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       if (error) {
//         console.log('❌ Login failed:', error.message);
        
//         let errorMessage = 'Login failed. Please try again.';
        
//         if (error.message.includes('Invalid login credentials')) {
//           errorMessage = 'Invalid email or password';
//         } else if (error.message.includes('Email not confirmed')) {
//           errorMessage = 'Please verify your email address';
//         } else if (error.message.includes('Too many requests')) {
//           errorMessage = 'Too many attempts. Please try again later';
//         }
        
//         return res.status(401).json({
//           success: false,
//           error: errorMessage
//         });
//       }


//       // ✅ FIRST: Check if user exists in our system before proceeding
//       const userExists = await checkUserExistsInSystem(data.user.email);
      
//       if (!userExists) {
//         console.log('❌ User not found in application database:', data.user.email);
//         return res.status(401).json({
//           success: false,
//           error: 'Account not found. Please register as a driver first.'
//         });
//       }

//       // ✅ THEN: Create/update driver record in Neon database (non-blocking)
//       createOrUpdateDriverRecord(data.user).catch(err => {
//         console.log('⚠️ Background driver record update failed:', err.message);
//       });

//       res.json({
//         success: true,
//         user: data.user,
//         session: data.session
//       });

//     } catch (err) {
//       console.error('🚨 Unexpected error in login:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Internal server error' 
//       });
//     }
//   },

//   checkUserType: async (req, res) => {
//     const { email } = req.body;

//     try {
//       if (!email) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email is required' 
//         });
//       }

//       console.log('🔍 Checking user type for:', email);

//       // ✅ FIX: Use case-insensitive search with ilike
//       const normalizedEmail = email.toLowerCase();

//       // Check commuter in Supabase (case insensitive)
//       const { data: commuter, error: commuterError } = await supabase
//         .from("commuters")
//         .select("commuter_id, is_verified")
//         .ilike("email", normalizedEmail)
//         .maybeSingle();

//       if (commuterError) {
//         console.error('❌ Commuter check error:', commuterError.message);
//         throw commuterError;
//       }

//       if (commuter) {
//         console.log('✅ User found as commuter');
//         return res.json({ 
//           success: true,
//           userType: 'commuter', 
//           data: commuter 
//         });
//       }

//       // Check driver in Supabase (case insensitive)
//       const { data: driver, error: driverError } = await supabase
//         .from("drivers")
//         .select("driver_id, is_verified, first_name, last_name, email, plate_no")
//         .ilike("email", normalizedEmail)
//         .maybeSingle();

//       if (driverError) {
//         console.error('❌ Driver check error:', driverError.message);
//         throw driverError;
//       }

//       if (driver) {
//         console.log('✅ User found as driver in Supabase');
//         console.log('🔐 Driver verification status:', driver.is_verified);
//         console.log('📧 Actual email in database:', driver.email);
//         return res.json({ 
//           success: true,
//           userType: 'driver', 
//           data: driver 
//         });
//       }

//       console.log('❌ User not found in application system:', normalizedEmail);
//       return res.status(404).json({ 
//         success: false,
//         userType: 'unknown',
//         error: 'User not found in system. Please register first.'
//       });

//     } catch (err) {
//       console.error('🚨 Check user type error:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Failed to check user type' 
//       });
//     }
//   }
// };

// // ✅ NEW FUNCTION: Check if user exists in our system
// const checkUserExistsInSystem = async (email) => {
//   try {
//     const normalizedEmail = email.toLowerCase();

//     // Check if user exists as commuter
//     const { data: commuter, error: commuterError } = await supabase
//       .from("commuters")
//       .select("commuter_id")
//       .ilike("email", normalizedEmail)
//       .maybeSingle();

//     if (commuterError) {
//       console.error('❌ Commuter check error:', commuterError.message);
//       return false;
//     }

//     if (commuter) {
//       console.log('✅ User exists as commuter');
//       return true;
//     }

//     // Check if user exists as driver
//     const { data: driver, error: driverError } = await supabase
//       .from("drivers")
//       .select("driver_id")
//       .ilike("email", normalizedEmail)
//       .maybeSingle();

//     if (driverError) {
//       console.error('❌ Driver check error:', driverError.message);
//       return false;
//     }

//     if (driver) {
//       console.log('✅ User exists as driver');
//       return true;
//     }

//     console.log('❌ User not found in system:', normalizedEmail);
//     return false;

//   } catch (error) {
//     console.error('❌ Error checking user existence:', error.message);
//     return false;
//   }
// };

// const createOrUpdateDriverRecord = async (user) => {
//   try {
//     // ✅ ADD: Check database connection first
//     let dbConnected = false;
//     try {
//       await db.query('SELECT 1');
//       dbConnected = true;
//       console.log('✅ Database connection verified');
//     } catch (dbError) {
//       console.error('❌ Database connection failed:', dbError.message);
//       dbConnected = false;
//     }

//     if (!dbConnected) {
//       console.log('⚠️ Skipping driver record creation due to database connection issues');
//       return null;
//     }

//     // Check if driver already exists in Neon database
//     const checkDriverSql = 'SELECT * FROM drivers WHERE email = $1';
//     const driverResult = await db.query(checkDriverSql, [user.email]);
//     const existingDriver = driverResult.rows[0];

//     if (existingDriver) {
//       console.log('✅ Driver already exists in Neon database:', user.email);
//       return existingDriver;
//     }

//     console.log('🆕 Creating new driver record for:', user.email);
    
//     let firstName = '';
//     let lastName = '';
    
//     try {
//       // Get driver info from Supabase (case insensitive)
//       const { data: supabaseDriver, error } = await supabase
//         .from("drivers")
//         .select("first_name, last_name")
//         .ilike("email", user.email)
//         .maybeSingle();

//       if (supabaseDriver && !error) {
//         firstName = supabaseDriver.first_name || '';
//         lastName = supabaseDriver.last_name || '';
//         console.log('✅ Got names from Supabase drivers table:', { firstName, lastName });
//       }
//     } catch (error) {
//       console.log('⚠️ Could not fetch driver info from Supabase, will use fallback');
//     }
    
//     if (!firstName) {
//       firstName = user.email.split('@')[0];
//       firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
//       console.log('⚠️ Using fallback name from email:', firstName);
//     }

//     console.log(`👤 Final names - First: "${firstName}", Last: "${lastName}"`);

//     const timestamp = Date.now();
//     const displayName = firstName + (lastName ? ' ' + lastName : '');
//     const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=200&timestamp=${timestamp}`;
    
//     let imageUrl = '';
//     try {
//       const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
//         folder: 'driver-profiles',
//         public_id: `driver-${user.email}-${timestamp}`,
//         overwrite: true
//       });
//       imageUrl = uploadedImage.secure_url;
//       console.log('✅ Profile image uploaded to Cloudinary');
//     } catch (cloudinaryError) {
//       console.error('❌ Cloudinary upload failed:', cloudinaryError);
//       imageUrl = avatarUrl;
//     }

//     // Insert new driver record into Neon PostgreSQL
//     const insertSql = `
//       INSERT INTO drivers (email, fname, lastname, imageurl, is_verified, created_at) 
//       VALUES ($1, $2, $3, $4, $5, NOW()) 
//       RETURNING *
//     `;
    
//     const insertResult = await db.query(insertSql, [
//       user.email,
//       firstName,
//       lastName || '',
//       imageUrl,
//       true
//     ]);
    
//     const newDriver = insertResult.rows[0];
//     console.log('✅ New driver created in Neon PostgreSQL:', {
//       email: newDriver.email,
//       fname: newDriver.fname,
//       lastname: newDriver.lastname
//     });
//     return newDriver;

//   } catch (error) {
//     console.error('❌ Error in createOrUpdateDriverRecord:', error.message);
//     return null;
//   }
// };

// module.exports = authController;


// const { supabase } = require('../database');
// const db = require('../database');
// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const authController = {
//   login: async (req, res) => {
//     const { email, password } = req.body;

//     try {
//       if (!email || !password) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email and password are required' 
//         });
//       }

//       console.log('🔐 Attempting login for:', email);

//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       if (error) {
//         console.log('❌ Login failed:', error.message);
        
//         let errorMessage = 'Login failed. Please try again.';
        
//         if (error.message.includes('Invalid login credentials')) {
//           errorMessage = 'Invalid email or password';
//         } else if (error.message.includes('Email not confirmed')) {
//           errorMessage = 'Please verify your email address';
//         } else if (error.message.includes('Too many requests')) {
//           errorMessage = 'Too many attempts. Please try again later';
//         }
        
//         return res.status(401).json({
//           success: false,
//           error: errorMessage
//         });
//       }

//       // ✅ FIRST: Check if user exists in our system before proceeding
//       const userExists = await checkUserExistsInSystem(data.user.email);
      
//       if (!userExists) {
//         console.log('❌ User not found in application database:', data.user.email);
//         return res.status(401).json({
//           success: false,
//           error: 'Account not found. Please register as a driver first.'
//         });
//       }

//       // ✅ THEN: Create/update driver record in Neon database (non-blocking)
//       createOrUpdateDriverRecord(data.user).catch(err => {
//         console.log('⚠️ Background driver record update failed:', err.message);
//       });

//       res.json({
//         success: true,
//         user: data.user,
//         session: data.session
//       });

//     } catch (err) {
//       console.error('🚨 Unexpected error in login:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Internal server error' 
//       });
//     }
//   },

//   checkUserType: async (req, res) => {
//     const { email } = req.body;

//     try {
//       if (!email) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email is required' 
//         });
//       }

//       console.log('🔍 Checking user type for:', email);

//       const normalizedEmail = email.toLowerCase();

//       // ✅ FIX: Use correct column names for commuters table
//       const { data: commuter, error: commuterError } = await supabase
//         .from("commuters")
//         .select("commuter_id, first_name, last_name, email, id_type, id_image_url, created_at, pin, rfid, balance")
//         .ilike("email", normalizedEmail)
//         .maybeSingle();

//       if (commuterError) {
//         console.error('❌ Commuter check error:', commuterError.message);
//         throw commuterError;
//       }

//       if (commuter) {
//         console.log('✅ User found as commuter');
//         return res.json({ 
//           success: true,
//           userType: 'commuter', 
//           data: commuter
//         });
//       }

//       // Check driver in Supabase (case insensitive)
//       const { data: driver, error: driverError } = await supabase
//         .from("drivers")
//         .select("driver_id, is_verified, first_name, last_name, email, plate_no")
//         .ilike("email", normalizedEmail)
//         .maybeSingle();

//       if (driverError) {
//         console.error('❌ Driver check error:', driverError.message);
//         throw driverError;
//       }

//       if (driver) {
//         console.log('✅ User found as driver in Supabase');
//         console.log('🔐 Driver verification status:', driver.is_verified);
//         console.log('📧 Actual email in database:', driver.email);
//         return res.json({ 
//           success: true,
//           userType: 'driver', 
//           data: driver 
//         });
//       }

//       console.log('❌ User not found in application system:', normalizedEmail);
//       return res.status(404).json({ 
//         success: false,
//         userType: 'unknown',
//         error: 'User not found in system. Please register first.'
//       });

//     } catch (err) {
//       console.error('🚨 Check user type error:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Failed to check user type' 
//       });
//     }
//   }
// };

// // ✅ UPDATED FUNCTION: Check if user exists in our system (with correct columns)
// const checkUserExistsInSystem = async (email) => {
//   try {
//     const normalizedEmail = email.toLowerCase();

//     // Check if user exists as commuter (using correct columns)
//     const { data: commuter, error: commuterError } = await supabase
//       .from("commuters")
//       .select("commuter_id")
//       .ilike("email", normalizedEmail)
//       .maybeSingle();

//     if (commuterError) {
//       console.error('❌ Commuter check error:', commuterError.message);
//       return false;
//     }

//     if (commuter) {
//       console.log('✅ User exists as commuter');
//       return true;
//     }

//     // Check if user exists as driver
//     const { data: driver, error: driverError } = await supabase
//       .from("drivers")
//       .select("driver_id")
//       .ilike("email", normalizedEmail)
//       .maybeSingle();

//     if (driverError) {
//       console.error('❌ Driver check error:', driverError.message);
//       return false;
//     }

//     if (driver) {
//       console.log('✅ User exists as driver');
//       return true;
//     }

//     console.log('❌ User not found in system:', normalizedEmail);
//     return false;

//   } catch (error) {
//     console.error('❌ Error checking user existence:', error.message);
//     return false;
//   }
// };

// const createOrUpdateDriverRecord = async (user) => {
//   try {
//     // ✅ ADD: Check database connection first
//     let dbConnected = false;
//     try {
//       await db.query('SELECT 1');
//       dbConnected = true;
//       console.log('✅ Database connection verified');
//     } catch (dbError) {
//       console.error('❌ Database connection failed:', dbError.message);
//       dbConnected = false;
//     }

//     if (!dbConnected) {
//       console.log('⚠️ Skipping driver record creation due to database connection issues');
//       return null;
//     }

//     // Check if driver already exists in Neon database
//     const checkDriverSql = 'SELECT * FROM drivers WHERE email = $1';
//     const driverResult = await db.query(checkDriverSql, [user.email]);
//     const existingDriver = driverResult.rows[0];

//     if (existingDriver) {
//       console.log('✅ Driver already exists in Neon database:', user.email);
//       return existingDriver;
//     }

//     console.log('🆕 Creating new driver record for:', user.email);
    
//     let firstName = '';
//     let lastName = '';
    
//     try {
//       // Get driver info from Supabase (case insensitive)
//       const { data: supabaseDriver, error } = await supabase
//         .from("drivers")
//         .select("first_name, last_name")
//         .ilike("email", user.email)
//         .maybeSingle();

//       if (supabaseDriver && !error) {
//         firstName = supabaseDriver.first_name || '';
//         lastName = supabaseDriver.last_name || '';
//         console.log('✅ Got names from Supabase drivers table:', { firstName, lastName });
//       }
//     } catch (error) {
//       console.log('⚠️ Could not fetch driver info from Supabase, will use fallback');
//     }
    
//     if (!firstName) {
//       firstName = user.email.split('@')[0];
//       firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
//       console.log('⚠️ Using fallback name from email:', firstName);
//     }

//     console.log(`👤 Final names - First: "${firstName}", Last: "${lastName}"`);

//     const timestamp = Date.now();
//     const displayName = firstName + (lastName ? ' ' + lastName : '');
//     const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=200&timestamp=${timestamp}`;
    
//     let imageUrl = '';
//     try {
//       const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
//         folder: 'driver-profiles',
//         public_id: `driver-${user.email}-${timestamp}`,
//         overwrite: true
//       });
//       imageUrl = uploadedImage.secure_url;
//       console.log('✅ Profile image uploaded to Cloudinary');
//     } catch (cloudinaryError) {
//       console.error('❌ Cloudinary upload failed:', cloudinaryError);
//       imageUrl = avatarUrl;
//     }

//     // Insert new driver record into Neon PostgreSQL
//     const insertSql = `
//       INSERT INTO drivers (email, fname, lastname, imageurl, is_verified, created_at) 
//       VALUES ($1, $2, $3, $4, $5, NOW()) 
//       RETURNING *
//     `;
    
//     const insertResult = await db.query(insertSql, [
//       user.email,
//       firstName,
//       lastName || '',
//       imageUrl,
//       true
//     ]);
    
//     const newDriver = insertResult.rows[0];
//     console.log('✅ New driver created in Neon PostgreSQL:', {
//       email: newDriver.email,
//       fname: newDriver.fname,
//       lastname: newDriver.lastname
//     });
//     return newDriver;

//   } catch (error) {
//     console.error('❌ Error in createOrUpdateDriverRecord:', error.message);
//     return null;
//   }
// };

// module.exports = authController;

// const { supabase } = require('../database');
// const db = require('../database');
// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const authController = {
//   login: async (req, res) => {
//     const { email, password } = req.body;

//     try {
//       if (!email || !password) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email and password are required' 
//         });
//       }

//       console.log('🔐 Attempting login for:', email);

//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       if (error) {
//         console.log('❌ Login failed:', error.message);
        
//         let errorMessage = 'Login failed. Please try again.';
        
//         if (error.message.includes('Invalid login credentials')) {
//           errorMessage = 'Invalid email or password';
//         } else if (error.message.includes('Email not confirmed')) {
//           errorMessage = 'Please verify your email address';
//         } else if (error.message.includes('Too many requests')) {
//           errorMessage = 'Too many attempts. Please try again later';
//         }
        
//         return res.status(401).json({
//           success: false,
//           error: errorMessage
//         });
//       }

//       // ✅ SIMPLIFIED: Only check if driver exists and get verification status
//       const driverExists = await checkDriverExists(data.user.email);
      
//       if (!driverExists.exists) {
//         console.log('❌ Driver not found in drivers table:', data.user.email);
//         return res.status(401).json({
//           success: false,
//           error: 'Driver account not found. Please register as a driver first.'
//         });
//       }

//       // ✅ THEN: Create/update driver record in Neon database (non-blocking)
//       createOrUpdateDriverRecord(data.user).catch(err => {
//         console.log('⚠️ Background driver record update failed:', err.message);
//       });

//       res.json({
//         success: true,
//         user: data.user,
//         session: data.session
//       });

//     } catch (err) {
//       console.error('🚨 Unexpected error in login:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Internal server error' 
//       });
//     }
//   },

//   // ✅ NEW: Simplified endpoint to only check driver verification
//   checkDriverVerification: async (req, res) => {
//     const { email } = req.body;

//     try {
//       if (!email) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Email is required' 
//         });
//       }

//       console.log('🔍 Checking driver verification for:', email);

//       const normalizedEmail = email.toLowerCase();

//       // Check driver in Supabase (case insensitive)
//       const { data: driver, error: driverError } = await supabase
//         .from("drivers")
//         .select("driver_id, is_verified, first_name, last_name, email, plate_no")
//         .ilike("email", normalizedEmail)
//         .maybeSingle();

//       if (driverError) {
//         console.error('❌ Driver check error:', driverError.message);
//         throw driverError;
//       }

//       if (driver) {
//         console.log('✅ Driver found in Supabase');
//         console.log('🔐 Driver verification status:', driver.is_verified);
//         return res.json({ 
//           success: true,
//           is_verified: driver.is_verified,
//           data: driver 
//         });
//       }

//       console.log('❌ Driver not found:', normalizedEmail);
//       return res.status(404).json({ 
//         success: false,
//         error: 'Driver not found. Please register as a driver first.'
//       });

//     } catch (err) {
//       console.error('🚨 Check driver verification error:', err.message);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Failed to check driver verification' 
//       });
//     }
//   }
// };

// // ✅ SIMPLIFIED: Only check if driver exists
// const checkDriverExists = async (email) => {
//   try {
//     const normalizedEmail = email.toLowerCase();

//     // Check if user exists as driver
//     const { data: driver, error: driverError } = await supabase
//       .from("drivers")
//       .select("driver_id, is_verified")
//       .ilike("email", normalizedEmail)
//       .maybeSingle();

//     if (driverError) {
//       console.error('❌ Driver check error:', driverError.message);
//       return { exists: false, is_verified: false };
//     }

//     if (driver) {
//       console.log('✅ Driver exists');
//       return { 
//         exists: true, 
//         is_verified: driver.is_verified || false 
//       };
//     }

//     console.log('❌ Driver not found in system:', normalizedEmail);
//     return { exists: false, is_verified: false };

//   } catch (error) {
//     console.error('❌ Error checking driver existence:', error.message);
//     return { exists: false, is_verified: false };
//   }
// };

// const createOrUpdateDriverRecord = async (user) => {
//   try {
//     // ✅ ADD: Check database connection first
//     let dbConnected = false;
//     try {
//       await db.query('SELECT 1');
//       dbConnected = true;
//       console.log('✅ Database connection verified');
//     } catch (dbError) {
//       console.error('❌ Database connection failed:', dbError.message);
//       dbConnected = false;
//     }

//     if (!dbConnected) {
//       console.log('⚠️ Skipping driver record creation due to database connection issues');
//       return null;
//     }

//     // Check if driver already exists in Neon database
//     const checkDriverSql = 'SELECT * FROM drivers WHERE email = $1';
//     const driverResult = await db.query(checkDriverSql, [user.email]);
//     const existingDriver = driverResult.rows[0];

//     if (existingDriver) {
//       console.log('✅ Driver already exists in Neon database:', user.email);
//       return existingDriver;
//     }

//     console.log('🆕 Creating new driver record for:', user.email);
    
//     let firstName = '';
//     let lastName = '';
    
//     try {
//       // Get driver info from Supabase (case insensitive)
//       const { data: supabaseDriver, error } = await supabase
//         .from("drivers")
//         .select("first_name, last_name")
//         .ilike("email", user.email)
//         .maybeSingle();

//       if (supabaseDriver && !error) {
//         firstName = supabaseDriver.first_name || '';
//         lastName = supabaseDriver.last_name || '';
//         console.log('✅ Got names from Supabase drivers table:', { firstName, lastName });
//       }
//     } catch (error) {
//       console.log('⚠️ Could not fetch driver info from Supabase, will use fallback');
//     }
    
//     if (!firstName) {
//       firstName = user.email.split('@')[0];
//       firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
//       console.log('⚠️ Using fallback name from email:', firstName);
//     }

//     console.log(`👤 Final names - First: "${firstName}", Last: "${lastName}"`);

//     const timestamp = Date.now();
//     const displayName = firstName + (lastName ? ' ' + lastName : '');
//     const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=200&timestamp=${timestamp}`;
    
//     let imageUrl = '';
//     try {
//       const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
//         folder: 'driver-profiles',
//         public_id: `driver-${user.email}-${timestamp}`,
//         overwrite: true
//       });
//       imageUrl = uploadedImage.secure_url;
//       console.log('✅ Profile image uploaded to Cloudinary');
//     } catch (cloudinaryError) {
//       console.error('❌ Cloudinary upload failed:', cloudinaryError);
//       imageUrl = avatarUrl;
//     }

//     // Insert new driver record into Neon PostgreSQL
//     const insertSql = `
//       INSERT INTO drivers (email, fname, lastname, imageurl, is_verified, created_at) 
//       VALUES ($1, $2, $3, $4, $5, NOW()) 
//       RETURNING *
//     `;
    
//     const insertResult = await db.query(insertSql, [
//       user.email,
//       firstName,
//       lastName || '',
//       imageUrl,
//       true
//     ]);
    
//     const newDriver = insertResult.rows[0];
//     console.log('✅ New driver created in Neon PostgreSQL:', {
//       email: newDriver.email,
//       fname: newDriver.fname,
//       lastname: newDriver.lastname
//     });
//     return newDriver;

//   } catch (error) {
//     console.error('❌ Error in createOrUpdateDriverRecord:', error.message);
//     return null;
//   }
// };

// module.exports = authController;


const { supabase } = require('../database');
const db = require('../database');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and password are required' 
        });
      }

      console.log('🔐 Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.log('❌ Login failed:', error.message);
        
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many attempts. Please try again later';
        }
        
        return res.status(401).json({
          success: false,
          error: errorMessage
        });
      }

      // ✅ SIMPLIFIED: Only check if driver exists and get verification status
      const driverExists = await checkDriverExists(data.user.email);
      
      if (!driverExists.exists) {
        console.log('❌ Driver not found in drivers table:', data.user.email);
        return res.status(401).json({
          success: false,
          error: 'Driver account not found. Please register as a driver first.'
        });
      }

      // ✅ ADD: Check PUV type - only allow Jeepney drivers
      if (driverExists.puv_type) {
        const puvType = driverExists.puv_type.toLowerCase();
        if (puvType !== 'jeepney') {
          return res.status(403).json({
            success: false,
            error: 'Currently, this app is specifically designed for Jeepney drivers. We appreciate your interest and hope to expand to other PUV types in the future.'
          });
        }
      }

      // ✅ THEN: Create/update driver record in Neon database (non-blocking)
      createOrUpdateDriverRecord(data.user).catch(err => {
        console.log('⚠️ Background driver record update failed:', err.message);
      });

      res.json({
        success: true,
        user: data.user,
        session: data.session
      });

    } catch (err) {
      console.error('🚨 Unexpected error in login:', err.message);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  },

  // ✅ NEW: Simplified endpoint to only check driver verification
  checkDriverVerification: async (req, res) => {
    const { email } = req.body;

    try {
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email is required' 
        });
      }

      console.log('🔍 Checking driver verification for:', email);

      const normalizedEmail = email.toLowerCase();

      // Check driver in Supabase (case insensitive)
      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("driver_id, is_verified, first_name, last_name, email, plate_no, puv_type")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (driverError) {
        console.error('❌ Driver check error:', driverError.message);
        throw driverError;
      }

      if (driver) {
        console.log('✅ Driver found in Supabase');
        console.log('🔐 Driver verification status:', driver.is_verified);
        console.log('🚗 Driver PUV type:', driver.puv_type);
        
        // ✅ ADD: Check PUV type - only allow Jeepney drivers
        if (driver.puv_type) {
          const puvType = driver.puv_type.toLowerCase();
          if (puvType !== 'jeepney') {
            return res.status(403).json({ 
              success: false,
              error: 'This app is only available for Jeepney drivers. Your PUV type is: ' + driver.puv_type
            });
          }
        }
        
        return res.json({ 
          success: true,
          is_verified: driver.is_verified,
          data: driver 
        });
      }

      console.log('❌ Driver not found:', normalizedEmail);
      return res.status(404).json({ 
        success: false,
        error: 'Driver not found. Please register as a driver first.'
      });

    } catch (err) {
      console.error('🚨 Check driver verification error:', err.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to check driver verification' 
      });
    }
  }
};

// ✅ SIMPLIFIED: Only check if driver exists
const checkDriverExists = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase();

    // Check if user exists as driver
    const { data: driver, error: driverError } = await supabase
      .from("drivers")
      .select("driver_id, is_verified, puv_type")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (driverError) {
      console.error('❌ Driver check error:', driverError.message);
      return { exists: false, is_verified: false };
    }

    if (driver) {
      console.log('✅ Driver exists');
      console.log('🚗 Driver PUV type:', driver.puv_type);
      return { 
        exists: true, 
        is_verified: driver.is_verified || false,
        puv_type: driver.puv_type || null
      };
    }

    console.log('❌ Driver not found in system:', normalizedEmail);
    return { exists: false, is_verified: false };

  } catch (error) {
    console.error('❌ Error checking driver existence:', error.message);
    return { exists: false, is_verified: false };
  }
};

const createOrUpdateDriverRecord = async (user) => {
  try {
    // ✅ ADD: Check database connection first
    let dbConnected = false;
    try {
      await db.query('SELECT 1');
      dbConnected = true;
      console.log('✅ Database connection verified');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      dbConnected = false;
    }

    if (!dbConnected) {
      console.log('⚠️ Skipping driver record creation due to database connection issues');
      return null;
    }

    // Check if driver already exists in Neon database
    const checkDriverSql = 'SELECT * FROM drivers WHERE email = $1';
    const driverResult = await db.query(checkDriverSql, [user.email]);
    const existingDriver = driverResult.rows[0];

    if (existingDriver) {
      console.log('✅ Driver already exists in Neon database:', user.email);
      return existingDriver;
    }

    console.log('🆕 Creating new driver record for:', user.email);
    
    let firstName = '';
    let lastName = '';
    let puvType = '';
    
    try {
      // Get driver info from Supabase (case insensitive)
      const { data: supabaseDriver, error } = await supabase
        .from("drivers")
        .select("first_name, last_name, puv_type")
        .ilike("email", user.email)
        .maybeSingle();

      if (supabaseDriver && !error) {
        firstName = supabaseDriver.first_name || '';
        lastName = supabaseDriver.last_name || '';
        puvType = supabaseDriver.puv_type || '';
        console.log('✅ Got names from Supabase drivers table:', { firstName, lastName, puv_type: puvType });
      }
    } catch (error) {
      console.log('⚠️ Could not fetch driver info from Supabase, will use fallback');
    }
    
    if (!firstName) {
      firstName = user.email.split('@')[0];
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      console.log('⚠️ Using fallback name from email:', firstName);
    }

    console.log(`👤 Final names - First: "${firstName}", Last: "${lastName}", PUV Type: "${puvType}"`);

    const timestamp = Date.now();
    const displayName = firstName + (lastName ? ' ' + lastName : '');
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=200&timestamp=${timestamp}`;
    
    let imageUrl = '';
    try {
      const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
        folder: 'driver-profiles',
        public_id: `driver-${user.email}-${timestamp}`,
        overwrite: true
      });
      imageUrl = uploadedImage.secure_url;
      console.log('✅ Profile image uploaded to Cloudinary');
    } catch (cloudinaryError) {
      console.error('❌ Cloudinary upload failed:', cloudinaryError);
      imageUrl = avatarUrl;
    }

    // Insert new driver record into Neon PostgreSQL
    const insertSql = `
      INSERT INTO drivers (email, fname, lastname, imageurl, is_verified, puv_type, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
      RETURNING *
    `;
    
    const insertResult = await db.query(insertSql, [
      user.email,
      firstName,
      lastName || '',
      imageUrl,
      true,
      puvType || 'Jeepney'
    ]);
    
    const newDriver = insertResult.rows[0];
    console.log('✅ New driver created in Neon PostgreSQL:', {
      email: newDriver.email,
      fname: newDriver.fname,
      lastname: newDriver.lastname,
      puv_type: newDriver.puv_type
    });
    return newDriver;

  } catch (error) {
    console.error('❌ Error in createOrUpdateDriverRecord:', error.message);
    return null;
  }
};

module.exports = authController;
