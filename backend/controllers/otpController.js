const { saveData, getAllData, deleteData, queryData } = require('../services/firebaseService');
const { sendOTPEmail } = require('../services/mailService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Generate and Send OTP
 */
const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Save to Firebase
    // Note: In a real app, you'd use a dedicated collection and maybe clean up old ones
    await saveData('otps', {
      email,
      otp,
      expiresAt,
      createdAt: Date.now()
    });

    // Send Email
    await sendOTPEmail(email, otp);

    sendSuccess(res, 200, 'OTP sent successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, 'Email and OTP are required');
    }

    // Get OTPs for this email
    const otps = await queryData('otps', 'email', email);
    
    // Find valid OTP
    const otpEntry = (otps || []).find(data => 
      data.otp === otp && 
      data.expiresAt > Date.now()
    );

    if (!otpEntry) {
      return sendError(res, 400, 'Invalid or expired OTP');
    }

    // Delete the OTP after successful verification
    await deleteData('otps', otpEntry.id);

    sendSuccess(res, 200, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOTP,
  verifyOTP
};
