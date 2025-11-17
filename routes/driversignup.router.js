const express = require('express');
const router = express.Router();
const driversignup = require('../controller/driversignup.controller');
const upload = require('../middleware/multer'); // ✅ import multer middleware

router.post('/', upload.single('DriverImage'), driversignup.signupDriver);

// POST /api/v1/verification/verify-email - Verify email with code
router.post('/verify-email', driversignup.verifyEmail);

// POST /api/v1/verification/resend-verification - Resend verification code
router.post('/resend-verification', driversignup.resendVerification);

module.exports = router;
