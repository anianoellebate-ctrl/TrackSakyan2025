// const db = require('../database');
// const cloudinary = require('cloudinary').v2;

// // Configure Cloudinary (you should set these as environment variables)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const signupController = {
//   signupCommuter: async (req, res) => {
//     const { FName, Email, Password } = req.body;

//     if (!FName || !Email || !Password) {
//       return res.status(400).json({ success: false, message: 'All fields are required' });
//     }
    
//     try {
//       // Generate avatar URL
//       const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(FName)}&background=random&size=200`;
      
//       // Upload to Cloudinary
//       const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
//         folder: 'commuter-profiles',
//         public_id: `commuter-${Email}`,
//         overwrite: false
//       });
      
//       const sql = 'INSERT INTO commuters (fname, email, password, "profile-image") VALUES ($1, $2, $3, $4) RETURNING commuter_id';
//       const result = await db.query(sql, [FName, Email, Password, uploadedImage.secure_url]);

//       res.json({ 
//         success: true, 
//         message: 'Commuter registered', 
//         commuterID: result.rows[0].commuter_id,
//         profileImage: uploadedImage.secure_url
//       });
//     } catch (err) {
//       console.error('Error:', err);
      
//       // Handle unique constraint violation
//       if (err.code === '23505') {
//         return res.status(400).json({ success: false, message: 'Email already exists' });
//       }
      
//       // Handle Cloudinary errors
//       if (err.message.includes('Cloudinary')) {
//         return res.status(500).json({ success: false, message: 'Error processing profile image' });
//       }
      
//       return res.status(500).json({ success: false, message: 'Server error' });
//     }
//   }
// };

// module.exports = signupController;





// const db = require('../database');
// const cloudinary = require('cloudinary').v2;
// const nodemailer = require('nodemailer');
// // const { google } = require('googleapis');

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });


// const signupController = {
// signupCommuter: async (req, res) => {
//   const { FName, Email, Password } = req.body;

//   if (!FName || !Email || !Password) {
//     return res.status(400).json({ success: false, message: 'All fields are required' });
//   }
  
//   try {
//     // Check if email already exists
//     const checkEmailSql = `
//       SELECT email FROM commuters WHERE email = $1 
//       UNION ALL 
//       SELECT email FROM drivers WHERE email = $1
//     `;
//     const emailCheck = await db.query(checkEmailSql, [Email]);
    
//     if (emailCheck.rows.length > 0) {
//       return res.status(400).json({ success: false, message: 'Email already exists' });
//     }

//     // Generate verification code (6-digit)
//     const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
//           // Generate avatar URL with unique timestamp to prevent caching
//       const timestamp = Date.now();
//       const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(FName)}&background=random&size=200&timestamp=${timestamp}`;
    
//     // Upload to Cloudinary
//     const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
//       folder: 'commuter-profiles',
//       public_id: `commuter-${Email}-${timestamp}`,
//       overwrite: true // Allow overwrite since we're using unique IDs
//     });

//     // Store user with verification code (initially not verified)
//     const sql = `
//       INSERT INTO commuters (fname, email, password, "profile-image", verification_code, is_verified) 
//       VALUES ($1, $2, $3, $4, $5, $6) 
//       RETURNING commuter_id
//     `;
    
//     const result = await db.query(sql, [
//       FName, 
//       Email, 
//       Password, 
//       uploadedImage.secure_url, 
//       verificationCode,
//       false // Not verified yet
//     ]);

//     // Send verification email (but don't fail if email doesn't send)
//     try {
//       await sendVerificationEmail(Email, FName, verificationCode);
//     } catch (emailError) {
//       console.error('Email sending failed but user was created:', emailError);
//       // Continue anyway - user can request a new code later
//     }

//     res.json({ 
//       success: true, 
//       message: 'Commuter registered. Please check your email for verification code.', 
//       commuterID: result.rows[0].commuter_id,
//       profileImage: uploadedImage.secure_url,
//       requiresVerification: true
//     });
//   } catch (err) {
//     console.error('Error:', err);
    
//     if (err.code === '23505') {
//       return res.status(400).json({ success: false, message: 'Email already exists' });
//     }
    
//     if (err.message.includes('Cloudinary')) {
//       return res.status(500).json({ success: false, message: 'Error processing profile image' });
//     }
    
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// },

//   // Add this method to verify email code
// // Update the verifyEmail function in your signup controller
// verifyEmail: async (req, res) => {
//   const { email, verificationCode } = req.body;

