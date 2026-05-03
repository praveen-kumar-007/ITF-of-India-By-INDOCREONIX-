const express = require('express');
const router = express.Router();
const { login, createAdmin, getAllAdmins, deleteAdmin, updateProfile, updateAdmin } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

router.post('/login', login);

// Admin management routes (Super Admin only)
router.get('/', protect, authorize('superadmin'), getAllAdmins);
router.post('/create-admin', protect, authorize('superadmin'), createAdmin);
router.put('/:id', protect, authorize('superadmin'), updateAdmin);
router.delete('/:id', protect, authorize('superadmin'), deleteAdmin);
router.put('/profile/:id', protect, upload.single('photo'), updateProfile);

module.exports = router;
