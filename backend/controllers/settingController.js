const { db } = require('../config/firebase');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get payment settings
// @route   GET /api/settings/payment
// @access  Public (for players)
exports.getPaymentSettings = async (req, res) => {
  try {
    const snapshot = await db.ref('settings/payment').once('value');
    const settings = snapshot.val();
    
    if (!settings) {
      // Default fallback
      return sendSuccess(res, 200, 'Payment settings fetched', {
        upiId: '8340302054@ibl',
        merchantName: 'Indra Kumar Rishi',
        amount: '100'
      });
    }
    
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
    
    sendSuccess(res, 200, 'Payment settings updated successfully', { upiId, merchantName, amount });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get system control settings (toggles)
// @route   GET /api/settings/system-control
exports.getSystemControl = async (req, res) => {
  try {
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
    sendSuccess(res, 200, 'System controls updated successfully', updates);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
