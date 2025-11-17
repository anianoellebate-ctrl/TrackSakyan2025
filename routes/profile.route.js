const express = require('express');
const router = express.Router();
const profileController = require('../controller/profile.controller');

// GET profile by email
router.get('/:email', profileController.getProfileByEmail);

module.exports = router;