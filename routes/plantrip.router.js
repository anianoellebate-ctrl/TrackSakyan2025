const express = require('express');
const router = express.Router();
const { planTrip, searchPlaces } = require('../controller/plantrip.controller');

router.post('/plan', planTrip);
router.get('/search', searchPlaces);

module.exports = router;