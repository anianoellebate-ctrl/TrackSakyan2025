// const express = require('express');
// const router = express.Router();
// const trafficController = require('../controller/trafficreports.controller');
// const upload = require('../middleware/multer'); // ✅ import multer middleware

// // Test endpoint
// router.get('/test', trafficController.testEndpoint);

// // GET all traffic reports
// router.get('/', trafficController.getTrafficReports);

// // POST a new traffic report
// router.post('/', upload.single('image'), trafficController.createTrafficReport);

// router.get('/:traffic_report_id/comments', trafficController.getComments);
// router.post('/:traffic_report_id/comments', trafficController.addComment);
// router.post('/:traffic_report_id/like', trafficController.likeReport);
// router.get('/:traffic_report_id/likes', trafficController.getLikes);

// // Add these after your existing comment routes
// router.post('/comments/:comment_id/like', trafficController.likeComment);
// router.get('/comments/:comment_id/likes', trafficController.getCommentLikes);
// router.post('/comments/:comment_id/replies', trafficController.addReply);
// router.get('/comments/:comment_id/replies', trafficController.getReplies);

// router.get('/my-posts/:email', trafficController.getMyPosts);
// router.delete('/:traffic_report_id', trafficController.deleteMyPost);

// // ========== CREDIBILITY SYSTEM ROUTES ==========
// // Verify a report as legit or fake
// router.post('/credibility/verify', trafficController.verifyReport);

// // Get credibility scores for multiple posts
// router.post('/credibility/scores', trafficController.getCredibilityScores);

// // Get user verification status for posts
// router.get('/credibility/user-verifications', trafficController.getUserVerifications);

// // Get detailed credibility info for a specific post
// router.get('/:traffic_report_id/credibility-details', trafficController.getCredibilityDetails);

// // Get similar accident reports in the same area
// router.get('/:traffic_report_id/similar-accidents', trafficController.getSimilarAccidentReports);

// module.exports = router;


const express = require('express');
const router = express.Router();
const trafficController = require('../controller/trafficreports.controller');
const upload = require('../middleware/multer'); // ✅ import multer middleware

// Test endpoint
router.get('/test', trafficController.testEndpoint);

// GET all traffic reports
router.get('/', trafficController.getTrafficReports);

// POST a new traffic report
router.post('/', upload.single('image'), trafficController.createTrafficReport);

router.get('/:traffic_report_id/comments', trafficController.getComments);
router.post('/:traffic_report_id/comments', trafficController.addComment);
router.post('/:traffic_report_id/like', trafficController.likeReport);
router.get('/:traffic_report_id/likes', trafficController.getLikes);

// Add these after your existing comment routes
router.post('/comments/:comment_id/like', trafficController.likeComment);
router.get('/comments/:comment_id/likes', trafficController.getCommentLikes);
router.post('/comments/:comment_id/replies', trafficController.addReply);
router.get('/comments/:comment_id/replies', trafficController.getReplies);

router.get('/my-posts/:email', trafficController.getMyPosts);
router.delete('/:traffic_report_id', trafficController.deleteMyPost);

// ========== VERIFICATION SYSTEM ROUTES (NOT CREDIBILITY) ==========
// Verify a report as legit or fake
router.post('/verify', trafficController.verifyReport); // Removed /credibility from path

// Get verification counts for multiple posts
router.post('/verification-counts', trafficController.getCredibilityScores); // Renamed route

// Get user verification status for posts
router.get('/user-verifications', trafficController.getUserVerifications); // Removed /credibility

// Get similar accident reports in the same area
router.get('/:traffic_report_id/similar-accidents', trafficController.getSimilarAccidentReports);

// REMOVE THIS ENTIRELY: router.get('/:traffic_report_id/credibility-details', trafficController.getCredibilityDetails);

module.exports = router;
