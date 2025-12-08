// const db = require('../database');
// const cloudinary = require('cloudinary').v2;
// const { Readable } = require('stream');

// cloudinary.config({
//   cloud_name: 'dabx61gn9',
//   api_key: '568778585574721',
//   api_secret: 'ZLWh362xBUdLRHkR_gfQ5RvOD7I',
// });

// const uploadToCloudinary = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: 'TrackSakay/TrafficReports' }, // Using a different folder
//       (error, result) => {
//         if (result) resolve(result);
//         else reject(error);
//       }
//     );

//     const readable = new Readable();
//     readable._read = () => {};
//     readable.push(buffer);
//     readable.push(null);
//     readable.pipe(stream);
//   });
// };

// // Test endpoint to check if API is working
// exports.testEndpoint = async (req, res) => {
//   try {
//     console.log('✅ Traffic reports test endpoint hit');
//     res.json({
//       success: true,
//       message: 'Traffic reports API is working',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Test endpoint error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Test failed',
//       error: error.message
//     });
//   }
// };

// // Get all traffic reports
// exports.getTrafficReports = async (req, res) => {
//   try {
//     console.log('📋 Fetching traffic reports...');
    
//     const sql = `
//       SELECT 
//         tr.*,
//         COALESCE(c."profile-image", d.imageurl) as "profile-image",
//         COALESCE(c.fname, d.fname, tr.user_name) as user_name
//       FROM traffic_reports tr
//       LEFT JOIN commuters c ON tr.commuter_id = c.commuter_id
//       LEFT JOIN drivers d ON tr.driver_id = d.driverid
//       ORDER BY tr.created_at DESC
//     `;
    
//     const result = await db.query(sql);
//     console.log('✅ Query successful:', result.rows.length, 'rows found');
    
//     // Format the response
//     const posts = result.rows.map(row => ({
//       traffic_report_id: row.traffic_report_id,
//       report_text: row.report_text,
//       image: row.image,
//       location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
//       created_at: row.created_at,
//       user_name: row.user_name,
//       'profile-image': row['profile-image']
//     }));
    
//     res.json({
//       success: true,
//       posts: posts
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching traffic reports:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// // Create a new traffic report
// exports.createTrafficReport = async (req, res) => {
//   try {
//     console.log('📝 Creating traffic report with file upload...');

//     const { text, location, email, user_name } = req.body;
//     const file = req.file;

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to create a report.' });
//     }

//     // Check if user exists in commuters table
//     const commuterQuery = 'SELECT commuter_id, fname, "profile-image" FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];
//     let profile_image = null;

//     if (commuterResult.rows.length > 0) {
//       // User is a commuter
//       commuter_id = commuterResult.rows[0].commuter_id;
//       user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
//       profile_image = commuterResult.rows[0]['profile-image'];
//     } else {
//       // Check if user is a driver
//       const driverQuery = 'SELECT driverid, fname, imageurl FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         // User is a driver - set driver_id
//         driver_id = driverResult.rows[0].driverid;
//         user_name_to_use = driverResult.rows[0].fname || user_name_to_use;
//         profile_image = driverResult.rows[0].imageurl;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     let imageUrl = null;

//     // Upload image to Cloudinary if file exists
//     if (file) {
//       console.log('🖼️ Image file detected, uploading to Cloudinary...');
//       const result = await uploadToCloudinary(file.buffer);
//       imageUrl = result.secure_url;
//       console.log('✅ Image uploaded successfully:', imageUrl);
//     }

//     const insertSql = `
//       INSERT INTO traffic_reports (commuter_id, driver_id, report_text, image, location, user_name)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `.trim();

//     const insertValues = [
//       commuter_id,  // commuter_id (null for drivers)
//       driver_id,    // driver_id (null for commuters)
//       text || '',
//       imageUrl,
//       location ? JSON.parse(location) : null,
//       user_name_to_use,
//     ];

//     console.log('Inserting values:', insertValues);

//     const insertResult = await db.query(insertSql, insertValues);
//     const newReport = insertResult.rows[0];

//     console.log('✅ New report created in DB:', newReport);

//     res.json({
//       success: true,
//       post: {
//         traffic_report_id: newReport.traffic_report_id,
//         report_text: newReport.report_text,
//         image: newReport.image,
//         location: typeof newReport.location === 'string' ? JSON.parse(newReport.location) : newReport.location,
//         created_at: newReport.created_at,
//         user_name: user_name_to_use,
//         'profile-image': profile_image
//       },
//       message: 'Traffic report created successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error creating traffic report:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// const db = require('../database');
// const cloudinary = require('cloudinary').v2;
// const { Readable } = require('stream');

// cloudinary.config({
//   cloud_name: 'dabx61gn9',
//   api_key: '568778585574721',
//   api_secret: 'ZLWh362xBUdLRHkR_gfQ5RvOD7I',
// });

// const uploadToCloudinary = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: 'TrackSakay/TrafficReports' }, // Using a different folder
//       (error, result) => {
//         if (result) resolve(result);
//         else reject(error);
//       }
//     );

//     const readable = new Readable();
//     readable._read = () => {};
//     readable.push(buffer);
//     readable.push(null);
//     readable.pipe(stream);
//   });
// };

// // Test endpoint to check if API is working
// exports.testEndpoint = async (req, res) => {
//   try {
//     console.log('✅ Traffic reports test endpoint hit');
//     res.json({
//       success: true,
//       message: 'Traffic reports API is working',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Test endpoint error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Test failed',
//       error: error.message
//     });
//   }
// };

// // Create a new traffic report
// exports.createTrafficReport = async (req, res) => {
//   try {
//     console.log('📝 Creating traffic report with file upload...');

//     const { text, location, email, user_name } = req.body;
//     const file = req.file;

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to create a report.' });
//     }

//     // Check if user exists in commuters table
//     const commuterQuery = 'SELECT commuter_id, fname, "profile-image" FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];
//     let profile_image = null;

//     if (commuterResult.rows.length > 0) {
//       // User is a commuter
//       commuter_id = commuterResult.rows[0].commuter_id;
//       user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
//       profile_image = commuterResult.rows[0]['profile-image'];
//     } else {
//       // Check if user is a driver
//       const driverQuery = 'SELECT driverid, fname, imageurl FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         // User is a driver - set driver_id
//         driver_id = driverResult.rows[0].driverid;
//         user_name_to_use = driverResult.rows[0].fname || user_name_to_use;
//         profile_image = driverResult.rows[0].imageurl;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     let imageUrl = null;

//     // Upload image to Cloudinary if file exists
//     if (file) {
//       console.log('🖼️ Image file detected, uploading to Cloudinary...');
//       const result = await uploadToCloudinary(file.buffer);
//       imageUrl = result.secure_url;
//       console.log('✅ Image uploaded successfully:', imageUrl);
//     }

//     const insertSql = `
//       INSERT INTO traffic_reports (commuter_id, driver_id, report_text, image, location, user_name)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `.trim();

//     const insertValues = [
//       commuter_id,  // commuter_id (null for drivers)
//       driver_id,    // driver_id (null for commuters)
//       text || '',
//       imageUrl,
//       location ? JSON.parse(location) : null,
//       user_name_to_use,
//     ];

//     console.log('Inserting values:', insertValues);

//     const insertResult = await db.query(insertSql, insertValues);
//     const newReport = insertResult.rows[0];

//     console.log('✅ New report created in DB:', newReport);

//     res.json({
//       success: true,
//       post: {
//         traffic_report_id: newReport.traffic_report_id,
//         report_text: newReport.report_text,
//         image: newReport.image,
//         location: typeof newReport.location === 'string' ? JSON.parse(newReport.location) : newReport.location,
//         created_at: newReport.created_at,
//         user_name: user_name_to_use,
//         'profile-image': profile_image
//       },
//       message: 'Traffic report created successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error creating traffic report:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// // Get comments for a traffic report
// exports.getComments = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
    
//     console.log('💬 Fetching comments for report:', traffic_report_id);
    
//     const sql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       WHERE c.traffic_report_id = $1
//       ORDER BY c.created_at ASC
//     `;
    
//     const result = await db.query(sql, [traffic_report_id]);
    
//     res.json({
//       success: true,
//       comments: result.rows
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching comments:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch comments',
//       error: error.message
//     });
//   }
// };

// // Add a comment to a traffic report
// exports.addComment = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { comment_text, email, user_name } = req.body;
    
//     console.log('💬 Adding comment to report:', traffic_report_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to add a comment.' });
//     }

//     if (!comment_text || comment_text.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Comment text is required.' });
//     }

//     // Check if user exists in commuters table
//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       // Check if user is a driver
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const insertSql = `
//       INSERT INTO traffic_report_comments (traffic_report_id, commuter_id, driver_id, comment_text, user_name)
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING *
//     `;

//     const insertValues = [
//       traffic_report_id,
//       commuter_id,
//       driver_id,
//       comment_text.trim(),
//       user_name_to_use
//     ];

//     const insertResult = await db.query(insertSql, insertValues);
//     const newComment = insertResult.rows[0];

//     // Get the comment with profile image
//     const commentWithProfileSql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       WHERE c.comment_id = $1
//     `;

//     const commentResult = await db.query(commentWithProfileSql, [newComment.comment_id]);
//     const fullComment = commentResult.rows[0];

//     console.log('✅ Comment added successfully');

//     res.json({
//       success: true,
//       comment: fullComment,
//       message: 'Comment added successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error adding comment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add comment',
//       error: error.message
//     });
//   }
// };

// // Like a traffic report
// exports.likeReport = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email, user_name } = req.body;
    
//     console.log('👍 Liking report:', traffic_report_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to like a report.' });
//     }

//     // Check if user exists in commuters table
//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       // Check if user is a driver
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     // Check if already liked
//     const checkLikeSql = `
//       SELECT like_id FROM traffic_report_likes 
//       WHERE traffic_report_id = $1 
//       AND (commuter_id = $2 OR driver_id = $3)
//     `;

//     const checkResult = await db.query(checkLikeSql, [
//       traffic_report_id,
//       commuter_id,
//       driver_id
//     ]);

//     if (checkResult.rows.length > 0) {
//       // Unlike the report
//       const deleteSql = `
//         DELETE FROM traffic_report_likes 
//         WHERE traffic_report_id = $1 
//         AND (commuter_id = $2 OR driver_id = $3)
//       `;

//       await db.query(deleteSql, [
//         traffic_report_id,
//         commuter_id,
//         driver_id
//       ]);

//       console.log('👎 Like removed');

//       res.json({
//         success: true,
//         liked: false,
//         message: 'Like removed successfully'
//       });
//     } else {
//       // Add like
//       const insertSql = `
//         INSERT INTO traffic_report_likes (traffic_report_id, commuter_id, driver_id, user_name)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *
//       `;

//       await db.query(insertSql, [
//         traffic_report_id,
//         commuter_id,
//         driver_id,
//         user_name_to_use
//       ]);

//       console.log('👍 Like added');

//       res.json({
//         success: true,
//         liked: true,
//         message: 'Report liked successfully'
//       });
//     }

//   } catch (error) {
//     console.error('❌ Error liking report:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to like report',
//       error: error.message
//     });
//   }
// };

// // Get like count and check if user liked a report
// exports.getLikes = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email } = req.query; // Optional: check if specific user liked
    
//     console.log('📊 Getting likes for report:', traffic_report_id);

//     // Get total like count
//     const countSql = `
//       SELECT COUNT(*) as like_count 
//       FROM traffic_report_likes 
//       WHERE traffic_report_id = $1
//     `;

//     const countResult = await db.query(countSql, [traffic_report_id]);
//     const likeCount = parseInt(countResult.rows[0].like_count);

//     let userLiked = false;

//     // Check if specific user liked this report
//     if (email) {
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         const checkLikeSql = `
//           SELECT like_id FROM traffic_report_likes 
//           WHERE traffic_report_id = $1 
//           AND (commuter_id = $2 OR driver_id = $3)
//         `;

//         const checkResult = await db.query(checkLikeSql, [
//           traffic_report_id,
//           commuter_id,
//           driver_id
//         ]);

//         userLiked = checkResult.rows.length > 0;
//       }
//     }

//     res.json({
//       success: true,
//       like_count: likeCount,
//       user_liked: userLiked
//     });

//   } catch (error) {
//     console.error('❌ Error getting likes:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get likes',
//       error: error.message
//     });
//   }
// };

// // Update the getTrafficReports function to include like counts
// exports.getTrafficReports = async (req, res) => {
//   try {
//     console.log('📋 Fetching traffic reports...');
//     const { email } = req.query; // Optional: to check if user liked each post
    
