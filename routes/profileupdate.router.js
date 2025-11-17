// routes/profile.js
const express = require('express');
const router = express.Router();
const profileUpdateController = require('../controller/profileupdate.controller');

// Profile update route
router.put('/:email', profileUpdateController.updateProfile);

module.exports = router;