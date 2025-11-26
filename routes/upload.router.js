const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// POST /api/v1/upload
router.post('/', uploadController.uploadImage);

module.exports = router;
