// const db = require('../database');
// const cloudinary = require('cloudinary').v2;
// const multer = require('../middleware/multer');
// const { Readable } = require('stream');
// const QRCode = require('qrcode'); // Add this package

// cloudinary.config({
//   cloud_name: 'dabx61gn9',
//   api_key: '568778585574721',
//   api_secret: 'ZLWh362xBUdLRHkR_gfQ5RvOD7I',
// });

// const uploadToCloudinary = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: 'TrackSakay/Drivers' },
//       (error, result) => {
//         if (result) resolve(result);
//         else reject(error);
//       }
//     );

//     const readable = new Readable();
//     readable._read = () => {};
//     readable.push(buffer);
//     readable.push(null);
//     readable.pipe(stream);
//   });
// };

// const driverSignupController = {
//   signupDriver: async (req, res) => {
//     const { FirstName, LastName, Route, Type, Email, Password } = req.body;
//     const file = req.file;

//     if (!FirstName || !LastName || !Route || !Type || !Email || !Password || !file) {
//       return res.status(400).json({ success: false, message: 'All fields are required.' });
//     }

//     try {

//       let maxCapacity;
//       if (Type.toLowerCase() === 'multicab') {
//         maxCapacity = 18;
//       } else if (Type.toLowerCase() === 'traditional') {
//         maxCapacity = 22;
//       } else {
//         return res.status(400).json({ success: false, message: 'Invalid jeepney type' });
//       }

//       // Upload driver image
//       const result = await uploadToCloudinary(file.buffer);
//       const imageUrl = result.secure_url;

//       // Insert driver into database (Postgres syntax with RETURNING)
//       const insertSql = `
//         INSERT INTO drivers (fname, lastname, route, imageurl, email, password, max_capacity)
//         VALUES ($1, $2, $3, $4, $5, $6, $7)
//         RETURNING driverid
//       `;
//       const values = [FirstName, LastName, Route, imageUrl, Email, Password, maxCapacity];

//       const insertResult = await db.query(insertSql, values);
//       const driverID = insertResult.rows[0].driverid;

//       try {
//         // Generate QR codes
//         const addQRData = JSON.stringify({ 
//           driverID, 
//           action: 'add',
//           email: Email
//         });
        
//         const minusQRData = JSON.stringify({ 
//           driverID, 
//           action: 'minus',
//           email: Email
//         });
        
//         // Generate QR code buffers
//         const addQRBuffer = await QRCode.toBuffer(addQRData);
//         const minusQRBuffer = await QRCode.toBuffer(minusQRData);
        
//         // Upload QR codes to Cloudinary
//         const [addQRResult, minusQRResult] = await Promise.all([
//           uploadToCloudinary(addQRBuffer),
//           uploadToCloudinary(minusQRBuffer)
//         ]);
        
//         // Update driver with QR code URLs
//         const updateSql = `
//           UPDATE drivers 
//           SET qr_add = $1, qr_minus = $2, capacity = 0 
//           WHERE driverid = $3
//         `;
        
//         await db.query(updateSql, [addQRResult.secure_url, minusQRResult.secure_url, driverID]);
        
//         res.json({
//           success: true,
//           message: 'Driver registered successfully',
//           driverID: driverID,
//         });
//       } catch (qrError) {
//         console.error('QR Code Error:', qrError);
//         res.status(500).json({ 
//           success: false, 
//           message: 'QR code generation failed' 
//         });
//       }
//     } catch (error) {
//       console.error('DB/Cloudinary Error:', error);
//       res.status(500).json({ success: false, message: 'Image upload or database failed' });
//     }
//   },
// };

// module.exports = driverSignupController;

const db = require('../database');
const cloudinary = require('cloudinary').v2;
const multer = require('../middleware/multer');
const { Readable } = require('stream');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

