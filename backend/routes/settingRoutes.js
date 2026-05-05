const express = require('express');
const router = express.Router();
const { 
  getPaymentSettings, 
  updatePaymentSettings,
  getSystemControl,
  updateSystemControl
} = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/payment', getPaymentSettings);
router.patch('/payment', protect, authorize('superadmin'), updatePaymentSettings);

router.get('/system-control', getSystemControl);
router.patch('/system-control', protect, authorize('superadmin'), updateSystemControl);

module.exports = router;
