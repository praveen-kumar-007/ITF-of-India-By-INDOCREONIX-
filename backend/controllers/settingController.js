const { db } = require('../config/firebase');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { getCache, setCache, delCache } = require('../utils/cache');

// @desc    Get payment settings
// @route   GET /api/settings/payment
// @access  Public (for players)
exports.getPaymentSettings = async (req, res) => {
  try {
    // 🚀 Redis Mediation
    const cachedSettings = await getCache('payment_settings');
    if (cachedSettings) {
      return sendSuccess(res, 200, 'Payment settings fetched from cache', cachedSettings);
    }

    const snapshot = await db.ref('settings/payment').once('value');
    const settings = snapshot.val();
    
    if (!settings) {
      const defaults = {
        upiId: '8340302054@ibl',
        merchantName: 'Indra Kumar Rishi',
        amount: '100'
      };
      await setCache('payment_settings', defaults, 3600);
      return sendSuccess(res, 200, 'Payment settings fetched (defaults)', defaults);
    }
    
    await setCache('payment_settings', settings, 3600);
    sendSuccess(res, 200, 'Payment settings fetched', settings);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update payment settings
// @route   PATCH /api/settings/payment
// @access  Private (Super Admin)
exports.updatePaymentSettings = async (req, res) => {
  const { upiId, merchantName, amount } = req.body;
  
  if (!upiId || !merchantName || !amount) {
    return sendError(res, 400, 'UPI ID, Merchant Name, and Amount are required');
  }

  try {
    await db.ref('settings/payment').set({
      upiId,
      merchantName,
      amount,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.email
    });
    
    // 🚀 Invalidate Cache
    await delCache('payment_settings');

    sendSuccess(res, 200, 'Payment settings updated successfully', { upiId, merchantName, amount });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get system control settings (toggles)
// @route   GET /api/settings/system-control
exports.getSystemControl = async (req, res) => {
  try {
    // 🚀 Redis Mediation
    const cachedControls = await getCache('system_controls');
    if (cachedControls) {
      return sendSuccess(res, 200, 'System control settings fetched from cache', cachedControls);
    }

    const snapshot = await db.ref('settings/system_control').once('value');
    let settings = snapshot.val();
    
    if (!settings) {
      // Initialize defaults if not present
      settings = {
        mail_enabled: true,
        registration_enabled: true,
        contact_enabled: true,
        gallery_enabled: true,
        news_enabled: true
      };
      await db.ref('settings/system_control').set(settings);
    }
    
    await setCache('system_controls', settings, 300); // 5 min TTL
    sendSuccess(res, 200, 'System control settings fetched', settings);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update system control settings
// @route   PATCH /api/settings/system-control
exports.updateSystemControl = async (req, res) => {
  try {
    const updates = req.body;
    await db.ref('settings/system_control').update({
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.email
    });

    // 🚀 Invalidate Cache
    await delCache('system_controls');

    sendSuccess(res, 200, 'System controls updated successfully', updates);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
