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

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
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
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev')); // Logging
app.use(compression()); // Compress responses
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
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

app.use('/api/registrations', registrationRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/athlete', athleteAuthRoutes);

// 404 Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.statusCode = 404;
  next(error);
});

// Error Handler
app.use(errorMiddleware);

module.exports = app;
