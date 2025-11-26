const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controller/forgotpassword.controller');

// POST /api/v1/forgot-password - Request password reset code
router.post('/forgot-password', forgotPasswordController.forgotPassword);

// POST /api/v1/verify-reset-code - Verify reset code
router.post('/verify-reset-code', forgotPasswordController.verifyResetCode);

// POST /api/v1/reset-password - Reset password with verified code
router.post('/reset-password', forgotPasswordController.resetPassword);

// POST /api/v1/resend-reset-code - Resend reset code
router.post('/resend-reset-code', forgotPasswordController.resendResetCode);

module.exports = router;
