const express = require('express');
const router = express.Router();
const { 
  requestPasswordSetup, 
  setupPassword, 
  loginAthlete,
  getAthleteProfile
} = require('../controllers/athleteAuthController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/athlete/request-setup
// @desc    Request OTP for first-time setup
router.post('/request-setup', requestPasswordSetup);

// @route   POST /api/athlete/setup-password
// @desc    Verify OTP and set password
router.post('/setup-password', setupPassword);

// @route   POST /api/athlete/login
// @desc    Athlete login
router.post('/login', loginAthlete);

// @route   GET /api/athlete/profile
// @desc    Get current athlete profile (for status check)
router.get('/profile', protect, getAthleteProfile);

module.exports = router;
