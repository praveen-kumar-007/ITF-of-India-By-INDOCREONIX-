const express = require('express');
const router = express.Router();
const { getPaymentSettings, updatePaymentSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/payment', getPaymentSettings);
router.patch('/payment', protect, authorize('superadmin'), updatePaymentSettings);

module.exports = router;
