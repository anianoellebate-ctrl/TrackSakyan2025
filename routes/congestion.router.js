// const express = require('express');
// const router = express.Router();
// const CongestionController = require('../controller/congestion.controller');

// // ✅ ADD BODY PARSER TO THIS ROUTER
// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));

// // Initialize congestion controller
// const congestionController = new CongestionController();

// // Add debugging middleware
// router.use((req, res, next) => {
//     console.log(`📥 ${req.method} ${req.path}`, req.body);
//     next();
// });

// // Congestion Prediction Routes
// router.post('/predict-congestion', (req, res) => {
//     console.log('🎯 Handling prediction request');
//     congestionController.predictCongestion(req, res);
// });

// router.get('/sample-predictions', (req, res) => {
//     congestionController.getSamplePredictions(req, res);
// });

// router.get('/congestion-status', (req, res) => {
//     congestionController.getStatus(req, res);
// });

// router.post('/retrain-model', (req, res) => {
//     congestionController.retrainModel(req, res);
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const CongestionController = require('../controller/congestion.controller');

// ✅ ADD BODY PARSER TO THIS ROUTER
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Initialize congestion controller
const congestionController = new CongestionController();

// Add debugging middleware
router.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`, req.body);
    next();
});

// 🆕 NEW: Passenger Demand AI Assistant Route
router.post('/ask-ai', (req, res) => {
    console.log('🎯 Handling passenger volume AI assistant request');
    congestionController.askAICongestion(req, res);
});

// 🆕 NEW: Passenger Demand Prediction Routes
router.post('/predict-passenger-demand', (req, res) => {
    console.log('🎯 Handling passenger demand prediction request');
    congestionController.predictPassengerDemand(req, res);
});

router.post('/analyze-citywide-demand', (req, res) => {
    console.log('🎯 Handling city-wide passenger demand analysis');
    congestionController.analyzeCitywideDemand(req, res);
});

router.get('/analyze-citywide-demand', (req, res) => {
    console.log('🎯 Handling GET city-wide passenger demand analysis');
    congestionController.analyzeCitywideDemand(req, res);
});

// ✅ EXISTING: Congestion Prediction Routes (keep these)
router.post('/predict-congestion', (req, res) => {
    console.log('🎯 Handling congestion prediction request');
    congestionController.predictCongestion(req, res);
});

router.get('/sample-predictions', (req, res) => {
    congestionController.getSamplePredictions(req, res);
});

router.get('/congestion-status', (req, res) => {
    congestionController.getStatus(req, res);
});

router.post('/retrain-model', (req, res) => {
    congestionController.retrainModel(req, res);
});

module.exports = router;