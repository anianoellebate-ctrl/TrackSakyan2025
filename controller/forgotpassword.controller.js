const db = require('../database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Password hashing function (same as in signup controller)
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
};

const forgotPasswordController = {
  // Step 1: Request password reset
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
      // Check if email exists in commuters table
      const userResult = await db.query('SELECT * FROM commuters WHERE email = $1', [email]);

      if (userResult.rows.length === 0) {
        return res.json({ 
          success: false, 
          message: 'Email not found' 
        });
      }

      // Generate reset code (6-digit)
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store reset code with expiration (1 hour)
      const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      const updateSql = `
        UPDATE commuters 
        SET reset_code = $1, reset_code_expires = $2 
        WHERE email = $3
      `;
      
      await db.query(updateSql, [resetCode, expirationTime, email]);

      // Send reset code email
      try {
        await sendResetCodeEmail(email, userResult.rows[0].fname, resetCode);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue anyway - user can request new code
      }

      res.json({ 
        success: true, 
        message: 'Reset code sent to your email' 
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Step 2: Verify reset code
  verifyResetCode: async (req, res) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and verification code are required' 
      });
    }

    try {
      const sql = `
        SELECT * FROM commuters 
        WHERE email = $1 AND reset_code = $2 AND reset_code_expires > NOW()
      `;
      const result = await db.query(sql, [email, verificationCode]);

      if (result.rows.length === 0) {
        return res.json({ 
          success: false, 
          message: 'Invalid or expired verification code' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Code verified successfully' 
      });
    } catch (err) {
      console.error('Verify reset code error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Step 3: Reset password
  resetPassword: async (req, res) => {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.json({ 
        success: false, 
        message: 'Password must be at least 8 characters' 
      });
    }

    try {
      // Verify code again before resetting password
      const verifySql = `
        SELECT * FROM commuters 
        WHERE email = $1 AND reset_code = $2 AND reset_code_expires > NOW()
      `;
      const verifyResult = await db.query(verifySql, [email, verificationCode]);

      if (verifyResult.rows.length === 0) {
        return res.json({ 
          success: false, 
          message: 'Invalid or expired verification code' 
        });
      }

      // Hash new password
      const hashedPassword = hashPassword(newPassword);

      // Update password and clear reset code
      const updateSql = `
        UPDATE commuters 
        SET password = $1, reset_code = NULL, reset_code_expires = NULL 
        WHERE email = $2 AND reset_code = $3
      `;
      
      await db.query(updateSql, [hashedPassword, email, verificationCode]);

      res.json({ 
        success: true, 
        message: 'Password reset successfully' 
      });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Resend reset code
  resendResetCode: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    try {
      // Check if user exists
      const userResult = await db.query('SELECT * FROM commuters WHERE email = $1', [email]);

      if (userResult.rows.length === 0) {
        return res.json({ 
          success: false, 
          message: 'Email not found' 
        });
      }

      // Generate new reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Update reset code
      const updateSql = `
        UPDATE commuters 
        SET reset_code = $1, reset_code_expires = $2 
        WHERE email = $3
      `;
      
      await db.query(updateSql, [resetCode, expirationTime, email]);

      // Send new reset code email
      try {
        await sendResetCodeEmail(email, userResult.rows[0].fname, resetCode);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      res.json({ 
        success: true, 
        message: 'Reset code resent to your email' 
      });
    } catch (err) {
      console.error('Resend reset code error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

// Function to send reset code email
async function sendResetCodeEmail(email, name, resetCode) {
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
      subject: 'Password Reset Code - TrackSakyan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #437057;">Password Reset - TrackSakyan</h2>
          <p>Hello ${name},</p>
          <p>You requested to reset your password. Please use the following verification code:</p>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="margin: 0; color: #333; letter-spacing: 5px; font-size: 32px;">${resetCode}</h1>
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>TrackSakyan Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Reset code email sent to:', email);
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
}

module.exports = forgotPasswordController;
