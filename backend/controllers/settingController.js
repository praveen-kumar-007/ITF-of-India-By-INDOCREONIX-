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
      return sendSuccess(res, {
        upiId: '8340302054@ibl',
        merchantName: 'Indra Kumar Rishi',
        amount: '100'
      });
    }
    
    sendSuccess(res, settings);
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
    
    sendSuccess(res, { upiId, merchantName, amount }, 'Payment settings updated successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
