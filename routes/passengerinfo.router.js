// routes/driverinfo.router.js
const express = require('express');
const router = express.Router();
const passengerinfoController = require('../controller/passengerinfo');

// GET /api/v1/driverinfo/:email
router.get('/:email', passengerinfoController.getPassengerByEmail);

module.exports = router;
