const SibApiV3Sdk = require('sib-api-v3-sdk');
const { queryData, updateData, getDataById } = require('../services/firebaseService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Brevo Configuration
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const SENDER_EMAIL = 'itfofindia2013@gmail.com';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables.');
}

/**
 * Request OTP for first-time password setup or Forgot Password
 */
const requestPasswordSetup = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) return sendError(res, 400, 'Email address is required.');

    // 1. Find athlete by Email
    const athletes = await queryData('registrations', 'email', email.trim());
    if (athletes.length === 0) return sendError(res, 404, 'No approved account found with this email.');

    const athlete = athletes[0];

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 4. Store OTP in database
    await updateData('registrations', athlete.id, {
      tempOtp: otp,
      otpExpiry
    });

    // [DEV ONLY] Print OTP to console
    console.log(`\x1b[33m%s\x1b[0m`, `-----------------------------------------`);
    console.log(`\x1b[33m%s\x1b[0m`, `[DEV] OTP for ${email}: ${otp}`);
    console.log(`\x1b[33m%s\x1b[0m`, `-----------------------------------------`);

    // 5. Send Email via Brevo
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Athlete Portal Verification Code";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://itfindia.com/logo.jpeg" alt="ITF Logo" style="width: 80px; border-radius: 50%;">
        </div>
        <h2 style="color: #0a1128; text-align: center;">ITF OF INDIA</h2>
        <p>Hello <strong>${athlete.fullName}</strong>,</p>
        <p>Your verification code for the Athlete Portal is:</p>
        <div style="background: #f4f7f9; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #b8860b; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="text-align: center; color: #666; font-size: 14px;">This code is valid for 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">ITF of India - National Multi-Sport Organization</p>
      </div>
    `;
    sendSmtpEmail.sender = { "name": "ITF India", "email": SENDER_EMAIL };
    sendSmtpEmail.to = [{ "email": email, "name": athlete.fullName }];

    try {
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Brevo OTP Email sent successfully:', data.messageId);
    } catch (error) {
      console.error('Brevo API Error:', error);
    }

    sendSuccess(res, 200, 'OTP sent to your registered email.', {
      devOtp: process.env.NODE_ENV === 'development' ? otp : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and Set Password
 */
const setupPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return sendError(res, 400, 'Email, OTP, and Password are required.');
    }

    const athletes = await queryData('registrations', 'email', email.trim());
    if (athletes.length === 0) return sendError(res, 404, 'Athlete not found.');

    const athlete = athletes[0];

    // 1. Check OTP
    if (!athlete.tempOtp || athlete.tempOtp !== otp) {
      return sendError(res, 400, 'Invalid OTP.');
    }

    // 2. Check Expiry
    if (Date.now() > athlete.otpExpiry) {
      return sendError(res, 400, 'OTP has expired.');
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Update Athlete
    await updateData('registrations', athlete.id, {
      password: hashedPassword,
      isPasswordSet: true,
      tempOtp: null,
      otpExpiry: null
    });

    sendSuccess(res, 200, 'Password setup successful. You can now login.');
  } catch (error) {
    next(error);
  }
};

/**
 * Athlete Login
 */
const loginAthlete = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    console.log(`[AUTH] Login attempt for: ${identifier} (Unlocked Flow)`);

    if (!identifier || !password) {
      return sendError(res, 400, 'Identifier and Password are required.');
    }

    // 1. Find athlete by Registration ID or Email
    let athlete = null;
    const cleanId = identifier.trim();

    // Check Reg ID
    const byRegNo = await queryData('registrations', 'registrationNumber', cleanId);
    if (byRegNo.length > 0) {
      athlete = byRegNo[0];
    } else {
      // Check Email
      const byEmail = await queryData('registrations', 'email', cleanId);
      if (byEmail.length > 0) athlete = byEmail[0];
    }

    if (!athlete) return sendError(res, 404, 'Invalid credentials.');

    // 3. Check if password is set
    if (!athlete.isPasswordSet) {
      return sendError(res, 400, 'Password not set. Please use OTP to setup your password first.');
    }

    // 4. Verify Password
    const isMatch = await bcrypt.compare(password, athlete.password);
    if (!isMatch) return sendError(res, 400, 'Invalid credentials.');

    // 5. Generate Token
    const token = jwt.sign(
      { id: athlete.id, registrationNumber: athlete.registrationNumber, role: 'athlete' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Response
    const athleteData = { ...athlete };
    delete athleteData.password;
    delete athleteData.tempOtp;
    delete athleteData.otpExpiry;

    sendSuccess(res, 200, 'Login successful', { token, athlete: athleteData });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current athlete profile (for status sync)
 */
const getAthleteProfile = async (req, res, next) => {
  try {
    const athleteId = req.user.id;
    const athlete = await getDataById('registrations', athleteId);

    if (!athlete) {
      return sendError(res, 404, 'Athlete record not found.');
    }

    const athleteData = { ...athlete };
    delete athleteData.password;
    delete athleteData.tempOtp;
    delete athleteData.otpExpiry;

    sendSuccess(res, 200, 'Profile retrieved', athleteData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestPasswordSetup,
  setupPassword,
  loginAthlete,
  getAthleteProfile
};