cloudinary.config({
  cloud_name: 'dabx61gn9',
  api_key: '568778585574721',
  api_secret: 'ZLWh362xBUdLRHkR_gfQ5RvOD7I',
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'TrackSakay/Drivers' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// Email sending function
async function sendVerificationEmail(email, name, verificationCode) {
  try {
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
      subject: 'Verify Your Email Address - TrackSakyan Driver',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #437057;">Email Verification - TrackSakyan Driver</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering as a driver. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px; font-size: 32px;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>Once verified, your account will be reviewed by our admin team.</p>
          <br>
          <p>Best regards,<br>TrackSakyan Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

const driverSignupController = {
  signupDriver: async (req, res) => {
    const { FirstName, LastName, Route, Type, Email, Password, PlateNumber } = req.body;
    const file = req.file;

    if (!FirstName || !LastName || !Route || !Type || !Email || !Password || !file || !PlateNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
      // Check if email already exists
      const checkEmailSql = 'SELECT * FROM drivers WHERE email = $1';
      const emailCheck = await db.query(checkEmailSql, [Email]);
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const checkPlateSql = 'SELECT * FROM drivers WHERE plate_number = $1';
      const plateCheck = await db.query(checkPlateSql, [PlateNumber.trim().toUpperCase()]);
      
      if (plateCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Plate number already exists' });
      }

      let maxCapacity;
      if (Type.toLowerCase() === 'multicab') {
        maxCapacity = 18;
      } else if (Type.toLowerCase() === 'traditional') {
        maxCapacity = 22;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid jeepney type' });
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Upload driver image
      const result = await uploadToCloudinary(file.buffer);
      const imageUrl = result.secure_url;

      // Insert driver into database with verification code
      const insertSql = `
        INSERT INTO drivers (fname, lastname, route, imageurl, email, password, max_capacity, verification_code, is_verified, plate_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING driverid
      `;
      const values = [FirstName, LastName, Route, imageUrl, Email, Password, maxCapacity, verificationCode, false,  PlateNumber.trim().toUpperCase() ];

      const insertResult = await db.query(insertSql, values);
      const driverID = insertResult.rows[0].driverid;

      // Send verification email
      try {
        await sendVerificationEmail(Email, `${FirstName} ${LastName}`, verificationCode);
      } catch (emailError) {
        console.error('Email sending failed but driver was created:', emailError);
      }

      res.json({
        success: true,
        message: 'Driver registered. Please check your email for verification code.',
        driverID: driverID,
        requiresVerification: true
      });

    } catch (error) {
      console.error('DB/Cloudinary Error:', error);
      res.status(500).json({ success: false, message: 'Image upload or database failed' });
    }
  },

  // Verify driver email
  verifyEmail: async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
      const sql = 'SELECT * FROM drivers WHERE email = $1 AND verification_code = $2';
      const result = await db.query(sql, [email, verificationCode]);

      if (result.rows.length === 0) {
        return res.status(200).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      // Update driver as verified
      const updateSql = 'UPDATE drivers SET is_verified = true, verification_code = NULL WHERE email = $1';
      await db.query(updateSql, [email]);

      // Generate QR codes after verification
      try {
        const driverID = result.rows[0].driverid;
        
        const addQRData = JSON.stringify({ 
          driverID, 
          action: 'add',
          email: email
        });
        
        const minusQRData = JSON.stringify({ 
          driverID, 
          action: 'minus',
          email: email
        });
        
        // Generate QR code buffers
        const addQRBuffer = await QRCode.toBuffer(addQRData);
        const minusQRBuffer = await QRCode.toBuffer(minusQRData);
        
        // Upload QR codes to Cloudinary
        const [addQRResult, minusQRResult] = await Promise.all([
          uploadToCloudinary(addQRBuffer),
          uploadToCloudinary(minusQRBuffer)
        ]);
        
        // Update driver with QR code URLs
        const qrUpdateSql = `
          UPDATE drivers 
          SET qr_add = $1, qr_minus = $2, capacity = 0 
          WHERE driverid = $3
        `;
        
        await db.query(qrUpdateSql, [addQRResult.secure_url, minusQRResult.secure_url, driverID]);
        
        res.status(200).json({ 
          success: true, 
          message: 'Email verified successfully and QR codes generated' 
        });
      } catch (qrError) {
        console.error('QR Code Error:', qrError);
        res.status(200).json({ 
          success: true, 
          message: 'Email verified but QR code generation failed. Contact support.' 
        });
      }
    } catch (err) {
      console.error('Error verifying email:', err);
      res.status(200).json({ 
        success: false, 
        message: 'Server error during verification' 
      });
    }
  },

  // Resend verification code
  resendVerification: async (req, res) => {
    const { email } = req.body;

    try {
      // Generate new verification code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update driver with new code
      const updateSql = 'UPDATE drivers SET verification_code = $1 WHERE email = $2 RETURNING fname, lastname';
      const result = await db.query(updateSql, [newVerificationCode, email]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }

      // Send new verification email
      await sendVerificationEmail(email, `${result.rows[0].fname} ${result.rows[0].lastname}`, newVerificationCode);

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

module.exports = driverSignupController;
