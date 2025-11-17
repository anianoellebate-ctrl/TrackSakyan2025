// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/bayadboxlogin.controller');

// POST /auth/login
router.post('/login', authController.login);


router.post('/check-driver-verification', authController.checkDriverVerification);

module.exports = router;