//     const sql = `
//     SELECT 
//       tr.*,
//       COALESCE(c."profile-image", d.imageurl) as "profile-image",
//       -- Properly combine names for display
//       CASE 
//         WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//         WHEN c.commuter_id IS NOT NULL THEN c.fname
//         ELSE tr.user_name
//       END as display_name,
//       -- Keep individual fields for debugging
//       d.fname as driver_fname,
//       d.lastname as driver_lastname,   
//       c.fname as commuter_fname,
//       d.driverid,
//       c.commuter_id,
//       COUNT(l.like_id) as like_count,
//       COUNT(DISTINCT tc.comment_id) as comment_count
//     FROM traffic_reports tr
//     LEFT JOIN commuters c ON tr.commuter_id = c.commuter_id
//     LEFT JOIN drivers d ON tr.driver_id = d.driverid
//     LEFT JOIN traffic_report_likes l ON tr.traffic_report_id = l.traffic_report_id
//     LEFT JOIN traffic_report_comments tc ON tr.traffic_report_id = tc.traffic_report_id
//     GROUP BY tr.traffic_report_id, c."profile-image", d.imageurl, c.fname, d.fname, d.lastname, d.driverid, c.commuter_id
//     ORDER BY tr.created_at DESC
//   `;
    
//     const result = await db.query(sql);
//     console.log('✅ Query successful:', result.rows.length, 'rows found');
//     console.log('🔍 Backend raw data sample:', result.rows[0]);
    
//     // Get user like status for each post if email provided
//     let postsWithLikes = result.rows;
    
//     if (email) {
//       // Get user IDs
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         // Get user's likes for all posts
//         const userLikesSql = `
//           SELECT traffic_report_id 
//           FROM traffic_report_likes 
//           WHERE commuter_id = $1 OR driver_id = $2
//         `;
        
//         const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
//         const userLikedPosts = userLikesResult.rows.map(row => row.traffic_report_id);
        
//         // Add user_liked property to each post
//         postsWithLikes = postsWithLikes.map(post => ({
//           ...post,
//           user_liked: userLikedPosts.includes(post.traffic_report_id)
//         }));
//       }
//     }
    
//     // Format the response
//     const posts = postsWithLikes.map(row => ({
//       traffic_report_id: row.traffic_report_id,
//       report_text: row.report_text,
//       image: row.image,
//       location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
//       created_at: row.created_at,
//       user_name: row.user_name,
//       'profile-image': row['profile-image'],
//       like_count: parseInt(row.like_count) || 0,
//       comment_count: parseInt(row.comment_count) || 0,
//       user_liked: row.user_liked || false,
//       display_name: row.display_name,
//       driver_fname: row.driver_fname,
//       driver_lastname: row.driver_lastname,
//       commuter_fname: row.commuter_fname,
//       driver_id: row.driverid,
//       commuter_id: row.commuter_id,
//       email: row.email // if available
//     }));
    
//     res.json({
//       success: true,
//       posts: posts
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching traffic reports:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// // Like a comment
// exports.likeComment = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { email, user_name } = req.body;
    
//     console.log('👍 Liking comment:', comment_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to like a comment.' });
//     }

//     // Check if user exists
//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     // Check if already liked
//     const checkLikeSql = `
//       SELECT comment_like_id FROM comment_likes 
//       WHERE comment_id = $1 
//       AND (commuter_id = $2 OR driver_id = $3)
//     `;

//     const checkResult = await db.query(checkLikeSql, [
//       comment_id,
//       commuter_id,
//       driver_id
//     ]);

//     if (checkResult.rows.length > 0) {
//       // Unlike the comment
//       const deleteSql = `
//         DELETE FROM comment_likes 
//         WHERE comment_id = $1 
//         AND (commuter_id = $2 OR driver_id = $3)
//       `;

//       await db.query(deleteSql, [
//         comment_id,
//         commuter_id,
//         driver_id
//       ]);

//       console.log('👎 Comment like removed');

//       res.json({
//         success: true,
//         liked: false,
//         message: 'Comment like removed successfully'
//       });
//     } else {
//       // Add like
//       const insertSql = `
//         INSERT INTO comment_likes (comment_id, commuter_id, driver_id, user_name)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *
//       `;

//       await db.query(insertSql, [
//         comment_id,
//         commuter_id,
//         driver_id,
//         user_name_to_use
//       ]);

//       console.log('👍 Comment like added');

//       res.json({
//         success: true,
//         liked: true,
//         message: 'Comment liked successfully'
//       });
//     }

//   } catch (error) {
//     console.error('❌ Error liking comment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to like comment',
//       error: error.message
//     });
//   }
// };

// // Get comment likes
// exports.getCommentLikes = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { email } = req.query;
    
//     console.log('📊 Getting likes for comment:', comment_id);

//     // Get total like count
//     const countSql = `
//       SELECT COUNT(*) as like_count 
//       FROM comment_likes 
//       WHERE comment_id = $1
//     `;

//     const countResult = await db.query(countSql, [comment_id]);
//     const likeCount = parseInt(countResult.rows[0].like_count);

//     let userLiked = false;

//     // Check if specific user liked this comment
//     if (email) {
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         const checkLikeSql = `
//           SELECT comment_like_id FROM comment_likes 
//           WHERE comment_id = $1 
//           AND (commuter_id = $2 OR driver_id = $3)
//         `;

//         const checkResult = await db.query(checkLikeSql, [
//           comment_id,
//           commuter_id,
//           driver_id
//         ]);

//         userLiked = checkResult.rows.length > 0;
//       }
//     }

//     res.json({
//       success: true,
//       like_count: likeCount,
//       user_liked: userLiked
//     });

//   } catch (error) {
//     console.error('❌ Error getting comment likes:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get comment likes',
//       error: error.message
//     });
//   }
// };

// // Add a reply to a comment
// exports.addReply = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { reply_text, email, user_name, parent_reply_id } = req.body;
    
//     console.log('💬 Adding reply to comment:', comment_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to add a reply.' });
//     }

//     if (!reply_text || reply_text.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Reply text is required.' });
//     }

//     // Check if user exists
//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//       user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
//     } else {
//       const driverQuery = 'SELECT driverid, fname, lastname FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//         const firstName = driverResult.rows[0].fname || '';
//         const lastName = driverResult.rows[0].lastname || '';
//         user_name_to_use = `${firstName} ${lastName}`.trim() || user_name_to_use;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const insertSql = `
//       INSERT INTO comment_replies (comment_id, commuter_id, driver_id, reply_text, user_name, parent_reply_id)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `;

//     const insertValues = [
//       comment_id,
//       commuter_id,
//       driver_id,
//       reply_text.trim(),
//       user_name_to_use,
//       parent_reply_id || null
//     ];

//     const insertResult = await db.query(insertSql, insertValues);
//     const newReply = insertResult.rows[0];

//     // Get the reply with profile image
//     const replyWithProfileSql = `
//       SELECT 
//         cr.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM comment_replies cr
//       LEFT JOIN commuters cm ON cr.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON cr.driver_id = d.driverid
//       WHERE cr.reply_id = $1
//     `;

//     const replyResult = await db.query(replyWithProfileSql, [newReply.reply_id]);
//     const fullReply = replyResult.rows[0];

//     console.log('✅ Reply added successfully');

//     res.json({
//       success: true,
//       reply: fullReply,
//       message: 'Reply added successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error adding reply:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add reply',
//       error: error.message
//     });
//   }
// };

// // Get replies for a comment
// // Get replies for a comment - FIXED VERSION
// exports.getReplies = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
    
//     console.log('💬 Fetching ALL replies for comment:', comment_id);
    
//     const sql = `
//       SELECT 
//         cr.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image",
//         -- Add the same name display logic as posts and comments
//         CASE 
//           WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//           WHEN cr.commuter_id IS NOT NULL THEN cm.fname
//           ELSE cr.user_name
//         END as display_name,
//         -- Include individual name fields for frontend processing
//         d.fname as driver_fname,
//         d.lastname as driver_lastname,   
//         cm.fname as commuter_fname,
//         d.driverid,
//         cr.commuter_id,
//         cm.email as commuter_email,
//         d.email as driver_email
//       FROM comment_replies cr
//       LEFT JOIN commuters cm ON cr.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON cr.driver_id = d.driverid
//       WHERE cr.comment_id = $1
//       ORDER BY cr.created_at ASC
//     `;
    
//     const result = await db.query(sql, [comment_id]);
    
//     res.json({
//       success: true,
//       replies: result.rows
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching replies:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch replies',
//       error: error.message
//     });
//   }
// };

// // Update getComments to include like counts
// exports.getComments = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email } = req.query;
    
//     console.log('💬 Fetching comments for report:', traffic_report_id);
    
//     const sql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image",
//         -- Add the same name display logic as posts
//         CASE 
//           WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//           WHEN c.commuter_id IS NOT NULL THEN cm.fname
//           ELSE c.user_name
//         END as display_name,
//         -- Include individual name fields
//         d.fname as driver_fname,
//         d.lastname as driver_lastname,   
//         cm.fname as commuter_fname,
//         d.driverid,
//         c.commuter_id,
//         COUNT(cl.comment_like_id) as like_count,
//         COUNT(cr.reply_id) as reply_count
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       LEFT JOIN comment_likes cl ON c.comment_id = cl.comment_id
//       LEFT JOIN comment_replies cr ON c.comment_id = cr.comment_id
//       WHERE c.traffic_report_id = $1
//       GROUP BY c.comment_id, cm."profile-image", d.imageurl, cm.fname, d.fname, d.lastname, d.driverid, c.commuter_id
//       ORDER BY c.created_at ASC
//     `;
    
//     const result = await db.query(sql, [traffic_report_id]);
    
//     console.log('🔍 Backend comments raw data sample:', result.rows[0]); // Debug
    
//     // Get user like status for each comment if email provided
//     let commentsWithLikes = result.rows;
    
//     if (email) {
//       // Get user IDs
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         // Get user's likes for all comments
//         const userLikesSql = `
//           SELECT comment_id 
//           FROM comment_likes 
//           WHERE commuter_id = $1 OR driver_id = $2
//         `;
        
//         const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
//         const userLikedComments = userLikesResult.rows.map(row => row.comment_id);
        
//         // Add user_liked property to each comment
//         commentsWithLikes = commentsWithLikes.map(comment => ({
//           ...comment,
//           user_liked: userLikedComments.includes(comment.comment_id)
//         }));
//       }
//     }
    
//     // Format the response with all fields
//     const formattedComments = commentsWithLikes.map(comment => ({
//       ...comment,
//       like_count: parseInt(comment.like_count) || 0,
//       reply_count: parseInt(comment.reply_count) || 0,
//       user_liked: comment.user_liked || false
//     }));

//     console.log('✅ Backend formatted comments sample:', formattedComments[0]);
    
//     res.json({
//       success: true,
//       comments: formattedComments
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching comments:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch comments',
//       error: error.message
//     });
//   }
// };


// const db = require('../database');
// const cloudinary = require('cloudinary').v2;
// const { Readable } = require('stream');

// cloudinary.config({
//   cloud_name: 'dabx61gn9',
//   api_key: '568778585574721',
//   api_secret: 'ZLWh362xBUdLRHkR_gfQ5RvOD7I',
// });

// const uploadToCloudinary = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: 'TrackSakay/TrafficReports' }, // Using a different folder
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

// // Test endpoint to check if API is working
// exports.testEndpoint = async (req, res) => {
//   try {
//     console.log('✅ Traffic reports test endpoint hit');
//     res.json({
//       success: true,
//       message: 'Traffic reports API is working',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Test endpoint error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Test failed',
//       error: error.message
//     });
//   }
// };

// // Create a new traffic report
// exports.createTrafficReport = async (req, res) => {
//   try {
//     console.log('📝 Creating traffic report with file upload...');

//     const { text, location, email, user_name } = req.body;
//     const file = req.file;

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to create a report.' });
//     }

//     // Check if user exists in commuters table
//     const commuterQuery = 'SELECT commuter_id, fname, "profile-image" FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];
//     let profile_image = null;

//     if (commuterResult.rows.length > 0) {
//       // User is a commuter
//       commuter_id = commuterResult.rows[0].commuter_id;
//       user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
//       profile_image = commuterResult.rows[0]['profile-image'];
//     } else {
//       // Check if user is a driver
//       const driverQuery = 'SELECT driverid, fname, imageurl FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         // User is a driver - set driver_id
//         driver_id = driverResult.rows[0].driverid;
//         user_name_to_use = driverResult.rows[0].fname || user_name_to_use;
//         profile_image = driverResult.rows[0].imageurl;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     let imageUrl = null;

//     // Upload image to Cloudinary if file exists
//     if (file) {
//       console.log('🖼️ Image file detected, uploading to Cloudinary...');
//       const result = await uploadToCloudinary(file.buffer);
//       imageUrl = result.secure_url;
//       console.log('✅ Image uploaded successfully:', imageUrl);
//     }

//     const insertSql = `
//       INSERT INTO traffic_reports (commuter_id, driver_id, report_text, image, location, user_name)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `.trim();

//     const insertValues = [
//       commuter_id,  // commuter_id (null for drivers)
//       driver_id,    // driver_id (null for commuters)
//       text || '',
//       imageUrl,
//       location ? JSON.parse(location) : null,
//       user_name_to_use,
//     ];

//     console.log('Inserting values:', insertValues);

//     const insertResult = await db.query(insertSql, insertValues);
//     const newReport = insertResult.rows[0];

//     console.log('✅ New report created in DB:', newReport);

