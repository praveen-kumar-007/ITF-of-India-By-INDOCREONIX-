const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validateMiddleware');
const { otpSendSchema, otpVerifySchema } = require('../utils/validationSchemas');

router.post('/send', authLimiter, validate(otpSendSchema), sendOTP);
router.post('/verify', authLimiter, validate(otpVerifySchema), verifyOTP);

module.exports = router;
