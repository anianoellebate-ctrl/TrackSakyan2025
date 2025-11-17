// jeepney-density-router.js
const express = require('express');
const router = express.Router();
const JeepneyDensityController = require('../controller/jeepneydensity.controller');

// Body parser for this router
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Initialize controller
const jeepneyDensityController = new JeepneyDensityController();

// Debug middleware
router.use((req, res, next) => {
    console.log(`🚐 ${req.method} ${req.path}`, req.body);
    next();
});

// Jeepney Density Routes
router.post('/predict-density', (req, res) => {
    console.log('🎯 Handling jeepney density prediction');
    jeepneyDensityController.predictDensity(req, res);
});

router.get('/sample-predictions', (req, res) => {
    jeepneyDensityController.getSamplePredictions(req, res);
});

router.get('/density-status', (req, res) => {
    jeepneyDensityController.getStatus(req, res);
});

router.post('/analyze-citywide', (req, res) => {
    jeepneyDensityController.analyzeCitywide(req, res);
});

router.post('/ask-ai', (req, res) => {
    jeepneyDensityController.askAI(req, res);
});

module.exports = router;