//     res.json({
//       success: true,
//       post: {
//         traffic_report_id: newReport.traffic_report_id,
//         report_text: newReport.report_text,
//         image: newReport.image,
//         location: typeof newReport.location === 'string' ? JSON.parse(newReport.location) : newReport.location,
//         created_at: newReport.created_at,
//         user_name: user_name_to_use,
//         'profile-image': profile_image
//       },
//       message: 'Traffic report created successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error creating traffic report:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// // Get comments for a traffic report
// exports.getComments = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
    
//     console.log('💬 Fetching comments for report:', traffic_report_id);
    
//     const sql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       WHERE c.traffic_report_id = $1
//       ORDER BY c.created_at ASC
//     `;
    
//     const result = await db.query(sql, [traffic_report_id]);
    
//     res.json({
//       success: true,
//       comments: result.rows
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching comments:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch comments',
//       error: error.message
//     });
//   }
// };

// // Add a comment to a traffic report
// exports.addComment = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { comment_text, email, user_name } = req.body;
    
//     console.log('💬 Adding comment to report:', traffic_report_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to add a comment.' });
//     }

//     if (!comment_text || comment_text.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Comment text is required.' });
//     }

//     // Check if user exists in commuters table
//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       // Check if user is a driver
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const insertSql = `
//       INSERT INTO traffic_report_comments (traffic_report_id, commuter_id, driver_id, comment_text, user_name)
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING *
//     `;

//     const insertValues = [
//       traffic_report_id,
//       commuter_id,
//       driver_id,
//       comment_text.trim(),
//       user_name_to_use
//     ];

//     const insertResult = await db.query(insertSql, insertValues);
//     const newComment = insertResult.rows[0];

//     // Get the comment with profile image
//     const commentWithProfileSql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       WHERE c.comment_id = $1
//     `;

//     const commentResult = await db.query(commentWithProfileSql, [newComment.comment_id]);
//     const fullComment = commentResult.rows[0];

//     console.log('✅ Comment added successfully');

//     res.json({
//       success: true,
//       comment: fullComment,
//       message: 'Comment added successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error adding comment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add comment',
//       error: error.message
//     });
//   }
// };

// // Like a traffic report
// exports.likeReport = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email, user_name } = req.body;
    
//     console.log('👍 Liking report:', traffic_report_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to like a report.' });
//     }

//     // Check if user exists in commuters table
//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       // Check if user is a driver
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     // Check if already liked
//     const checkLikeSql = `
//       SELECT like_id FROM traffic_report_likes 
//       WHERE traffic_report_id = $1 
//       AND (commuter_id = $2 OR driver_id = $3)
//     `;

//     const checkResult = await db.query(checkLikeSql, [
//       traffic_report_id,
//       commuter_id,
//       driver_id
//     ]);

//     if (checkResult.rows.length > 0) {
//       // Unlike the report
//       const deleteSql = `
//         DELETE FROM traffic_report_likes 
//         WHERE traffic_report_id = $1 
//         AND (commuter_id = $2 OR driver_id = $3)
//       `;

//       await db.query(deleteSql, [
//         traffic_report_id,
//         commuter_id,
//         driver_id
//       ]);

//       console.log('👎 Like removed');

//       res.json({
//         success: true,
//         liked: false,
//         message: 'Like removed successfully'
//       });
//     } else {
//       // Add like
//       const insertSql = `
//         INSERT INTO traffic_report_likes (traffic_report_id, commuter_id, driver_id, user_name)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *
//       `;

//       await db.query(insertSql, [
//         traffic_report_id,
//         commuter_id,
//         driver_id,
//         user_name_to_use
//       ]);

//       console.log('👍 Like added');

//       res.json({
//         success: true,
//         liked: true,
//         message: 'Report liked successfully'
//       });
//     }

//   } catch (error) {
//     console.error('❌ Error liking report:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to like report',
//       error: error.message
//     });
//   }
// };

// // Get like count and check if user liked a report
// exports.getLikes = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email } = req.query; // Optional: check if specific user liked
    
//     console.log('📊 Getting likes for report:', traffic_report_id);

//     // Get total like count
//     const countSql = `
//       SELECT COUNT(*) as like_count 
//       FROM traffic_report_likes 
//       WHERE traffic_report_id = $1
//     `;

//     const countResult = await db.query(countSql, [traffic_report_id]);
//     const likeCount = parseInt(countResult.rows[0].like_count);

//     let userLiked = false;

//     // Check if specific user liked this report
//     if (email) {
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         const checkLikeSql = `
//           SELECT like_id FROM traffic_report_likes 
//           WHERE traffic_report_id = $1 
//           AND (commuter_id = $2 OR driver_id = $3)
//         `;

//         const checkResult = await db.query(checkLikeSql, [
//           traffic_report_id,
//           commuter_id,
//           driver_id
//         ]);

//         userLiked = checkResult.rows.length > 0;
//       }
//     }

//     res.json({
//       success: true,
//       like_count: likeCount,
//       user_liked: userLiked
//     });

//   } catch (error) {
//     console.error('❌ Error getting likes:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get likes',
//       error: error.message
//     });
//   }
// };

// // Update the getTrafficReports function to include like counts - MODIFIED TO SHOW ONLY CURRENT DAY POSTS
// exports.getTrafficReports = async (req, res) => {
//   try {
//     console.log('📋 Fetching traffic reports for current day...');
//     const { email } = req.query; // Optional: to check if user liked each post
    
//     // Get current date in Philippines time (UTC+8)
//     const now = new Date();
//     const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8
//     const currentDate = phTime.toISOString().split('T')[0]; // YYYY-MM-DD
    
//     console.log('📅 Current PH Date:', currentDate);
    
//     const sql = `
//     SELECT 
//       tr.*,
//       COALESCE(c."profile-image", d.imageurl) as "profile-image",
//       -- Properly combine names for display
//       CASE 
//         WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//         WHEN c.commuter_id IS NOT NULL THEN c.fname
//         ELSE tr.user_name
//       END as display_name,
//       -- Keep individual fields for debugging
//       d.fname as driver_fname,
//       d.lastname as driver_lastname,   
//       c.fname as commuter_fname,
//       d.driverid,
//       c.commuter_id,
//       COUNT(l.like_id) as like_count,
//       COUNT(DISTINCT tc.comment_id) as comment_count
//     FROM traffic_reports tr
//     LEFT JOIN commuters c ON tr.commuter_id = c.commuter_id
//     LEFT JOIN drivers d ON tr.driver_id = d.driverid
//     LEFT JOIN traffic_report_likes l ON tr.traffic_report_id = l.traffic_report_id
//     LEFT JOIN traffic_report_comments tc ON tr.traffic_report_id = tc.traffic_report_id
//     WHERE DATE(tr.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila') = $1
//     GROUP BY tr.traffic_report_id, c."profile-image", d.imageurl, c.fname, d.fname, d.lastname, d.driverid, c.commuter_id
//     ORDER BY tr.created_at DESC
//   `;
    
//     const result = await db.query(sql, [currentDate]);
//     console.log('✅ Query successful:', result.rows.length, 'rows found for current date:', currentDate);
//     console.log('🔍 Backend raw data sample:', result.rows[0]);
    
//     // Get user like status for each post if email provided
//     let postsWithLikes = result.rows;
    
//     if (email) {
//       // Get user IDs
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         // Get user's likes for all posts
//         const userLikesSql = `
//           SELECT traffic_report_id 
//           FROM traffic_report_likes 
//           WHERE commuter_id = $1 OR driver_id = $2
//         `;
        
//         const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
//         const userLikedPosts = userLikesResult.rows.map(row => row.traffic_report_id);
        
//         // Add user_liked property to each post
//         postsWithLikes = postsWithLikes.map(post => ({
//           ...post,
//           user_liked: userLikedPosts.includes(post.traffic_report_id)
//         }));
//       }
//     }
    
//     // Format the response
//     const posts = postsWithLikes.map(row => ({
//       traffic_report_id: row.traffic_report_id,
//       report_text: row.report_text,
//       image: row.image,
//       location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
//       created_at: row.created_at,
//       user_name: row.user_name,
//       'profile-image': row['profile-image'],
//       like_count: parseInt(row.like_count) || 0,
//       comment_count: parseInt(row.comment_count) || 0,
//       user_liked: row.user_liked || false,
//       display_name: row.display_name,
//       driver_fname: row.driver_fname,
//       driver_lastname: row.driver_lastname,
//       commuter_fname: row.commuter_fname,
//       driver_id: row.driverid,
//       commuter_id: row.commuter_id,
//       email: row.email // if available
//     }));
    
//     res.json({
//       success: true,
//       posts: posts,
//       current_date: currentDate
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching traffic reports:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// // Like a comment
// exports.likeComment = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { email, user_name } = req.body;
    
//     console.log('👍 Liking comment:', comment_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to like a comment.' });
//     }

//     // Check if user exists
//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     // Check if already liked
//     const checkLikeSql = `
//       SELECT comment_like_id FROM comment_likes 
//       WHERE comment_id = $1 
//       AND (commuter_id = $2 OR driver_id = $3)
//     `;

//     const checkResult = await db.query(checkLikeSql, [
//       comment_id,
//       commuter_id,
//       driver_id
//     ]);

//     if (checkResult.rows.length > 0) {
//       // Unlike the comment
//       const deleteSql = `
//         DELETE FROM comment_likes 
//         WHERE comment_id = $1 
//         AND (commuter_id = $2 OR driver_id = $3)
//       `;

//       await db.query(deleteSql, [
//         comment_id,
//         commuter_id,
//         driver_id
//       ]);

//       console.log('👎 Comment like removed');

//       res.json({
//         success: true,
//         liked: false,
//         message: 'Comment like removed successfully'
//       });
//     } else {
//       // Add like
//       const insertSql = `
//         INSERT INTO comment_likes (comment_id, commuter_id, driver_id, user_name)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *
//       `;

//       await db.query(insertSql, [
//         comment_id,
//         commuter_id,
//         driver_id,
//         user_name_to_use
//       ]);

//       console.log('👍 Comment like added');

//       res.json({
//         success: true,
//         liked: true,
//         message: 'Comment liked successfully'
//       });
//     }

//   } catch (error) {
//     console.error('❌ Error liking comment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to like comment',
//       error: error.message
//     });
//   }
// };

// // Get comment likes
// exports.getCommentLikes = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { email } = req.query;
    
//     console.log('📊 Getting likes for comment:', comment_id);

//     // Get total like count
//     const countSql = `
//       SELECT COUNT(*) as like_count 
//       FROM comment_likes 
//       WHERE comment_id = $1
//     `;

//     const countResult = await db.query(countSql, [comment_id]);
//     const likeCount = parseInt(countResult.rows[0].like_count);

//     let userLiked = false;

//     // Check if specific user liked this comment
//     if (email) {
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         const checkLikeSql = `
//           SELECT comment_like_id FROM comment_likes 
//           WHERE comment_id = $1 
//           AND (commuter_id = $2 OR driver_id = $3)
//         `;

//         const checkResult = await db.query(checkLikeSql, [
//           comment_id,
//           commuter_id,
//           driver_id
//         ]);

//         userLiked = checkResult.rows.length > 0;
//       }
//     }

//     res.json({
//       success: true,
//       like_count: likeCount,
//       user_liked: userLiked
//     });

//   } catch (error) {
//     console.error('❌ Error getting comment likes:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get comment likes',
//       error: error.message
//     });
//   }
// };

// // Add a reply to a comment
// exports.addReply = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { reply_text, email, user_name, parent_reply_id } = req.body;
    
//     console.log('💬 Adding reply to comment:', comment_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to add a reply.' });
//     }

//     if (!reply_text || reply_text.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Reply text is required.' });
//     }

//     // Check if user exists
//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//       user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
//     } else {
//       const driverQuery = 'SELECT driverid, fname, lastname FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//         const firstName = driverResult.rows[0].fname || '';
//         const lastName = driverResult.rows[0].lastname || '';
//         user_name_to_use = `${firstName} ${lastName}`.trim() || user_name_to_use;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const insertSql = `
//       INSERT INTO comment_replies (comment_id, commuter_id, driver_id, reply_text, user_name, parent_reply_id)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `;

//     const insertValues = [
//       comment_id,
//       commuter_id,
//       driver_id,
//       reply_text.trim(),
//       user_name_to_use,
//       parent_reply_id || null
//     ];

//     const insertResult = await db.query(insertSql, insertValues);
//     const newReply = insertResult.rows[0];

//     // Get the reply with profile image
//     const replyWithProfileSql = `
//       SELECT 
//         cr.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM comment_replies cr
//       LEFT JOIN commuters cm ON cr.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON cr.driver_id = d.driverid
//       WHERE cr.reply_id = $1
//     `;

//     const replyResult = await db.query(replyWithProfileSql, [newReply.reply_id]);
//     const fullReply = replyResult.rows[0];

//     console.log('✅ Reply added successfully');

//     res.json({
//       success: true,
//       reply: fullReply,
//       message: 'Reply added successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error adding reply:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add reply',
//       error: error.message
//     });
//   }
// };

