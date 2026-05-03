const express = require('express');
const router = express.Router();
const { 
  login, 
  createAdmin, 
  getAllAdmins, 
  deleteAdmin, 
  updateProfile, 
  updateAdmin,
  getSystemHealth 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validateMiddleware');
const { loginSchema, adminCreateSchema, adminUpdateSchema } = require('../utils/validationSchemas');
const upload = require('../middleware/multer');

router.post('/login', authLimiter, validate(loginSchema), login);

// Admin management routes (Super Admin only)
router.get('/', protect, authorize('superadmin'), getAllAdmins);
router.get('/system-health', protect, authorize('superadmin'), getSystemHealth);
router.post('/create-admin', protect, authorize('superadmin'), validate(adminCreateSchema), createAdmin);
router.put('/:id', protect, authorize('superadmin'), validate(adminUpdateSchema), updateAdmin);
router.delete('/:id', protect, authorize('superadmin'), deleteAdmin);
router.put('/profile/:id', protect, upload.single('photo'), validate(adminUpdateSchema), updateProfile);

module.exports = router;
