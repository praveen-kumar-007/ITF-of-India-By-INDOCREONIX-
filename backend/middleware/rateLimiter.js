const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Limits total requests from a single IP to 100 requests per 15 minutes.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 to support high-frequency health dashboard polling
  standardHeaders: true, 
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

/**
 * Authentication & Sensitive Route Limiter
 * Stricter limit for login, OTP, and registration to prevent brute-force attacks.
 * Limits to 5 requests per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