// // Get replies for a comment
// // Get replies for a comment - FIXED VERSION
// exports.getReplies = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
    
//     console.log('💬 Fetching ALL replies for comment:', comment_id);
    
//     const sql = `
//       SELECT 
//         cr.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image",
//         -- Add the same name display logic as posts and comments
//         CASE 
//           WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//           WHEN cr.commuter_id IS NOT NULL THEN cm.fname
//           ELSE cr.user_name
//         END as display_name,
//         -- Include individual name fields for frontend processing
//         d.fname as driver_fname,
//         d.lastname as driver_lastname,   
//         cm.fname as commuter_fname,
//         d.driverid,
//         cr.commuter_id,
//         cm.email as commuter_email,
//         d.email as driver_email
//       FROM comment_replies cr
//       LEFT JOIN commuters cm ON cr.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON cr.driver_id = d.driverid
//       WHERE cr.comment_id = $1
//       ORDER BY cr.created_at ASC
//     `;
    
//     const result = await db.query(sql, [comment_id]);
    
//     res.json({
//       success: true,
//       replies: result.rows
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching replies:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch replies',
//       error: error.message
//     });
//   }
// };

// // Update getComments to include like counts
// exports.getComments = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email } = req.query;
    
//     console.log('💬 Fetching comments for report:', traffic_report_id);
    
//     const sql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image",
//         -- Add the same name display logic as posts
//         CASE 
//           WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//           WHEN c.commuter_id IS NOT NULL THEN cm.fname
//           ELSE c.user_name
//         END as display_name,
//         -- Include individual name fields
//         d.fname as driver_fname,
//         d.lastname as driver_lastname,   
//         cm.fname as commuter_fname,
//         d.driverid,
//         c.commuter_id,
//         COUNT(cl.comment_like_id) as like_count,
//         COUNT(cr.reply_id) as reply_count
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       LEFT JOIN comment_likes cl ON c.comment_id = cl.comment_id
//       LEFT JOIN comment_replies cr ON c.comment_id = cr.comment_id
//       WHERE c.traffic_report_id = $1
//       GROUP BY c.comment_id, cm."profile-image", d.imageurl, cm.fname, d.fname, d.lastname, d.driverid, c.commuter_id
//       ORDER BY c.created_at ASC
//     `;
    
//     const result = await db.query(sql, [traffic_report_id]);
    
//     console.log('🔍 Backend comments raw data sample:', result.rows[0]); // Debug
    
//     // Get user like status for each comment if email provided
//     let commentsWithLikes = result.rows;
    
//     if (email) {
//       // Get user IDs
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         // Get user's likes for all comments
//         const userLikesSql = `
//           SELECT comment_id 
//           FROM comment_likes 
//           WHERE commuter_id = $1 OR driver_id = $2
//         `;
        
//         const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
//         const userLikedComments = userLikesResult.rows.map(row => row.comment_id);
        
//         // Add user_liked property to each comment
//         commentsWithLikes = commentsWithLikes.map(comment => ({
//           ...comment,
//           user_liked: userLikedComments.includes(comment.comment_id)
//         }));
//       }
//     }
    
//     // Format the response with all fields
//     const formattedComments = commentsWithLikes.map(comment => ({
//       ...comment,
//       like_count: parseInt(comment.like_count) || 0,
//       reply_count: parseInt(comment.reply_count) || 0,
//       user_liked: comment.user_liked || false
//     }));

//     console.log('✅ Backend formatted comments sample:', formattedComments[0]);
    
//     res.json({
//       success: true,
//       comments: formattedComments
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching comments:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch comments',
//       error: error.message
//     });
//   }
// };


// const db = require('../database');
// const cloudinary = require('cloudinary').v2;
// const { Readable } = require('stream');

// cloudinary.config({
//   cloud_name: 'dabx61gn9',
//   api_key: '568778585574721',
//   api_secret: 'ZLWh362xBUdLRHkR_gfQ5RvOD7I',
// });

// const uploadToCloudinary = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: 'TrackSakay/TrafficReports' },
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

// exports.testEndpoint = async (req, res) => {
//   try {
//     console.log('✅ Traffic reports test endpoint hit');
//     res.json({
//       success: true,
//       message: 'Traffic reports API is working',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Test endpoint error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Test failed',
//       error: error.message
//     });
//   }
// };

// exports.createTrafficReport = async (req, res) => {
//   try {
//     console.log('📝 Creating traffic report with file upload...');

//     const { text, location, email, user_name } = req.body;
//     const file = req.file;

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to create a report.' });
//     }

//     const commuterQuery = 'SELECT commuter_id, fname, "profile-image" FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];
//     let profile_image = null;

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//       user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
//       profile_image = commuterResult.rows[0]['profile-image'];
//     } else {
//       const driverQuery = 'SELECT driverid, fname, imageurl FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//         user_name_to_use = driverResult.rows[0].fname || user_name_to_use;
//         profile_image = driverResult.rows[0].imageurl;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     let imageUrl = null;

//     if (file) {
//       console.log('🖼️ Image file detected, uploading to Cloudinary...');
//       const result = await uploadToCloudinary(file.buffer);
//       imageUrl = result.secure_url;
//       console.log('✅ Image uploaded successfully:', imageUrl);
//     }

//     const insertSql = `
//       INSERT INTO traffic_reports (commuter_id, driver_id, report_text, image, location, user_name)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `.trim();

//     const insertValues = [
//       commuter_id,
//       driver_id,
//       text || '',
//       imageUrl,
//       location ? JSON.parse(location) : null,
//       user_name_to_use,
//     ];

//     console.log('Inserting values:', insertValues);

//     const insertResult = await db.query(insertSql, insertValues);
//     const newReport = insertResult.rows[0];

//     console.log('✅ New report created in DB:', newReport);

//     res.json({
//       success: true,
//       post: {
//         traffic_report_id: newReport.traffic_report_id,
//         report_text: newReport.report_text,
//         image: newReport.image,
//         location: typeof newReport.location === 'string' ? JSON.parse(newReport.location) : newReport.location,
//         created_at: newReport.created_at,
//         user_name: user_name_to_use,
//         'profile-image': profile_image
//       },
//       message: 'Traffic report created successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error creating traffic report:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// exports.getMyPosts = async (req, res) => {
//   try {
//     const { email } = req.params;
    
//     console.log('📋 Fetching user posts for:', email);

//     if (!email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Email is required to fetch user posts.' 
//       });
//     }

//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const sql = `
//       SELECT 
//         tr.*,
//         COALESCE(c."profile-image", d.imageurl) as "profile-image",
//         CASE 
//           WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//           WHEN c.commuter_id IS NOT NULL THEN c.fname
//           ELSE tr.user_name
//         END as display_name,
//         d.fname as driver_fname,
//         d.lastname as driver_lastname,   
//         c.fname as commuter_fname,
//         d.driverid,
//         c.commuter_id,
//         COUNT(l.like_id) as like_count,
//         COUNT(DISTINCT tc.comment_id) as comment_count
//       FROM traffic_reports tr
//       LEFT JOIN commuters c ON tr.commuter_id = c.commuter_id
//       LEFT JOIN drivers d ON tr.driver_id = d.driverid
//       LEFT JOIN traffic_report_likes l ON tr.traffic_report_id = l.traffic_report_id
//       LEFT JOIN traffic_report_comments tc ON tr.traffic_report_id = tc.traffic_report_id
//       WHERE (tr.commuter_id = $1 OR tr.driver_id = $2)
//       GROUP BY tr.traffic_report_id, c."profile-image", d.imageurl, c.fname, d.fname, d.lastname, d.driverid, c.commuter_id
//       ORDER BY tr.created_at DESC
//     `;
    
//     const result = await db.query(sql, [commuter_id, driver_id]);
//     console.log('✅ User posts fetched:', result.rows.length, 'posts found');

//     const posts = result.rows.map(row => ({
//       traffic_report_id: row.traffic_report_id,
//       report_text: row.report_text,
//       image: row.image,
//       location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
//       created_at: row.created_at,
//       user_name: row.user_name,
//       'profile-image': row['profile-image'],
//       like_count: parseInt(row.like_count) || 0,
//       comment_count: parseInt(row.comment_count) || 0,
//       display_name: row.display_name,
//       driver_fname: row.driver_fname,
//       driver_lastname: row.driver_lastname,
//       commuter_fname: row.commuter_fname,
//       driver_id: row.driverid,
//       commuter_id: row.commuter_id
//     }));

//     res.json({
//       success: true,
//       posts: posts,
//       total_count: posts.length
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching user posts:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch user posts',
//       error: error.message
//     });
//   }
// };

// exports.deleteMyPost = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email } = req.body;

//     console.log('🗑️ Deleting post:', traffic_report_id, 'for user:', email);

//     if (!email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Email is required to delete a post.' 
//       });
//     }

//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const checkOwnershipSql = `
//       SELECT traffic_report_id FROM traffic_reports 
//       WHERE traffic_report_id = $1 AND (commuter_id = $2 OR driver_id = $3)
//     `;

//     const ownershipResult = await db.query(checkOwnershipSql, [
//       traffic_report_id,
//       commuter_id,
//       driver_id
//     ]);

//     if (ownershipResult.rows.length === 0) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'You can only delete your own posts.' 
//       });
//     }

//     const deleteLikesSql = 'DELETE FROM traffic_report_likes WHERE traffic_report_id = $1';
//     await db.query(deleteLikesSql, [traffic_report_id]);

//     const deleteCommentsSql = 'DELETE FROM traffic_report_comments WHERE traffic_report_id = $1';
//     await db.query(deleteCommentsSql, [traffic_report_id]);

//     const deletePostSql = 'DELETE FROM traffic_reports WHERE traffic_report_id = $1';
//     await db.query(deletePostSql, [traffic_report_id]);

//     console.log('✅ Post deleted successfully');

//     res.json({
//       success: true,
//       message: 'Post deleted successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error deleting post:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete post',
//       error: error.message
//     });
//   }
// };

// exports.getComments = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
    
//     console.log('💬 Fetching comments for report:', traffic_report_id);
    
//     const sql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       WHERE c.traffic_report_id = $1
//       ORDER BY c.created_at ASC
//     `;
    
//     const result = await db.query(sql, [traffic_report_id]);
    
//     res.json({
//       success: true,
//       comments: result.rows
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching comments:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch comments',
//       error: error.message
//     });
//   }
// };

// exports.addComment = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { comment_text, email, user_name } = req.body;
    
//     console.log('💬 Adding comment to report:', traffic_report_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to add a comment.' });
//     }

//     if (!comment_text || comment_text.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Comment text is required.' });
//     }

//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const insertSql = `
//       INSERT INTO traffic_report_comments (traffic_report_id, commuter_id, driver_id, comment_text, user_name)
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING *
//     `;

//     const insertValues = [
//       traffic_report_id,
//       commuter_id,
//       driver_id,
//       comment_text.trim(),
//       user_name_to_use
//     ];

//     const insertResult = await db.query(insertSql, insertValues);
//     const newComment = insertResult.rows[0];

//     const commentWithProfileSql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       WHERE c.comment_id = $1
//     `;

//     const commentResult = await db.query(commentWithProfileSql, [newComment.comment_id]);
//     const fullComment = commentResult.rows[0];

//     console.log('✅ Comment added successfully');

//     res.json({
//       success: true,
//       comment: fullComment,
//       message: 'Comment added successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error adding comment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add comment',
//       error: error.message
//     });
//   }
// };

// exports.likeReport = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email, user_name } = req.body;
    
//     console.log('👍 Liking report:', traffic_report_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to like a report.' });
//     }

//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const checkLikeSql = `
//       SELECT like_id FROM traffic_report_likes 
//       WHERE traffic_report_id = $1 
//       AND (commuter_id = $2 OR driver_id = $3)
//     `;

//     const checkResult = await db.query(checkLikeSql, [
//       traffic_report_id,
//       commuter_id,
//       driver_id
//     ]);

//     if (checkResult.rows.length > 0) {
//       const deleteSql = `
//         DELETE FROM traffic_report_likes 
//         WHERE traffic_report_id = $1 
//         AND (commuter_id = $2 OR driver_id = $3)
//       `;

//       await db.query(deleteSql, [
//         traffic_report_id,
//         commuter_id,
//         driver_id
//       ]);

//       console.log('👎 Like removed');

//       res.json({
//         success: true,
//         liked: false,
//         message: 'Like removed successfully'
//       });
//     } else {
//       const insertSql = `
//         INSERT INTO traffic_report_likes (traffic_report_id, commuter_id, driver_id, user_name)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *
//       `;

//       await db.query(insertSql, [
//         traffic_report_id,
//         commuter_id,
//         driver_id,
//         user_name_to_use
//       ]);

//       console.log('👍 Like added');

//       res.json({
//         success: true,
//         liked: true,
//         message: 'Report liked successfully'
//       });
//     }

//   } catch (error) {
//     console.error('❌ Error liking report:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to like report',
//       error: error.message
//     });
//   }
// };

// exports.getLikes = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email } = req.query;
    
