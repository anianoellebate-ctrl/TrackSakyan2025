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

module.exports = router;