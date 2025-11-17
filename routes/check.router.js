const express = require('express');
const router = express.Router();
const { getAllDrivers, getAllTrips } = require('../controller/check');

router.get('/all', getAllTrips);

module.exports = router;