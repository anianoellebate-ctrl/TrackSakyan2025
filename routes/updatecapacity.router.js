// routes/capacity.router.js
const express = require('express');
const router = express.Router();
const updateCapacityController = require('../controller/updatecapacity.controller');

// POST /api/v1/capacity/update
router.post('/', updateCapacityController.updateCapacity);

module.exports = router;