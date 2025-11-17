// routes/driverinfo.router.js
const express = require('express');
const router = express.Router();
const driverinfoController = require('../controller/driverinfo.controller');

// GET /api/v1/driverinfo/:email
router.get('/:email', driverinfoController.getDriverByEmail);
router.put('/update-route', driverinfoController.updateDriverRoute); 
router.get('/routes/all', driverinfoController.getAllRoutes);

module.exports = router;
