const express = require('express');
const router = express.Router();
const tripController = require('../controller/tripsummary.controller');

router.post('/starttrip', tripController.startTrip);
router.post('/endtrip', tripController.endTrip);
router.get('/todaysummary', tripController.getTodaySummary);
router.get('/realtimepassengers', tripController.getRealTimePassengerData);

module.exports = router;