//     console.log('📊 Getting likes for report:', traffic_report_id);

//     const countSql = `
//       SELECT COUNT(*) as like_count 
//       FROM traffic_report_likes 
//       WHERE traffic_report_id = $1
//     `;

//     const countResult = await db.query(countSql, [traffic_report_id]);
//     const likeCount = parseInt(countResult.rows[0].like_count);

//     let userLiked = false;

//     if (email) {
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         const checkLikeSql = `
//           SELECT like_id FROM traffic_report_likes 
//           WHERE traffic_report_id = $1 
//           AND (commuter_id = $2 OR driver_id = $3)
//         `;

//         const checkResult = await db.query(checkLikeSql, [
//           traffic_report_id,
//           commuter_id,
//           driver_id
//         ]);

//         userLiked = checkResult.rows.length > 0;
//       }
//     }

//     res.json({
//       success: true,
//       like_count: likeCount,
//       user_liked: userLiked
//     });

//   } catch (error) {
//     console.error('❌ Error getting likes:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get likes',
//       error: error.message
//     });
//   }
// };

// exports.getTrafficReports = async (req, res) => {
//   try {
//     console.log('📋 Fetching traffic reports for current day...');
//     const { email } = req.query;
    
//     const now = new Date();
//     const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
//     const currentDate = phTime.toISOString().split('T')[0];
    
//     console.log('📅 Current PH Date:', currentDate);
    
//     const sql = `
//     SELECT 
//       tr.*,
//       COALESCE(c."profile-image", d.imageurl) as "profile-image",
//       CASE 
//         WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//         WHEN c.commuter_id IS NOT NULL THEN c.fname
//         ELSE tr.user_name
//       END as display_name,
//       d.fname as driver_fname,
//       d.lastname as driver_lastname,   
//       c.fname as commuter_fname,
//       d.driverid,
//       c.commuter_id,
//       COUNT(l.like_id) as like_count,
//       COUNT(DISTINCT tc.comment_id) as comment_count
//     FROM traffic_reports tr
//     LEFT JOIN commuters c ON tr.commuter_id = c.commuter_id
//     LEFT JOIN drivers d ON tr.driver_id = d.driverid
//     LEFT JOIN traffic_report_likes l ON tr.traffic_report_id = l.traffic_report_id
//     LEFT JOIN traffic_report_comments tc ON tr.traffic_report_id = tc.traffic_report_id
//     WHERE DATE(tr.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila') = $1
//     GROUP BY tr.traffic_report_id, c."profile-image", d.imageurl, c.fname, d.fname, d.lastname, d.driverid, c.commuter_id
//     ORDER BY tr.created_at DESC
//   `;
    
//     const result = await db.query(sql, [currentDate]);
//     console.log('✅ Query successful:', result.rows.length, 'rows found for current date:', currentDate);
//     console.log('🔍 Backend raw data sample:', result.rows[0]);
    
//     let postsWithLikes = result.rows;
    
//     if (email) {
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         const userLikesSql = `
//           SELECT traffic_report_id 
//           FROM traffic_report_likes 
//           WHERE commuter_id = $1 OR driver_id = $2
//         `;
        
//         const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
//         const userLikedPosts = userLikesResult.rows.map(row => row.traffic_report_id);
        
//         postsWithLikes = postsWithLikes.map(post => ({
//           ...post,
//           user_liked: userLikedPosts.includes(post.traffic_report_id)
//         }));
//       }
//     }
    
//     const posts = postsWithLikes.map(row => ({
//       traffic_report_id: row.traffic_report_id,
//       report_text: row.report_text,
//       image: row.image,
//       location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
//       created_at: row.created_at,
//       user_name: row.user_name,
//       'profile-image': row['profile-image'],
//       like_count: parseInt(row.like_count) || 0,
//       comment_count: parseInt(row.comment_count) || 0,
//       user_liked: row.user_liked || false,
//       display_name: row.display_name,
//       driver_fname: row.driver_fname,
//       driver_lastname: row.driver_lastname,
//       commuter_fname: row.commuter_fname,
//       driver_id: row.driverid,
//       commuter_id: row.commuter_id,
//       email: row.email
//     }));
    
//     res.json({
//       success: true,
//       posts: posts,
//       current_date: currentDate
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching traffic reports:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// exports.likeComment = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { email, user_name } = req.body;
    
//     console.log('👍 Liking comment:', comment_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to like a comment.' });
//     }

//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//     } else {
//       const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const checkLikeSql = `
//       SELECT comment_like_id FROM comment_likes 
//       WHERE comment_id = $1 
//       AND (commuter_id = $2 OR driver_id = $3)
//     `;

//     const checkResult = await db.query(checkLikeSql, [
//       comment_id,
//       commuter_id,
//       driver_id
//     ]);

//     if (checkResult.rows.length > 0) {
//       const deleteSql = `
//         DELETE FROM comment_likes 
//         WHERE comment_id = $1 
//         AND (commuter_id = $2 OR driver_id = $3)
//       `;

//       await db.query(deleteSql, [
//         comment_id,
//         commuter_id,
//         driver_id
//       ]);

//       console.log('👎 Comment like removed');

//       res.json({
//         success: true,
//         liked: false,
//         message: 'Comment like removed successfully'
//       });
//     } else {
//       const insertSql = `
//         INSERT INTO comment_likes (comment_id, commuter_id, driver_id, user_name)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *
//       `;

//       await db.query(insertSql, [
//         comment_id,
//         commuter_id,
//         driver_id,
//         user_name_to_use
//       ]);

//       console.log('👍 Comment like added');

//       res.json({
//         success: true,
//         liked: true,
//         message: 'Comment liked successfully'
//       });
//     }

//   } catch (error) {
//     console.error('❌ Error liking comment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to like comment',
//       error: error.message
//     });
//   }
// };

// exports.getCommentLikes = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { email } = req.query;
    
//     console.log('📊 Getting likes for comment:', comment_id);

//     const countSql = `
//       SELECT COUNT(*) as like_count 
//       FROM comment_likes 
//       WHERE comment_id = $1
//     `;

//     const countResult = await db.query(countSql, [comment_id]);
//     const likeCount = parseInt(countResult.rows[0].like_count);

//     let userLiked = false;

//     if (email) {
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         const checkLikeSql = `
//           SELECT comment_like_id FROM comment_likes 
//           WHERE comment_id = $1 
//           AND (commuter_id = $2 OR driver_id = $3)
//         `;

//         const checkResult = await db.query(checkLikeSql, [
//           comment_id,
//           commuter_id,
//           driver_id
//         ]);

//         userLiked = checkResult.rows.length > 0;
//       }
//     }

//     res.json({
//       success: true,
//       like_count: likeCount,
//       user_liked: userLiked
//     });

//   } catch (error) {
//     console.error('❌ Error getting comment likes:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get comment likes',
//       error: error.message
//     });
//   }
// };

// exports.addReply = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
//     const { reply_text, email, user_name, parent_reply_id } = req.body;
    
//     console.log('💬 Adding reply to comment:', comment_id);

//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required to add a reply.' });
//     }

//     if (!reply_text || reply_text.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Reply text is required.' });
//     }

//     const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//     const commuterResult = await db.query(commuterQuery, [email]);

//     let commuter_id = null; 
//     let driver_id = null;
//     let user_name_to_use = user_name || email.split('@')[0];

//     if (commuterResult.rows.length > 0) {
//       commuter_id = commuterResult.rows[0].commuter_id;
//       user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
//     } else {
//       const driverQuery = 'SELECT driverid, fname, lastname FROM drivers WHERE email = $1';
//       const driverResult = await db.query(driverQuery, [email]);
      
//       if (driverResult.rows.length > 0) {
//         driver_id = driverResult.rows[0].driverid;
//         const firstName = driverResult.rows[0].fname || '';
//         const lastName = driverResult.rows[0].lastname || '';
//         user_name_to_use = `${firstName} ${lastName}`.trim() || user_name_to_use;
//       } else {
//         return res.status(404).json({ success: false, message: 'User not found.' });
//       }
//     }

//     const insertSql = `
//       INSERT INTO comment_replies (comment_id, commuter_id, driver_id, reply_text, user_name, parent_reply_id)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//     `;

//     const insertValues = [
//       comment_id,
//       commuter_id,
//       driver_id,
//       reply_text.trim(),
//       user_name_to_use,
//       parent_reply_id || null
//     ];

//     const insertResult = await db.query(insertSql, insertValues);
//     const newReply = insertResult.rows[0];

//     const replyWithProfileSql = `
//       SELECT 
//         cr.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image"
//       FROM comment_replies cr
//       LEFT JOIN commuters cm ON cr.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON cr.driver_id = d.driverid
//       WHERE cr.reply_id = $1
//     `;

//     const replyResult = await db.query(replyWithProfileSql, [newReply.reply_id]);
//     const fullReply = replyResult.rows[0];

//     console.log('✅ Reply added successfully');

//     res.json({
//       success: true,
//       reply: fullReply,
//       message: 'Reply added successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error adding reply:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add reply',
//       error: error.message
//     });
//   }
// };

// exports.getReplies = async (req, res) => {
//   try {
//     const { comment_id } = req.params;
    
//     console.log('💬 Fetching ALL replies for comment:', comment_id);
    
//     const sql = `
//       SELECT 
//         cr.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image",
//         CASE 
//           WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//           WHEN cr.commuter_id IS NOT NULL THEN cm.fname
//           ELSE cr.user_name
//         END as display_name,
//         d.fname as driver_fname,
//         d.lastname as driver_lastname,   
//         cm.fname as commuter_fname,
//         d.driverid,
//         cr.commuter_id,
//         cm.email as commuter_email,
//         d.email as driver_email
//       FROM comment_replies cr
//       LEFT JOIN commuters cm ON cr.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON cr.driver_id = d.driverid
//       WHERE cr.comment_id = $1
//       ORDER BY cr.created_at ASC
//     `;
    
//     const result = await db.query(sql, [comment_id]);
    
//     res.json({
//       success: true,
//       replies: result.rows
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching replies:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch replies',
//       error: error.message
//     });
//   }
// };

// exports.getComments = async (req, res) => {
//   try {
//     const { traffic_report_id } = req.params;
//     const { email } = req.query;
    
//     console.log('💬 Fetching comments for report:', traffic_report_id);
    
//     const sql = `
//       SELECT 
//         c.*,
//         COALESCE(cm."profile-image", d.imageurl) as "profile-image",
//         CASE 
//           WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
//           WHEN c.commuter_id IS NOT NULL THEN cm.fname
//           ELSE c.user_name
//         END as display_name,
//         d.fname as driver_fname,
//         d.lastname as driver_lastname,   
//         cm.fname as commuter_fname,
//         d.driverid,
//         c.commuter_id,
//         COUNT(cl.comment_like_id) as like_count,
//         COUNT(cr.reply_id) as reply_count
//       FROM traffic_report_comments c
//       LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
//       LEFT JOIN drivers d ON c.driver_id = d.driverid
//       LEFT JOIN comment_likes cl ON c.comment_id = cl.comment_id
//       LEFT JOIN comment_replies cr ON c.comment_id = cr.comment_id
//       WHERE c.traffic_report_id = $1
//       GROUP BY c.comment_id, cm."profile-image", d.imageurl, cm.fname, d.fname, d.lastname, d.driverid, c.commuter_id
//       ORDER BY c.created_at ASC
//     `;
    
//     const result = await db.query(sql, [traffic_report_id]);
    
//     console.log('🔍 Backend comments raw data sample:', result.rows[0]);
    
//     let commentsWithLikes = result.rows;
    
//     if (email) {
//       const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
//       const commuterResult = await db.query(commuterQuery, [email]);

//       let commuter_id = null; 
//       let driver_id = null;

//       if (commuterResult.rows.length > 0) {
//         commuter_id = commuterResult.rows[0].commuter_id;
//       } else {
//         const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
//         const driverResult = await db.query(driverQuery, [email]);
        
//         if (driverResult.rows.length > 0) {
//           driver_id = driverResult.rows[0].driverid;
//         }
//       }

//       if (commuter_id || driver_id) {
//         const userLikesSql = `
//           SELECT comment_id 
//           FROM comment_likes 
//           WHERE commuter_id = $1 OR driver_id = $2
//         `;
        
//         const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
//         const userLikedComments = userLikesResult.rows.map(row => row.comment_id);
        
//         commentsWithLikes = commentsWithLikes.map(comment => ({
//           ...comment,
//           user_liked: userLikedComments.includes(comment.comment_id)
//         }));
//       }
//     }
    
//     const formattedComments = commentsWithLikes.map(comment => ({
//       ...comment,
//       like_count: parseInt(comment.like_count) || 0,
//       reply_count: parseInt(comment.reply_count) || 0,
//       user_liked: comment.user_liked || false
//     }));

//     console.log('✅ Backend formatted comments sample:', formattedComments[0]);
    
//     res.json({
//       success: true,
//       comments: formattedComments
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching comments:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch comments',
//       error: error.message
//     });
//   }
// };


