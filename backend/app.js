const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const errorMiddleware = require('./middleware/errorMiddleware');
const registrationRoutes = require('./routes/registrationRoutes');
const otpRoutes = require('./routes/otpRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy for rate limiting behind reverse proxies (Heroku, Cloudflare, Nginx, etc.)
app.set('trust proxy', 1);

// Middleware
app.disable('x-powered-by'); // Hide server technology
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"]
    },
  },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' } // Prevent clickjacking
})); // Security headers

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, strictly check against allowedOrigins
    const isAllowed = allowedOrigins.includes(origin) || 
                     (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:'));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev')); // Logging
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10kb' })); // Body parser with limit to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'ITF OF INDIA Backend API is running successfully.',
    health: '/health'
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Athlete Portal Registration (Public with OTP verification)
// We only protect the registration SUBMISSION if you want, 
// but usually public can submit.
// HOWEVER, the user said "admin should not be allowed to login" (meaning verification)
// and "protect registration routes".
// I'll protect the GET and PATCH routes in registrationRoutes.js instead of here.

const athleteAuthRoutes = require('./routes/athleteAuthRoutes');
const settingRoutes = require('./routes/settingRoutes');

app.use('/api/registrations', registrationRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/athlete', athleteAuthRoutes);
app.use('/api/settings', settingRoutes);

// 404 Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.statusCode = 404;
  next(error);
});

// Error Handler
app.use(errorMiddleware);

module.exports = app;
