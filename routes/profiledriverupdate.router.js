// routes/profile.js
const express = require('express');
const router = express.Router();
const profileDriverUpdateController = require('../controller/profiledriverupdate');

// Profile update route
router.put('/:email', profileDriverUpdateController.updateDriverProfile);

module.exports = router;