// trafficReportsController.js
const db = require('../database');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: 'dabx61gn9',
  api_key: '568778585574721',
  api_secret: 'ZLWh362xBUdLRHkR_gfQ5RvOD7I',
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'TrackSakay/TrafficReports' },
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

// Accident-related keywords for detection
const ACCIDENT_KEYWORDS = [
  'accident', 'collision', 'crash', 'wreck', 'smash', 'bump', 
  'hit', 'dead', 'death', 'fatal', 'injury', 'injured', 'blood',
  'emergency', 'ambulance', 'police', 'trapped', 'serious', 'critical',
  'casualty', 'victim', 'fatality', 'bangga', 'patay', 'nasagasaan',
  'disgrasya', 'aksidente', 'nabundol', 'nadisgrasya', 'nasaktan',
  'sugatan', 'namatay', 'dugo', 'pulis', 'ambulansya', 'nadaganan',
  'nasalpok', 'nasagi', 'nasagasaan', 'nabangga', 'nakabangga', 'nakasagasa'
];

// Helper function to detect accident reports
const containsAccidentKeywords = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return ACCIDENT_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

exports.testEndpoint = async (req, res) => {
  try {
    console.log('✅ Traffic reports test endpoint hit');
    res.json({
      success: true,
      message: 'Traffic reports API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
};

exports.createTrafficReport = async (req, res) => {
  try {
    console.log('📝 Creating traffic report with file upload...');

    const { text, location, email, user_name } = req.body;
    const file = req.file;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to create a report.' });
    }

    const commuterQuery = 'SELECT commuter_id, fname, "profile-image" FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;
    let user_name_to_use = user_name || email.split('@')[0];
    let profile_image = null;

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
      user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
      profile_image = commuterResult.rows[0]['profile-image'];
    } else {
      const driverQuery = 'SELECT driverid, fname, imageurl FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        driver_id = driverResult.rows[0].driverid;
        user_name_to_use = driverResult.rows[0].fname || user_name_to_use;
        profile_image = driverResult.rows[0].imageurl;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    let imageUrl = null;

    if (file) {
      console.log('🖼️ Image file detected, uploading to Cloudinary...');
      const result = await uploadToCloudinary(file.buffer);
      imageUrl = result.secure_url;
      console.log('✅ Image uploaded successfully:', imageUrl);
    }

    // Detect if this is an accident report
    const isAccidentReport = containsAccidentKeywords(text);
    
    // Start with 0% credibility for accident reports
    let credibilityScore = 0;
    
    // Check for similar posts from OTHER users on current date
    if (isAccidentReport && location) {
      try {
        const now = new Date();
        const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const currentDate = phTime.toISOString().split('T')[0];
        
        const locationObj = typeof location === 'string' ? JSON.parse(location) : location;
        
        if (locationObj && locationObj.latitude && locationObj.longitude) {
          // Check for similar accident reports from OTHER users on current date
          const similarSql = `
            SELECT COUNT(*) as similar_count
            FROM traffic_reports 
            WHERE is_accident_report = true
            AND location IS NOT NULL
            AND (commuter_id != $1 OR driver_id != $2)
            AND (commuter_id IS NOT NULL OR driver_id IS NOT NULL)
            AND DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila') = $3
            AND (
              ABS((location->>'latitude')::FLOAT - $4::FLOAT) < 0.009
              AND ABS((location->>'longitude')::FLOAT - $5::FLOAT) < 0.009
            )
          `;
          
          const similarResult = await db.query(similarSql, [
            commuter_id,
            driver_id,
            currentDate,
            locationObj.latitude,
            locationObj.longitude
          ]);
          
          const similarCount = parseInt(similarResult.rows[0].similar_count) || 0;
          
          if (similarCount > 0) {
            // Add credibility for having similar reports from other users
            credibilityScore += Math.min(similarCount * 15, 30); // Max 30% for similar reports
          }
        }
      } catch (error) {
        console.error('Error checking similar reports:', error);
      }
    }

    const insertSql = `
      INSERT INTO traffic_reports (commuter_id, driver_id, report_text, image, location, user_name, is_accident_report, credibility_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `.trim();

    const insertValues = [
      commuter_id,
      driver_id,
      text || '',
      imageUrl,
      location ? JSON.parse(location) : null,
      user_name_to_use,
      isAccidentReport,
      credibilityScore
    ];

    console.log('Inserting values:', insertValues);

    const insertResult = await db.query(insertSql, insertValues);
    const newReport = insertResult.rows[0];

    console.log('✅ New report created in DB:', newReport);

    res.json({
      success: true,
      post: {
        traffic_report_id: newReport.traffic_report_id,
        report_text: newReport.report_text,
        image: newReport.image,
        location: typeof newReport.location === 'string' ? JSON.parse(newReport.location) : newReport.location,
        created_at: newReport.created_at,
        user_name: user_name_to_use,
        'profile-image': profile_image,
        is_accident_report: isAccidentReport,
        credibility_score: credibilityScore
      },
      message: 'Traffic report created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating traffic report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log('📋 Fetching user posts for:', email);

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required to fetch user posts.' 
      });
    }

    const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
    } else {
      const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        driver_id = driverResult.rows[0].driverid;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    const sql = `
      SELECT 
        tr.*,
        COALESCE(c."profile-image", d.imageurl) as "profile-image",
        CASE 
          WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
          WHEN c.commuter_id IS NOT NULL THEN c.fname
          ELSE tr.user_name
        END as display_name,
        d.fname as driver_fname,
        d.lastname as driver_lastname,   
        c.fname as commuter_fname,
        d.driverid,
        c.commuter_id,
        COUNT(l.like_id) as like_count,
        COUNT(DISTINCT tc.comment_id) as comment_count
      FROM traffic_reports tr
      LEFT JOIN commuters c ON tr.commuter_id = c.commuter_id
      LEFT JOIN drivers d ON tr.driver_id = d.driverid
      LEFT JOIN traffic_report_likes l ON tr.traffic_report_id = l.traffic_report_id
      LEFT JOIN traffic_report_comments tc ON tr.traffic_report_id = tc.traffic_report_id
      WHERE (tr.commuter_id = $1 OR tr.driver_id = $2)
      GROUP BY tr.traffic_report_id, c."profile-image", d.imageurl, c.fname, d.fname, d.lastname, d.driverid, c.commuter_id
      ORDER BY tr.created_at DESC
    `;
    
    const result = await db.query(sql, [commuter_id, driver_id]);
    console.log('✅ User posts fetched:', result.rows.length, 'posts found');

    const posts = result.rows.map(row => ({
      traffic_report_id: row.traffic_report_id,
      report_text: row.report_text,
      image: row.image,
      location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
      created_at: row.created_at,
      user_name: row.user_name,
      'profile-image': row['profile-image'],
      like_count: parseInt(row.like_count) || 0,
      comment_count: parseInt(row.comment_count) || 0,
      display_name: row.display_name,
      driver_fname: row.driver_fname,
      driver_lastname: row.driver_lastname,
      commuter_fname: row.commuter_fname,
      driver_id: row.driverid,
      commuter_id: row.commuter_id,
      is_accident_report: row.is_accident_report || false,
      credibility_score: row.credibility_score || 0
    }));

    res.json({
      success: true,
      posts: posts,
      total_count: posts.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts',
      error: error.message
    });
  }
};

exports.deleteMyPost = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    const { email } = req.body;

    console.log('🗑️ Deleting post:', traffic_report_id, 'for user:', email);

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required to delete a post.' 
      });
    }

    const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
    } else {
      const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        driver_id = driverResult.rows[0].driverid;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    const checkOwnershipSql = `
      SELECT traffic_report_id FROM traffic_reports 
      WHERE traffic_report_id = $1 AND (commuter_id = $2 OR driver_id = $3)
    `;

    const ownershipResult = await db.query(checkOwnershipSql, [
      traffic_report_id,
      commuter_id,
      driver_id
    ]);

    if (ownershipResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own posts.' 
      });
    }

    // Delete verifications first
    const deleteVerificationsSql = 'DELETE FROM traffic_report_verifications WHERE traffic_report_id = $1';
    await db.query(deleteVerificationsSql, [traffic_report_id]);

    const deleteLikesSql = 'DELETE FROM traffic_report_likes WHERE traffic_report_id = $1';
    await db.query(deleteLikesSql, [traffic_report_id]);

    const deleteCommentsSql = 'DELETE FROM traffic_report_comments WHERE traffic_report_id = $1';
    await db.query(deleteCommentsSql, [traffic_report_id]);

    const deletePostSql = 'DELETE FROM traffic_reports WHERE traffic_report_id = $1';
    await db.query(deletePostSql, [traffic_report_id]);

    console.log('✅ Post deleted successfully');

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    
    console.log('💬 Fetching comments for report:', traffic_report_id);
    
    const sql = `
      SELECT 
        c.*,
        COALESCE(cm."profile-image", d.imageurl) as "profile-image"
      FROM traffic_report_comments c
      LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
      LEFT JOIN drivers d ON c.driver_id = d.driverid
      WHERE c.traffic_report_id = $1
      ORDER BY c.created_at ASC
    `;
    
    const result = await db.query(sql, [traffic_report_id]);
    
    res.json({
      success: true,
      comments: result.rows
    });
    
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    const { comment_text, email, user_name } = req.body;
    
    console.log('💬 Adding comment to report:', traffic_report_id);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to add a comment.' });
    }

    if (!comment_text || comment_text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;
    let user_name_to_use = user_name || email.split('@')[0];

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
    } else {
      const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        driver_id = driverResult.rows[0].driverid;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    const insertSql = `
      INSERT INTO traffic_report_comments (traffic_report_id, commuter_id, driver_id, comment_text, user_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const insertValues = [
      traffic_report_id,
      commuter_id,
      driver_id,
      comment_text.trim(),
      user_name_to_use
    ];

    const insertResult = await db.query(insertSql, insertValues);
    const newComment = insertResult.rows[0];

    const commentWithProfileSql = `
      SELECT 
        c.*,
        COALESCE(cm."profile-image", d.imageurl) as "profile-image"
      FROM traffic_report_comments c
      LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
      LEFT JOIN drivers d ON c.driver_id = d.driverid
      WHERE c.comment_id = $1
    `;

    const commentResult = await db.query(commentWithProfileSql, [newComment.comment_id]);
    const fullComment = commentResult.rows[0];

    console.log('✅ Comment added successfully');

    res.json({
      success: true,
      comment: fullComment,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

exports.likeReport = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    const { email, user_name } = req.body;
    
    console.log('👍 Liking report:', traffic_report_id);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to like a report.' });
    }

    const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;
    let user_name_to_use = user_name || email.split('@')[0];

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
    } else {
      const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        driver_id = driverResult.rows[0].driverid;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    const checkLikeSql = `
      SELECT like_id FROM traffic_report_likes 
      WHERE traffic_report_id = $1 
      AND (commuter_id = $2 OR driver_id = $3)
    `;

    const checkResult = await db.query(checkLikeSql, [
      traffic_report_id,
      commuter_id,
      driver_id
    ]);

    if (checkResult.rows.length > 0) {
      const deleteSql = `
        DELETE FROM traffic_report_likes 
        WHERE traffic_report_id = $1 
        AND (commuter_id = $2 OR driver_id = $3)
      `;

      await db.query(deleteSql, [
        traffic_report_id,
        commuter_id,
        driver_id
      ]);

      console.log('👎 Like removed');

      res.json({
        success: true,
        liked: false,
        message: 'Like removed successfully'
      });
    } else {
      const insertSql = `
        INSERT INTO traffic_report_likes (traffic_report_id, commuter_id, driver_id, user_name)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      await db.query(insertSql, [
        traffic_report_id,
        commuter_id,
        driver_id,
        user_name_to_use
      ]);

      console.log('👍 Like added');

      res.json({
        success: true,
        liked: true,
        message: 'Report liked successfully'
      });
    }

  } catch (error) {
    console.error('❌ Error liking report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like report',
      error: error.message
    });
  }
};

exports.getLikes = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    const { email } = req.query;
    
    console.log('📊 Getting likes for report:', traffic_report_id);

    const countSql = `
      SELECT COUNT(*) as like_count 
      FROM traffic_report_likes 
      WHERE traffic_report_id = $1
    `;

    const countResult = await db.query(countSql, [traffic_report_id]);
    const likeCount = parseInt(countResult.rows[0].like_count);

    let userLiked = false;

    if (email) {
      const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
      const commuterResult = await db.query(commuterQuery, [email]);

      let commuter_id = null; 
      let driver_id = null;

      if (commuterResult.rows.length > 0) {
        commuter_id = commuterResult.rows[0].commuter_id;
      } else {
        const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
        const driverResult = await db.query(driverQuery, [email]);
        
        if (driverResult.rows.length > 0) {
          driver_id = driverResult.rows[0].driverid;
        }
      }

      if (commuter_id || driver_id) {
        const checkLikeSql = `
          SELECT like_id FROM traffic_report_likes 
          WHERE traffic_report_id = $1 
          AND (commuter_id = $2 OR driver_id = $3)
        `;

        const checkResult = await db.query(checkLikeSql, [
          traffic_report_id,
          commuter_id,
          driver_id
        ]);

        userLiked = checkResult.rows.length > 0;
      }
    }

    res.json({
      success: true,
      like_count: likeCount,
      user_liked: userLiked
    });

  } catch (error) {
    console.error('❌ Error getting likes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get likes',
      error: error.message
    });
  }
};

