const express = require('express');
const router = express.Router();
const heatmapController = require('../controller/heatmap.controller');


router.get('/test-heatmap', heatmapController.testHeatmap);
router.get('/route', heatmapController.getRouteHeatmap);
router.get('/driver', heatmapController.getDriverHeatmap);
router.get('/summary', heatmapController.getHeatmapSummary);
router.get('/time-specific', heatmapController.getTimeSpecificHeatmap);
router.get('/jeepney-congestion', heatmapController.getJeepneyCongestion);
router.get('/test-congestion', heatmapController.testCongestion);

module.exports = router;