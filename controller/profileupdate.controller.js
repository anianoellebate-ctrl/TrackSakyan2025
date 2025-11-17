// controllers/profileUpdateController.js
const db = require('../database');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dabx61gn9',
  api_key: '568778585574721',
  api_secret: 'ZLWh362xBUdLRHkR_gfQ5RvOD7I',
});

const profileUpdateController = {
  updateProfile: async (req, res) => {
    try {
      const { fname, email, currentPassword, newPassword, profileImage } = req.body;

      console.log('Received update request for email:', email);
      console.log('Received data:', { 
        fname, 
        hasCurrentPassword: !!currentPassword, 
        hasNewPassword: !!newPassword, 
        hasImage: !!profileImage 
      });

      // Validate that we have at least one field to update
      const hasUpdates = fname !== undefined || newPassword !== undefined || profileImage !== undefined;
      
      if (!hasUpdates) {
        return res.status(400).json({ 
          success: false, 
          message: 'No fields to update' 
        });
      }

      // Email is required for identification
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is required for identification' 
        });
      }

      // First, get the current user data to verify current password
      const userResult = await db.query('SELECT * FROM commuters WHERE email = $1', [email]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const currentUser = userResult.rows[0];

      // Verify current password if trying to change password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to change password'
          });
        }

        // Compare provided current password with stored plain text password
        if (currentPassword !== currentUser.password) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }
      }

      let imageUrl = null;
      
      // Upload new profile image to Cloudinary if provided
      if (profileImage && profileImage.startsWith('data:image/')) {
        try {
          console.log('Uploading image to Cloudinary...');
          // Extract base64 data from data URL
          const base64Data = profileImage.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Upload to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: 'TrackSakay/Profiles' },
              (error, result) => {
                if (result) {
                  console.log('Image uploaded successfully:', result.secure_url);
                  resolve(result);
                } else {
                  console.error('Cloudinary upload error:', error);
                  reject(error);
                }
              }
            ).end(buffer);
          });
          
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Error uploading to Cloudinary:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image'
          });
        }
      }

      // Build the update query dynamically based on provided fields
      let updateSql = 'UPDATE commuters SET';
      let values = [];
      let paramCount = 1;
      let setClauses = [];

      // Add fname to update if provided
      if (fname !== undefined) {
        setClauses.push(` fname = $${paramCount}`);
        values.push(fname);
        paramCount++;
      }

      // Add new password to update if provided (store as plain text)
      if (newPassword) {
        setClauses.push(` password = $${paramCount}`);
        values.push(newPassword); // Store as plain text to match your signup
        paramCount++;
      }

      // Add profile image to update if provided
      if (imageUrl) {
        setClauses.push(` "profile-image" = $${paramCount}`);
        values.push(imageUrl);
        paramCount++;
      }

      // Add WHERE clause
      updateSql += setClauses.join(',') + ` WHERE email = $${paramCount} RETURNING *`;
      values.push(email);

      console.log('Executing SQL:', updateSql);
      console.log('With values:', values);

      // Execute the update query
      const updateResult = await db.query(updateSql, values);

      if (updateResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updateResult.rows[0]
      });

    } catch (error) {
      console.error('Profile Update Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Profile update failed: ' + error.message 
      });
    }
  },
};

module.exports = profileUpdateController;