exports.getTrafficReports = async (req, res) => {
  try {
    console.log('📋 Fetching traffic reports for current day...');
    const { email } = req.query;
    
    const now = new Date();
    const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const currentDate = phTime.toISOString().split('T')[0];
    
    console.log('📅 Current PH Date:', currentDate);
    
    const sql = `
    SELECT 
      tr.*,
      COALESCE(c."profile-image", d.imageurl) as "profile-image",
      CASE 
        WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
        WHEN c.commuter_id IS NOT NULL THEN c.fname
        ELSE tr.user_name
      END as display_name,
      d.fname as driver_fname,
      d.lastname as driver_lastname,   
      c.fname as commuter_fname,
      d.driverid,
      c.commuter_id,
      COUNT(l.like_id) as like_count,
      COUNT(DISTINCT tc.comment_id) as comment_count,
      COALESCE((
        SELECT COUNT(*) 
        FROM traffic_report_verifications v 
        WHERE v.traffic_report_id = tr.traffic_report_id 
        AND v.verification_type = 'legit'
      ), 0) as legit_verifications,
      COALESCE((
        SELECT COUNT(*) 
        FROM traffic_report_verifications v 
        WHERE v.traffic_report_id = tr.traffic_report_id 
        AND v.verification_type = 'fake'
      ), 0) as fake_verifications
    FROM traffic_reports tr
    LEFT JOIN commuters c ON tr.commuter_id = c.commuter_id
    LEFT JOIN drivers d ON tr.driver_id = d.driverid
    LEFT JOIN traffic_report_likes l ON tr.traffic_report_id = l.traffic_report_id
    LEFT JOIN traffic_report_comments tc ON tr.traffic_report_id = tc.traffic_report_id
    WHERE DATE(tr.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila') = $1
    GROUP BY tr.traffic_report_id, c."profile-image", d.imageurl, c.fname, d.fname, d.lastname, d.driverid, c.commuter_id
    ORDER BY tr.created_at DESC
  `;
    
    const result = await db.query(sql, [currentDate]);
    console.log('✅ Query successful:', result.rows.length, 'rows found for current date:', currentDate);
    
    let postsWithLikes = result.rows;
    
    if (email) {
      const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
      const commuterResult = await db.query(commuterQuery, [email]);

      let commuter_id = null; 
      let driver_id = null;

      if (commuterResult.rows.length > 0) {
        commuter_id = commuterResult.rows[0].commuter_id;
      } else {
        const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
        const driverResult = await db.query(driverQuery, [email]);
        
        if (driverResult.rows.length > 0) {
          driver_id = driverResult.rows[0].driverid;
        }
      }

      if (commuter_id || driver_id) {
        // Get user likes
        const userLikesSql = `
          SELECT traffic_report_id 
          FROM traffic_report_likes 
          WHERE commuter_id = $1 OR driver_id = $2
        `;
        
        const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
        const userLikedPosts = userLikesResult.rows.map(row => row.traffic_report_id);
        
        // Get user verifications
        const userVerificationsSql = `
          SELECT traffic_report_id, verification_type 
          FROM traffic_report_verifications 
          WHERE email = $1
        `;
        
        const userVerificationsResult = await db.query(userVerificationsSql, [email]);
        const userVerifications = {};
        userVerificationsResult.rows.forEach(row => {
          userVerifications[row.traffic_report_id] = row.verification_type;
        });
        
        postsWithLikes = postsWithLikes.map(post => ({
          ...post,
          user_liked: userLikedPosts.includes(post.traffic_report_id),
          user_verification: userVerifications[post.traffic_report_id] || null
        }));
      }
    }
    
    const posts = postsWithLikes.map(row => {
      // Calculate credibility score if it's an accident report
      let credibilityScore = row.credibility_score || 0;
      if (row.is_accident_report) {
        // Recalculate if we have verifications data
        if (row.legit_verifications > 0 || row.fake_verifications > 0) {
          credibilityScore = calculateDynamicCredibilityScore(row);
        }
      }
      
      return {
        traffic_report_id: row.traffic_report_id,
        report_text: row.report_text,
        image: row.image,
        location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
        created_at: row.created_at,
        user_name: row.user_name,
        'profile-image': row['profile-image'],
        like_count: parseInt(row.like_count) || 0,
        comment_count: parseInt(row.comment_count) || 0,
        user_liked: row.user_liked || false,
        display_name: row.display_name,
        driver_fname: row.driver_fname,
        driver_lastname: row.driver_lastname,
        commuter_fname: row.commuter_fname,
        driver_id: row.driverid,
        commuter_id: row.commuter_id,
        email: row.email,
        is_accident_report: row.is_accident_report || false,
        credibility_score: credibilityScore,
        legit_verifications: parseInt(row.legit_verifications) || 0,
        fake_verifications: parseInt(row.fake_verifications) || 0,
        user_verification: row.user_verification || null
      };
    });
    
    res.json({
      success: true,
      posts: posts,
      current_date: currentDate
    });
    
  } catch (error) {
    console.error('❌ Error fetching traffic reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to calculate dynamic credibility score
const calculateDynamicCredibilityScore = (post) => {
  const totalVerifications = (post.legit_verifications || 0) + (post.fake_verifications || 0);
  
  // If no verifications yet, start from 0
  if (totalVerifications === 0) {
    return 0;
  }
  
  // Calculate score based on verifications (max 70%)
  const verificationWeight = 70;
  const evidenceWeight = 30;
  
  // Calculate verification portion
  const legitPercentage = (post.legit_verifications / totalVerifications) * 100;
  const verificationScore = (legitPercentage / 100) * verificationWeight;
  
  // Calculate evidence portion (max 30%)
  let evidenceScore = 0;
  if (post.image) {
    evidenceScore += 15; // 50% of evidence weight
  }
  
  if (post.location) {
    evidenceScore += 10; // 33% of evidence weight
  }
  
  if (post.report_text && post.report_text.length > 50) {
    evidenceScore += 5; // 17% of evidence weight
  }
  
  // Scale evidence score to evidence weight
  const evidencePortion = (evidenceScore / 30) * evidenceWeight;
  
  // Combine scores
  let score = verificationScore + evidencePortion;
  
  // Apply minimum 3 verifications requirement for higher scores
  if (totalVerifications < 3) {
    // Cap at 50% if less than 3 verifications
    score = Math.min(score, 50);
  }
  
  return Math.min(Math.round(score), 100);
};

exports.likeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { email, user_name } = req.body;
    
    console.log('👍 Liking comment:', comment_id);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to like a comment.' });
    }

    const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;
    let user_name_to_use = user_name || email.split('@')[0];

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
    } else {
      const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        driver_id = driverResult.rows[0].driverid;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    const checkLikeSql = `
      SELECT comment_like_id FROM comment_likes 
      WHERE comment_id = $1 
      AND (commuter_id = $2 OR driver_id = $3)
    `;

    const checkResult = await db.query(checkLikeSql, [
      comment_id,
      commuter_id,
      driver_id
    ]);

    if (checkResult.rows.length > 0) {
      const deleteSql = `
        DELETE FROM comment_likes 
        WHERE comment_id = $1 
        AND (commuter_id = $2 OR driver_id = $3)
      `;

      await db.query(deleteSql, [
        comment_id,
        commuter_id,
        driver_id
      ]);

      console.log('👎 Comment like removed');

      res.json({
        success: true,
        liked: false,
        message: 'Comment like removed successfully'
      });
    } else {
      const insertSql = `
        INSERT INTO comment_likes (comment_id, commuter_id, driver_id, user_name)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      await db.query(insertSql, [
        comment_id,
        commuter_id,
        driver_id,
        user_name_to_use
      ]);

      console.log('👍 Comment like added');

      res.json({
        success: true,
        liked: true,
        message: 'Comment liked successfully'
      });
    }

  } catch (error) {
    console.error('❌ Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like comment',
      error: error.message
    });
  }
};

exports.getCommentLikes = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { email } = req.query;
    
    console.log('📊 Getting likes for comment:', comment_id);

    const countSql = `
      SELECT COUNT(*) as like_count 
      FROM comment_likes 
      WHERE comment_id = $1
    `;

    const countResult = await db.query(countSql, [comment_id]);
    const likeCount = parseInt(countResult.rows[0].like_count);

    let userLiked = false;

    if (email) {
      const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
      const commuterResult = await db.query(commuterQuery, [email]);

      let commuter_id = null; 
      let driver_id = null;

      if (commuterResult.rows.length > 0) {
        commuter_id = commuterResult.rows[0].commuter_id;
      } else {
        const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
        const driverResult = await db.query(driverQuery, [email]);
        
        if (driverResult.rows.length > 0) {
          driver_id = driverResult.rows[0].driverid;
        }
      }

      if (commuter_id || driver_id) {
        const checkLikeSql = `
          SELECT comment_like_id FROM comment_likes 
          WHERE comment_id = $1 
          AND (commuter_id = $2 OR driver_id = $3)
        `;

        const checkResult = await db.query(checkLikeSql, [
          comment_id,
          commuter_id,
          driver_id
        ]);

        userLiked = checkResult.rows.length > 0;
      }
    }

    res.json({
      success: true,
      like_count: likeCount,
      user_liked: userLiked
    });

  } catch (error) {
    console.error('❌ Error getting comment likes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comment likes',
      error: error.message
    });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { reply_text, email, user_name, parent_reply_id } = req.body;
    
    console.log('💬 Adding reply to comment:', comment_id);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to add a reply.' });
    }

    if (!reply_text || reply_text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reply text is required.' });
    }

    const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;
    let user_name_to_use = user_name || email.split('@')[0];

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
      user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
    } else {
      const driverQuery = 'SELECT driverid, fname, lastname FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        driver_id = driverResult.rows[0].driverid;
        const firstName = driverResult.rows[0].fname || '';
        const lastName = driverResult.rows[0].lastname || '';
        user_name_to_use = `${firstName} ${lastName}`.trim() || user_name_to_use;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    const insertSql = `
      INSERT INTO comment_replies (comment_id, commuter_id, driver_id, reply_text, user_name, parent_reply_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const insertValues = [
      comment_id,
      commuter_id,
      driver_id,
      reply_text.trim(),
      user_name_to_use,
      parent_reply_id || null
    ];

    const insertResult = await db.query(insertSql, insertValues);
    const newReply = insertResult.rows[0];

    const replyWithProfileSql = `
      SELECT 
        cr.*,
        COALESCE(cm."profile-image", d.imageurl) as "profile-image"
      FROM comment_replies cr
      LEFT JOIN commuters cm ON cr.commuter_id = cm.commuter_id
      LEFT JOIN drivers d ON cr.driver_id = d.driverid
      WHERE cr.reply_id = $1
    `;

    const replyResult = await db.query(replyWithProfileSql, [newReply.reply_id]);
    const fullReply = replyResult.rows[0];

    console.log('✅ Reply added successfully');

    res.json({
      success: true,
      reply: fullReply,
      message: 'Reply added successfully'
    });

  } catch (error) {
    console.error('❌ Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

exports.getReplies = async (req, res) => {
  try {
    const { comment_id } = req.params;
    
    console.log('💬 Fetching ALL replies for comment:', comment_id);
    
    const sql = `
      SELECT 
        cr.*,
        COALESCE(cm."profile-image", d.imageurl) as "profile-image",
        CASE 
          WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
          WHEN cr.commuter_id IS NOT NULL THEN cm.fname
          ELSE cr.user_name
        END as display_name,
        d.fname as driver_fname,
        d.lastname as driver_lastname,   
        cm.fname as commuter_fname,
        d.driverid,
        cr.commuter_id,
        cm.email as commuter_email,
        d.email as driver_email
      FROM comment_replies cr
      LEFT JOIN commuters cm ON cr.commuter_id = cm.commuter_id
      LEFT JOIN drivers d ON cr.driver_id = d.driverid
      WHERE cr.comment_id = $1
      ORDER BY cr.created_at ASC
    `;
    
    const result = await db.query(sql, [comment_id]);
    
    res.json({
      success: true,
      replies: result.rows
    });
    
  } catch (error) {
    console.error('❌ Error fetching replies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies',
      error: error.message
    });
  }
};

// ========== CREDIBILITY SYSTEM ENDPOINTS ==========

// Verify a report as legit or fake
exports.verifyReport = async (req, res) => {
  try {
    const { post_id, email, verification_type, user_name } = req.body;
    
    console.log(`🔍 Verifying report ${post_id} as ${verification_type} by ${email}`);
    
    if (!email || !post_id || !verification_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, post ID, and verification type are required.' 
      });
    }
    
    if (!['legit', 'fake'].includes(verification_type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification type must be "legit" or "fake".' 
      });
    }
    
    // Check if report exists and is an accident report
    const reportCheckSql = `
      SELECT traffic_report_id, is_accident_report, image, location, report_text,
             commuter_id, driver_id
      FROM traffic_reports 
      WHERE traffic_report_id = $1
    `;
    
    const reportResult = await db.query(reportCheckSql, [post_id]);
    
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Traffic report not found.' 
      });
    }
    
    const report = reportResult.rows[0];
    
    if (!report.is_accident_report) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only accident reports can be verified.' 
      });
    }
    
    // Check if user is trying to verify their own post
    const userCheckSql = `
      SELECT commuter_id, driverid 
      FROM (
        SELECT commuter_id, NULL as driverid FROM commuters WHERE email = $1
        UNION ALL
        SELECT NULL as commuter_id, driverid FROM drivers WHERE email = $1
      ) AS user_info
    `;
    
    const userResult = await db.query(userCheckSql, [email]);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      
      // Check if user is the post owner
      if ((user.commuter_id && report.commuter_id && user.commuter_id === report.commuter_id) ||
          (user.driverid && report.driver_id && user.driverid === report.driver_id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'You cannot verify your own post.' 
        });
      }
    }
    
    // Check if already verified by this user
    const checkSql = `
      SELECT verification_id FROM traffic_report_verifications 
      WHERE traffic_report_id = $1 AND email = $2
    `;
    
    const checkResult = await db.query(checkSql, [post_id, email]);
    
    if (checkResult.rows.length > 0) {
      // Update existing verification
      const updateSql = `
        UPDATE traffic_report_verifications 
        SET verification_type = $1, created_at = CURRENT_TIMESTAMP
        WHERE traffic_report_id = $2 AND email = $3
      `;
      
      await db.query(updateSql, [verification_type, post_id, email]);
      console.log(`✅ Updated verification for report ${post_id}`);
    } else {
      // Insert new verification
      const insertSql = `
        INSERT INTO traffic_report_verifications 
        (traffic_report_id, email, verification_type, user_name)
        VALUES ($1, $2, $3, $4)
      `;
      
      await db.query(insertSql, [
        post_id,
        email,
        verification_type,
        user_name || email.split('@')[0]
      ]);
      console.log(`✅ Added new verification for report ${post_id}`);
    }
    
    // Get verification counts
    const scoreSql = `
      SELECT 
        COUNT(CASE WHEN verification_type = 'legit' THEN 1 END) as legit_count,
        COUNT(CASE WHEN verification_type = 'fake' THEN 1 END) as fake_count
      FROM traffic_report_verifications 
      WHERE traffic_report_id = $1
    `;
    
    const scoreResult = await db.query(scoreSql, [post_id]);
    const legitCount = parseInt(scoreResult.rows[0].legit_count) || 0;
    const fakeCount = parseInt(scoreResult.rows[0].fake_count) || 0;
    
    // Calculate new credibility score
    const totalVerifications = legitCount + fakeCount;
    
    let credibilityScore = 0;
    
    // Start with evidence-only score (max 30%)
    let evidenceScore = 0;
    if (report.image) {
      evidenceScore += 15;
    }
    if (report.location) {
      evidenceScore += 10;
    }
    if (report.report_text && report.report_text.length > 50) {
      evidenceScore += 5;
    }
    
    // If no verifications yet, return evidence-only score (max 30%)
    if (totalVerifications === 0) {
      credibilityScore = evidenceScore;
    } else {
      // Calculate verification-based score (max 70%)
      const verificationWeight = 70;
      const evidenceWeight = 30;
      
      // Calculate verification portion
      const legitPercentage = (legitCount / totalVerifications) * 100;
      const verificationScore = (legitPercentage / 100) * verificationWeight;
      
      // Scale evidence score to evidence weight
      const evidencePortion = (evidenceScore / 30) * evidenceWeight;
      
      // Combine scores
      credibilityScore = verificationScore + evidencePortion;
      
      // Apply minimum 3 verifications requirement for higher scores
      if (totalVerifications < 3) {
        // Cap at 50% if less than 3 verifications
        credibilityScore = Math.min(credibilityScore, 50);
      }
    }
    
    // Cap at 100
    credibilityScore = Math.min(Math.round(credibilityScore), 100);
    
    // Update credibility score in database
    await db.query(
      'UPDATE traffic_reports SET credibility_score = $1 WHERE traffic_report_id = $2',
      [credibilityScore, post_id]
    );
    
    res.json({
      success: true,
      new_score: credibilityScore,
      legit_count: legitCount,
      fake_count: fakeCount,
      total_verifications: totalVerifications,
      message: `Report ${verification_type === 'legit' ? 'verified as legitimate' : 'marked as not legitimate'}`
    });
    
  } catch (error) {
    console.error('❌ Error verifying report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify report',
      error: error.message
    });
  }
};

