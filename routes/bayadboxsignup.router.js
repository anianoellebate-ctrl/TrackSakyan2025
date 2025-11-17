const express = require('express');
const router = express.Router();
const driverSignupController = require('../controller/bayadboxsignup.controller');

router.post('/', driverSignupController.signup);

module.exports = router;