const express = require('express');
const router = express.Router();
const uploadController = require('../controller/upload.controller');

// POST /api/v1/upload
router.post('/', uploadController.uploadImage);

module.exports = router;