// Get credibility scores for multiple posts
exports.getCredibilityScores = async (req, res) => {
  try {
    const { post_ids } = req.body;
    
    if (!Array.isArray(post_ids) || post_ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post IDs array is required.' 
      });
    }
    
    const sql = `
      SELECT 
        tr.traffic_report_id, 
        tr.credibility_score,
        tr.is_accident_report,
        tr.image,
        tr.location,
        tr.report_text,
        COALESCE((
          SELECT COUNT(*) 
          FROM traffic_report_verifications v 
          WHERE v.traffic_report_id = tr.traffic_report_id 
          AND v.verification_type = 'legit'
        ), 0) as legit_verifications,
        COALESCE((
          SELECT COUNT(*) 
          FROM traffic_report_verifications v 
          WHERE v.traffic_report_id = tr.traffic_report_id 
          AND v.verification_type = 'fake'
        ), 0) as fake_verifications
      FROM traffic_reports tr
      WHERE tr.traffic_report_id = ANY($1)
    `;
    
    const result = await db.query(sql, [post_ids]);
    
    const scores = {};
    result.rows.forEach(row => {
      scores[row.traffic_report_id] = {
        score: row.credibility_score || 0,
        is_accident_report: row.is_accident_report || false,
        legit_verifications: parseInt(row.legit_verifications) || 0,
        fake_verifications: parseInt(row.fake_verifications) || 0,
        total_verifications: (parseInt(row.legit_verifications) || 0) + (parseInt(row.fake_verifications) || 0)
      };
    });
    
    res.json({
      success: true,
      scores: scores
    });
    
  } catch (error) {
    console.error('❌ Error getting credibility scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get credibility scores',
      error: error.message
    });
  }
};

// Get user verification status for posts
exports.getUserVerifications = async (req, res) => {
  try {
    const { email, post_ids } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required.' 
      });
    }
    
    const postIdArray = post_ids ? post_ids.split(',').map(id => parseInt(id)) : [];
    
    let sql = `
      SELECT traffic_report_id, verification_type 
      FROM traffic_report_verifications 
      WHERE email = $1
    `;
    
    const params = [email];
    
    if (postIdArray.length > 0) {
      sql += ` AND traffic_report_id = ANY($2)`;
      params.push(postIdArray);
    }
    
    const result = await db.query(sql, params);
    
    const verifications = {};
    result.rows.forEach(row => {
      verifications[row.traffic_report_id] = row.verification_type;
    });
    
    res.json({
      success: true,
      verifications: verifications
    });
    
  } catch (error) {
    console.error('❌ Error getting user verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user verifications',
      error: error.message
    });
  }
};

// Get detailed credibility info for a specific post
exports.getCredibilityDetails = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    
    console.log('📊 Getting credibility details for report:', traffic_report_id);
    
    const sql = `
      SELECT 
        tr.traffic_report_id,
        tr.report_text,
        tr.image,
        tr.location,
        tr.is_accident_report,
        tr.credibility_score,
        tr.created_at,
        (
          SELECT COUNT(*) 
          FROM traffic_report_verifications 
          WHERE traffic_report_id = tr.traffic_report_id 
          AND verification_type = 'legit'
        ) as legit_count,
        (
          SELECT COUNT(*) 
          FROM traffic_report_verifications 
          WHERE traffic_report_id = tr.traffic_report_id 
          AND verification_type = 'fake'
        ) as fake_count,
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'email', email,
              'verification_type', verification_type,
              'user_name', user_name,
              'created_at', created_at
            )
          )
          FROM traffic_report_verifications 
          WHERE traffic_report_id = tr.traffic_report_id
          ORDER BY created_at DESC
          LIMIT 10
        ) as recent_verifications
      FROM traffic_reports tr
      WHERE tr.traffic_report_id = $1
    `;
    
    const result = await db.query(sql, [traffic_report_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Traffic report not found.'
      });
    }
    
    const report = result.rows[0];
    
    res.json({
      success: true,
      credibility_details: {
        traffic_report_id: report.traffic_report_id,
        is_accident_report: report.is_accident_report,
        credibility_score: report.credibility_score || 0,
        legit_count: parseInt(report.legit_count) || 0,
        fake_count: parseInt(report.fake_count) || 0,
        total_verifications: (parseInt(report.legit_count) || 0) + (parseInt(report.fake_count) || 0),
        has_image: !!report.image,
        has_location: !!report.location,
        recent_verifications: report.recent_verifications || []
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting credibility details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get credibility details',
      error: error.message
    });
  }
};

// Get similar accident reports in the same area (ONLY FROM CURRENT DAY AND OTHER USERS)
exports.getSimilarAccidentReports = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    
    console.log('📍 Getting similar accident reports for:', traffic_report_id);
    
    // Get current date in PH time
    const now = new Date();
    const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const currentDate = phTime.toISOString().split('T')[0];
    
    console.log('📅 Current PH Date for similar reports:', currentDate);
    
    // First, get the location and user info of the current report
    const locationSql = `
      SELECT location, commuter_id, driver_id
      FROM traffic_reports 
      WHERE traffic_report_id = $1 AND location IS NOT NULL
    `;
    
    const locationResult = await db.query(locationSql, [traffic_report_id]);
    
    if (locationResult.rows.length === 0) {
      return res.json({
        success: true,
        similar_reports: [],
        message: 'Report has no location data'
      });
    }
    
    const currentReport = locationResult.rows[0];
    
    // Parse location if it's a string
    let currentLocation;
    try {
      currentLocation = typeof currentReport.location === 'string' 
        ? JSON.parse(currentReport.location) 
        : currentReport.location;
    } catch (error) {
      console.error('Error parsing location:', error);
      return res.json({
        success: true,
        similar_reports: [],
        message: 'Invalid location data format'
      });
    }
    
    // Check if location has valid coordinates
    if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
      return res.json({
        success: true,
        similar_reports: [],
        message: 'Report has incomplete location data'
      });
    }
    
    // Get reports from CURRENT DAY ONLY from OTHER users within 1km radius
    const similarSql = `
      SELECT 
        tr.traffic_report_id,
        tr.report_text,
        tr.image,
        tr.location,
        tr.created_at,
        tr.credibility_score,
        tr.is_accident_report,
        COALESCE(c."profile-image", d.imageurl) as "profile-image",
        CASE 
          WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
          WHEN c.commuter_id IS NOT NULL THEN c.fname
          ELSE tr.user_name
        END as display_name
      FROM traffic_reports tr
      LEFT JOIN commuters c ON tr.commuter_id = c.commuter_id
      LEFT JOIN drivers d ON tr.driver_id = d.driverid
      WHERE tr.traffic_report_id != $1
      AND tr.is_accident_report = true
      AND tr.location IS NOT NULL
      AND DATE(tr.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila') = $2
      AND (
        -- Exclude posts from the same user
        (tr.commuter_id IS NULL OR tr.commuter_id != $3)
        AND (tr.driver_id IS NULL OR tr.driver_id != $4)
      )
      AND (
        -- Simple distance calculation (approximate for small distances)
        ABS((location->>'latitude')::FLOAT - $5::FLOAT) < 0.009 -- ~1km
        AND ABS((location->>'longitude')::FLOAT - $6::FLOAT) < 0.009 -- ~1km
      )
      ORDER BY tr.created_at DESC
      LIMIT 10
    `;
    
    const similarResult = await db.query(similarSql, [
      traffic_report_id,
      currentDate,
      currentReport.commuter_id,
      currentReport.driver_id,
      currentLocation.latitude,
      currentLocation.longitude
    ]);
    
    // Parse location for each similar report
    const similarReports = similarResult.rows.map(row => {
      let location = null;
      try {
        location = typeof row.location === 'string' 
          ? JSON.parse(row.location) 
          : row.location;
      } catch (error) {
        console.error('Error parsing similar report location:', error);
      }
      
      return {
        traffic_report_id: row.traffic_report_id,
        report_text: row.report_text || '',
        image: row.image,
        location: location,
        created_at: row.created_at,
        credibility_score: row.credibility_score || 0,
        is_accident_report: row.is_accident_report || false,
        'profile-image': row['profile-image'],
        display_name: row.display_name || 'User'
      };
    });
    
    res.json({
      success: true,
      similar_reports: similarReports,
      count: similarReports.length,
      current_date: currentDate
    });
    
  } catch (error) {
    console.error('❌ Error getting similar accident reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar accident reports',
      error: error.message
    });
  }
};
