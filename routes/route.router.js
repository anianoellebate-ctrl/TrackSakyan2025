const express = require('express');
const router = express.Router();
const routeController = require('../controller/route.controller');

// ✅ GET /api/v1/routes/:routeName
router.get('/:routeName', routeController.getRouteByName);

module.exports = router;
