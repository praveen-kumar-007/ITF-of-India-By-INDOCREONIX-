const express = require("express");
const router = express.Router();
const {
  requestPasswordSetup,
  setupPassword,
  loginAthlete,
  loginAthleteWithGoogle,
  getAthleteProfile,
} = require("../controllers/athleteAuthController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validateMiddleware");
const {
  athleteLoginSchema,
  otpSendSchema,
  otpVerifySchema,
  setupPasswordSchema,
  googleAuthSchema,
} = require("../utils/validationSchemas");

// @route   POST /api/athlete/request-setup
// @desc    Request OTP for first-time setup
router.post(
  "/request-setup",
  authLimiter,
  validate(otpSendSchema),
  requestPasswordSetup,
);

// @route   POST /api/athlete/setup-password
// @desc    Verify OTP and set password
router.post(
  "/setup-password",
  authLimiter,
  validate(setupPasswordSchema),
  setupPassword,
);

// @route   POST /api/athlete/login
// @desc    Athlete login
router.post("/login", authLimiter, validate(athleteLoginSchema), loginAthlete);

// @route   POST /api/athlete/oauth/google
// @desc    Athlete Google OAuth login
router.post(
  "/oauth/google",
  authLimiter,
  validate(googleAuthSchema),
  loginAthleteWithGoogle,
);

// @route   GET /api/athlete/profile
// @desc    Get current athlete profile (for status check)
router.get("/profile", protect, getAthleteProfile);

module.exports = router;
