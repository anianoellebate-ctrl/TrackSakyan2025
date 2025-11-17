// routes/apikeys.router.js
const express = require('express');
const router = express.Router();
const apiKeysController = require('../controller/apikeys.controller');

// GET /api/v1/apikeys - Get all active API keys
router.get('/', apiKeysController.getApiKeys);

// GET /api/v1/apikeys/:keyName - Get specific API key
router.get('/:keyName', apiKeysController.getApiKeyByName);

module.exports = router;