//   try {
//     const sql = 'SELECT * FROM commuters WHERE email = $1 AND verification_code = $2';
//     const result = await db.query(sql, [email, verificationCode]);

//     if (result.rows.length === 0) {
//       // Return 200 but with success: false
//       return res.status(200).json({ 
//         success: false, 
//         message: 'Invalid verification code' 
//       });
//     }

//     // Update user as verified
//     const updateSql = 'UPDATE commuters SET is_verified = true, verification_code = NULL WHERE email = $1';
//     await db.query(updateSql, [email]);

//     res.status(200).json({ 
//       success: true, 
//       message: 'Email verified successfully' 
//     });
//   } catch (err) {
//     console.error('Error verifying email:', err);
//     // Return 200 but with success: false
//     res.status(200).json({ 
//       success: false, 
//       message: 'Server error during verification' 
//     });
//   }
// },

//   // Add this method to resend verification code
//   resendVerification: async (req, res) => {
//     const { email } = req.body;

//     try {
//       // Generate new verification code
//       const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
//       // Update user with new code
//       const updateSql = 'UPDATE commuters SET verification_code = $1 WHERE email = $2 RETURNING fname';
//       const result = await db.query(updateSql, [newVerificationCode, email]);

//       if (result.rows.length === 0) {
//         return res.status(404).json({ success: false, message: 'User not found' });
//       }

//       // Send new verification email
//       await sendVerificationEmail(email, result.rows[0].fname, newVerificationCode);

//       res.json({ 
//         success: true, 
//         message: 'Verification code resent successfully' 
//       });
//     } catch (err) {
//       console.error('Error resending verification:', err);
//       res.status(500).json({ success: false, message: 'Server error' });
//     }
//   }
// };

// // Function to send verification email using Gmail
// // Replace the sendVerificationEmail function with this:
// async function sendVerificationEmail(email, name, verificationCode) {
//   try {
//     // Use SMTP directly instead of OAuth2
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_APP_PASSWORD 
//       },
//     });

//     const mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: 'Verify Your Email Address - TrackSakyan',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #437057;">Email Verification - TrackSakay</h2>
//           <p>Hello ${name},</p>
//           <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
//           <div style="background-color: #f0f0f0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
//             <h1 style="margin: 0; color: #333; letter-spacing: 5px; font-size: 32px;">${verificationCode}</h1>
//           </div>
//           <p>This code will expire in 24 hours.</p>
//           <p>If you didn't create an account with us, please ignore this email.</p>
//           <br>
//           <p>Best regards,<br>TrackSakyan Team</p>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent to:', email);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     // Don't throw error here - just log it but still return success
//     // This way the user gets created even if email fails
//   }
// }

// module.exports = signupController;


