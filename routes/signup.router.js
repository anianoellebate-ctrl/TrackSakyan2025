const express = require('express');
const router = express.Router();
const signupController = require('../controller/signup.controller');

router.post('/', signupController.signupCommuter);


// POST /api/v1/verification/verify-email - Verify email with code
router.post('/verify-email', signupController.verifyEmail);

// POST /api/v1/verification/resend-verification - Resend verification code
router.post('/resend-verification', signupController.resendVerification);


module.exports = router;
