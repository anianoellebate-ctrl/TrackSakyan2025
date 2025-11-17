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
      { folder: 'TrackSakay/TrafficReports' }, // Using a different folder
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

// Test endpoint to check if API is working
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

// Create a new traffic report
exports.createTrafficReport = async (req, res) => {
  try {
    console.log('📝 Creating traffic report with file upload...');

    const { text, location, email, user_name } = req.body;
    const file = req.file;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to create a report.' });
    }

    // Check if user exists in commuters table
    const commuterQuery = 'SELECT commuter_id, fname, "profile-image" FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;
    let user_name_to_use = user_name || email.split('@')[0];
    let profile_image = null;

    if (commuterResult.rows.length > 0) {
      // User is a commuter
      commuter_id = commuterResult.rows[0].commuter_id;
      user_name_to_use = commuterResult.rows[0].fname || user_name_to_use;
      profile_image = commuterResult.rows[0]['profile-image'];
    } else {
      // Check if user is a driver
      const driverQuery = 'SELECT driverid, fname, imageurl FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        // User is a driver - set driver_id
        driver_id = driverResult.rows[0].driverid;
        user_name_to_use = driverResult.rows[0].fname || user_name_to_use;
        profile_image = driverResult.rows[0].imageurl;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    let imageUrl = null;

    // Upload image to Cloudinary if file exists
    if (file) {
      console.log('🖼️ Image file detected, uploading to Cloudinary...');
      const result = await uploadToCloudinary(file.buffer);
      imageUrl = result.secure_url;
      console.log('✅ Image uploaded successfully:', imageUrl);
    }

    const insertSql = `
      INSERT INTO traffic_reports (commuter_id, driver_id, report_text, image, location, user_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `.trim();

    const insertValues = [
      commuter_id,  // commuter_id (null for drivers)
      driver_id,    // driver_id (null for commuters)
      text || '',
      imageUrl,
      location ? JSON.parse(location) : null,
      user_name_to_use,
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
        'profile-image': profile_image
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

// Get comments for a traffic report
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

// Add a comment to a traffic report
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

    // Check if user exists in commuters table
    const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;
    let user_name_to_use = user_name || email.split('@')[0];

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
    } else {
      // Check if user is a driver
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

    // Get the comment with profile image
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

// Like a traffic report
exports.likeReport = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    const { email, user_name } = req.body;
    
    console.log('👍 Liking report:', traffic_report_id);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to like a report.' });
    }

    // Check if user exists in commuters table
    const commuterQuery = 'SELECT commuter_id FROM commuters WHERE email = $1';
    const commuterResult = await db.query(commuterQuery, [email]);

    let commuter_id = null; 
    let driver_id = null;
    let user_name_to_use = user_name || email.split('@')[0];

    if (commuterResult.rows.length > 0) {
      commuter_id = commuterResult.rows[0].commuter_id;
    } else {
      // Check if user is a driver
      const driverQuery = 'SELECT driverid FROM drivers WHERE email = $1';
      const driverResult = await db.query(driverQuery, [email]);
      
      if (driverResult.rows.length > 0) {
        driver_id = driverResult.rows[0].driverid;
      } else {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    // Check if already liked
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
      // Unlike the report
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
      // Add like
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

// Get like count and check if user liked a report
exports.getLikes = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    const { email } = req.query; // Optional: check if specific user liked
    
    console.log('📊 Getting likes for report:', traffic_report_id);

    // Get total like count
    const countSql = `
      SELECT COUNT(*) as like_count 
      FROM traffic_report_likes 
      WHERE traffic_report_id = $1
    `;

    const countResult = await db.query(countSql, [traffic_report_id]);
    const likeCount = parseInt(countResult.rows[0].like_count);

    let userLiked = false;

    // Check if specific user liked this report
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

// Update the getTrafficReports function to include like counts
exports.getTrafficReports = async (req, res) => {
  try {
    console.log('📋 Fetching traffic reports...');
    const { email } = req.query; // Optional: to check if user liked each post
    
    const sql = `
    SELECT 
      tr.*,
      COALESCE(c."profile-image", d.imageurl) as "profile-image",
      -- Properly combine names for display
      CASE 
        WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
        WHEN c.commuter_id IS NOT NULL THEN c.fname
        ELSE tr.user_name
      END as display_name,
      -- Keep individual fields for debugging
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
    GROUP BY tr.traffic_report_id, c."profile-image", d.imageurl, c.fname, d.fname, d.lastname, d.driverid, c.commuter_id
    ORDER BY tr.created_at DESC
  `;
    
    const result = await db.query(sql);
    console.log('✅ Query successful:', result.rows.length, 'rows found');
    console.log('🔍 Backend raw data sample:', result.rows[0]);
    
    // Get user like status for each post if email provided
    let postsWithLikes = result.rows;
    
    if (email) {
      // Get user IDs
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
        // Get user's likes for all posts
        const userLikesSql = `
          SELECT traffic_report_id 
          FROM traffic_report_likes 
          WHERE commuter_id = $1 OR driver_id = $2
        `;
        
        const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
        const userLikedPosts = userLikesResult.rows.map(row => row.traffic_report_id);
        
        // Add user_liked property to each post
        postsWithLikes = postsWithLikes.map(post => ({
          ...post,
          user_liked: userLikedPosts.includes(post.traffic_report_id)
        }));
      }
    }
    
    // Format the response
    const posts = postsWithLikes.map(row => ({
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
      email: row.email // if available
    }));
    
    res.json({
      success: true,
      posts: posts
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

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { email, user_name } = req.body;
    
    console.log('👍 Liking comment:', comment_id);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to like a comment.' });
    }

    // Check if user exists
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

    // Check if already liked
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
      // Unlike the comment
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
      // Add like
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

// Get comment likes
exports.getCommentLikes = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { email } = req.query;
    
    console.log('📊 Getting likes for comment:', comment_id);

    // Get total like count
    const countSql = `
      SELECT COUNT(*) as like_count 
      FROM comment_likes 
      WHERE comment_id = $1
    `;

    const countResult = await db.query(countSql, [comment_id]);
    const likeCount = parseInt(countResult.rows[0].like_count);

    let userLiked = false;

    // Check if specific user liked this comment
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

// Add a reply to a comment
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

    // Check if user exists
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

    // Get the reply with profile image
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

// Get replies for a comment
// Get replies for a comment - FIXED VERSION
exports.getReplies = async (req, res) => {
  try {
    const { comment_id } = req.params;
    
    console.log('💬 Fetching ALL replies for comment:', comment_id);
    
    const sql = `
      SELECT 
        cr.*,
        COALESCE(cm."profile-image", d.imageurl) as "profile-image",
        -- Add the same name display logic as posts and comments
        CASE 
          WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
          WHEN cr.commuter_id IS NOT NULL THEN cm.fname
          ELSE cr.user_name
        END as display_name,
        -- Include individual name fields for frontend processing
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

// Update getComments to include like counts
exports.getComments = async (req, res) => {
  try {
    const { traffic_report_id } = req.params;
    const { email } = req.query;
    
    console.log('💬 Fetching comments for report:', traffic_report_id);
    
    const sql = `
      SELECT 
        c.*,
        COALESCE(cm."profile-image", d.imageurl) as "profile-image",
        -- Add the same name display logic as posts
        CASE 
          WHEN d.driverid IS NOT NULL THEN CONCAT(d.fname, ' ', COALESCE(d.lastname, ''))
          WHEN c.commuter_id IS NOT NULL THEN cm.fname
          ELSE c.user_name
        END as display_name,
        -- Include individual name fields
        d.fname as driver_fname,
        d.lastname as driver_lastname,   
        cm.fname as commuter_fname,
        d.driverid,
        c.commuter_id,
        COUNT(cl.comment_like_id) as like_count,
        COUNT(cr.reply_id) as reply_count
      FROM traffic_report_comments c
      LEFT JOIN commuters cm ON c.commuter_id = cm.commuter_id
      LEFT JOIN drivers d ON c.driver_id = d.driverid
      LEFT JOIN comment_likes cl ON c.comment_id = cl.comment_id
      LEFT JOIN comment_replies cr ON c.comment_id = cr.comment_id
      WHERE c.traffic_report_id = $1
      GROUP BY c.comment_id, cm."profile-image", d.imageurl, cm.fname, d.fname, d.lastname, d.driverid, c.commuter_id
      ORDER BY c.created_at ASC
    `;
    
    const result = await db.query(sql, [traffic_report_id]);
    
    console.log('🔍 Backend comments raw data sample:', result.rows[0]); // Debug
    
    // Get user like status for each comment if email provided
    let commentsWithLikes = result.rows;
    
    if (email) {
      // Get user IDs
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
        // Get user's likes for all comments
        const userLikesSql = `
          SELECT comment_id 
          FROM comment_likes 
          WHERE commuter_id = $1 OR driver_id = $2
        `;
        
        const userLikesResult = await db.query(userLikesSql, [commuter_id, driver_id]);
        const userLikedComments = userLikesResult.rows.map(row => row.comment_id);
        
        // Add user_liked property to each comment
        commentsWithLikes = commentsWithLikes.map(comment => ({
          ...comment,
          user_liked: userLikedComments.includes(comment.comment_id)
        }));
      }
    }
    
    // Format the response with all fields
    const formattedComments = commentsWithLikes.map(comment => ({
      ...comment,
      like_count: parseInt(comment.like_count) || 0,
      reply_count: parseInt(comment.reply_count) || 0,
      user_liked: comment.user_liked || false
    }));

    console.log('✅ Backend formatted comments sample:', formattedComments[0]);
    
    res.json({
      success: true,
      comments: formattedComments
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