// const db = require('../database');
// const { supabase } = require('../database');
// const cloudinary = require('cloudinary').v2;
// const nodemailer = require('nodemailer');

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const signupController = {
//   signupCommuter: async (req, res) => {
//     const { FName, Email, Password } = req.body;

//     if (!FName || !Email || !Password) {
//       return res.status(400).json({ success: false, message: 'All fields are required' });
//     }
    
//     try {
//       // Check if email already exists in local databases
//       const checkLocalEmailSql = `
//         SELECT email FROM commuters WHERE email = $1 
//         UNION ALL 
//         SELECT email FROM drivers WHERE email = $1
//       `;
//       const localEmailCheck = await db.query(checkLocalEmailSql, [Email]);
      
//       if (localEmailCheck.rows.length > 0) {
//         return res.status(400).json({ success: false, message: 'Email already exists in local system' });
//       }

//       // Check if email exists in partner Supabase drivers table
//       const { data: partnerDrivers, error } = await supabase
//         .from('drivers')
//         .select('email')
//         .eq('email', Email);

//       if (error) {
//         console.error('Error checking partner database:', error);
//         // Continue with registration even if partner check fails
//       } else if (partnerDrivers && partnerDrivers.length > 0) {
//         return res.status(400).json({ success: false, message: 'Email already exists in partner system' });
//       }

//       // Generate verification code (6-digit)
//       const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
//       // Generate avatar URL with unique timestamp to prevent caching
//       const timestamp = Date.now();
//       const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(FName)}&background=random&size=200&timestamp=${timestamp}`;
    
//       // Upload to Cloudinary
//       const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
//         folder: 'commuter-profiles',
//         public_id: `commuter-${Email}-${timestamp}`,
//         overwrite: true // Allow overwrite since we're using unique IDs
//       });

//       // Store user with verification code (initially not verified)
//       const sql = `
//         INSERT INTO commuters (fname, email, password, "profile-image", verification_code, is_verified) 
//         VALUES ($1, $2, $3, $4, $5, $6) 
//         RETURNING commuter_id
//       `;
      
//       const result = await db.query(sql, [
//         FName, 
//         Email, 
//         Password, 
//         uploadedImage.secure_url, 
//         verificationCode,
//         false // Not verified yet
//       ]);

//       // Send verification email (but don't fail if email doesn't send)
//       try {
//         await sendVerificationEmail(Email, FName, verificationCode);
//       } catch (emailError) {
//         console.error('Email sending failed but user was created:', emailError);
//         // Continue anyway - user can request a new code later
//       }

//       res.json({ 
//         success: true, 
//         message: 'Commuter registered. Please check your email for verification code.', 
//         commuterID: result.rows[0].commuter_id,
//         profileImage: uploadedImage.secure_url,
//         requiresVerification: true
//       });
//     } catch (err) {
//       console.error('Error:', err);
      
//       if (err.code === '23505') {
//         return res.status(400).json({ success: false, message: 'Email already exists' });
//       }
      
//       if (err.message.includes('Cloudinary')) {
//         return res.status(500).json({ success: false, message: 'Error processing profile image' });
//       }
      
//       return res.status(500).json({ success: false, message: 'Server error' });
//     }
//   },

//   // Add this method to verify email code
//   verifyEmail: async (req, res) => {
//     const { email, verificationCode } = req.body;

//     try {
//       const sql = 'SELECT * FROM commuters WHERE email = $1 AND verification_code = $2';
//       const result = await db.query(sql, [email, verificationCode]);

//       if (result.rows.length === 0) {
//         // Return 200 but with success: false
//         return res.status(200).json({ 
//           success: false, 
//           message: 'Invalid verification code' 
//         });
//       }

//       // Update user as verified
//       const updateSql = 'UPDATE commuters SET is_verified = true, verification_code = NULL WHERE email = $1';
//       await db.query(updateSql, [email]);

//       res.status(200).json({ 
//         success: true, 
//         message: 'Email verified successfully' 
//       });
//     } catch (err) {
//       console.error('Error verifying email:', err);
//       // Return 200 but with success: false
//       res.status(200).json({ 
//         success: false, 
//         message: 'Server error during verification' 
//       });
//     }
//   },

//   // Add this method to resend verification code
//   resendVerification: async (req, res) => {
//     const { email } = req.body;

//     try {
//       // Generate new verification code
//       const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
//       // Update user with new code
//       const updateSql = 'UPDATE commuters SET verification_code = $1 WHERE email = $2 RETURNING fname';
//       const result = await db.query(updateSql, [newVerificationCode, email]);

//       if (result.rows.length === 0) {
//         return res.status(404).json({ success: false, message: 'User not found' });
//       }

//       // Send new verification email
//       await sendVerificationEmail(email, result.rows[0].fname, newVerificationCode);

//       res.json({ 
//         success: true, 
//         message: 'Verification code resent successfully' 
//       });
//     } catch (err) {
//       console.error('Error resending verification:', err);
//       res.status(500).json({ success: false, message: 'Server error' });
//     }
//   }
// };

// // Function to send verification email using Gmail
// async function sendVerificationEmail(email, name, verificationCode) {
//   try {
//     // Use SMTP directly instead of OAuth2
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_APP_PASSWORD 
//       },
//     });

//     const mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: 'Verify Your Email Address - TrackSakyan',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #437057;">Email Verification - TrackSakay</h2>
//           <p>Hello ${name},</p>
//           <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
//           <div style="background-color: #f0f0f0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
//             <h1 style="margin: 0; color: #333; letter-spacing: 5px; font-size: 32px;">${verificationCode}</h1>
//           </div>
//           <p>This code will expire in 24 hours.</p>
//           <p>If you didn't create an account with us, please ignore this email.</p>
//           <br>
//           <p>Best regards,<br>TrackSakyan Team</p>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent to:', email);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     // Don't throw error here - just log it but still return success
//     // This way the user gets created even if email fails
//   }
// }

// module.exports = signupController;


const db = require('../database');
const { supabase } = require('../database');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Built-in Node.js module

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Password hashing function using crypto
const hashPassword = (password) => {
  // Create a salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password with salt using SHA-256
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  
  // Return the hash and salt together (we'll store them combined)
  return `${salt}:${hash}`;
};

const signupController = {
  signupCommuter: async (req, res) => {
    const { FName, Email, Password } = req.body;

    if (!FName || !Email || !Password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    try {
      // Check if email already exists in local databases
      const checkLocalEmailSql = `
        SELECT email FROM commuters WHERE email = $1 
        UNION ALL 
        SELECT email FROM drivers WHERE email = $1
      `;
      const localEmailCheck = await db.query(checkLocalEmailSql, [Email]);
      
      if (localEmailCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already exists in local system' });
      }

      // Check if email exists in partner Supabase drivers table
      const { data: partnerDrivers, error } = await supabase
        .from('drivers')
        .select('email')
        .eq('email', Email);

      if (error) {
        console.error('Error checking partner database:', error);
        // Continue with registration even if partner check fails
      } else if (partnerDrivers && partnerDrivers.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already exists in partner system' });
      }

      // Generate verification code (6-digit)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
      // Generate avatar URL with unique timestamp to prevent caching
      const timestamp = Date.now();
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(FName)}&background=random&size=200&timestamp=${timestamp}`;
    
      // Upload to Cloudinary
      const uploadedImage = await cloudinary.uploader.upload(avatarUrl, {
        folder: 'commuter-profiles',
        public_id: `commuter-${Email}-${timestamp}`,
        overwrite: true // Allow overwrite since we're using unique IDs
      });

      // Hash the password before storing
      const hashedPassword = hashPassword(Password);

      // Store user with verification code (initially not verified)
      const sql = `
        INSERT INTO commuters (fname, email, password, "profile-image", verification_code, is_verified) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING commuter_id
      `;
      
      const result = await db.query(sql, [
        FName, 
        Email, 
        hashedPassword, // Store the hashed password instead of plain text
        uploadedImage.secure_url, 
        verificationCode,
        false // Not verified yet
      ]);

      // Send verification email (but don't fail if email doesn't send)
      try {
        await sendVerificationEmail(Email, FName, verificationCode);
      } catch (emailError) {
        console.error('Email sending failed but user was created:', emailError);
        // Continue anyway - user can request a new code later
      }

      res.json({ 
        success: true, 
        message: 'Commuter registered. Please check your email for verification code.', 
        commuterID: result.rows[0].commuter_id,
        profileImage: uploadedImage.secure_url,
        requiresVerification: true
      });
    } catch (err) {
      console.error('Error:', err);
      
      if (err.code === '23505') {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      
      if (err.message.includes('Cloudinary')) {
        return res.status(500).json({ success: false, message: 'Error processing profile image' });
      }
      
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Add this method to verify email code
  verifyEmail: async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
      const sql = 'SELECT * FROM commuters WHERE email = $1 AND verification_code = $2';
      const result = await db.query(sql, [email, verificationCode]);

      if (result.rows.length === 0) {
        // Return 200 but with success: false
        return res.status(200).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      // Update user as verified
      const updateSql = 'UPDATE commuters SET is_verified = true, verification_code = NULL WHERE email = $1';
      await db.query(updateSql, [email]);

      res.status(200).json({ 
        success: true, 
        message: 'Email verified successfully' 
      });
    } catch (err) {
      console.error('Error verifying email:', err);
      // Return 200 but with success: false
      res.status(200).json({ 
        success: false, 
        message: 'Server error during verification' 
      });
    }
  },

  // Add this method to resend verification code
  resendVerification: async (req, res) => {
    const { email } = req.body;

    try {
      // Generate new verification code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user with new code
      const updateSql = 'UPDATE commuters SET verification_code = $1 WHERE email = $2 RETURNING fname';
      const result = await db.query(updateSql, [newVerificationCode, email]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Send new verification email
      await sendVerificationEmail(email, result.rows[0].fname, newVerificationCode);

      res.json({ 
        success: true, 
        message: 'Verification code resent successfully' 
      });
    } catch (err) {
      console.error('Error resending verification:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

// Function to send verification email using Gmail
async function sendVerificationEmail(email, name, verificationCode) {
  try {
    // Use SMTP directly instead of OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD 
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Verify Your Email Address - TrackSakyan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #437057;">Email Verification - TrackSakay</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px; font-size: 32px;">${verificationCode}</h1>
          </div>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <br>
          <p>Best regards,<br>TrackSakyan Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error here - just log it but still return success
    // This way the user gets created even if email fails
  }
}

module.exports = signupController;

