const { queryData, updateData, getDataById } = require('../services/firebaseService');
const { sendEmail } = require('../services/mailService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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


    // 5. Send Email via Unified Mail Service (Resend)
    const subject = "Athlete Portal Verification Code";
    const logoUrl = 'https://res.cloudinary.com/dgfpfxkpk/image/upload/q_auto/f_auto/v1777829890/logo_hdbywh.png';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .email-container {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid #fbbf24;
            padding: 5px;
            background: white;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
          }
          .content {
            padding: 40px 35px;
            color: #1e293b;
            line-height: 1.6;
          }
          .title {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 16px;
            text-align: center;
          }
          .otp-box {
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin: 32px 0;
            text-align: center;
          }
          .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #b45309;
            margin: 0;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .org-name {
            color: #fbbf24;
            font-weight: 700;
            letter-spacing: 1px;
            margin-top: 10px;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="${logoUrl}" alt="ITF Logo" class="logo">
            <span class="org-name">ITF OF INDIA</span>
          </div>
          <div class="content">
            <h1 class="title">Access Verification</h1>
            <p>Hello <strong>${athlete.fullName}</strong>,</p>
            <p>You have requested a verification code to access the official <strong>ITF OF INDIA Athlete Portal</strong>.</p>
            
            <div class="otp-box">
              <h2 class="otp-code">${otp}</h2>
              <p style="font-size: 13px; color: #64748b; margin-top: 10px;">Valid for the next 10 minutes</p>
            </div>
            
            <p style="font-size: 14px; color: #475569;">Use this code to securely setup or reset your portal credentials. If you did not initiate this request, please contact our administrative department immediately.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ITF OF INDIA - National Multi-Sport Organization Trust</p>
            <p>This is an automated security notification. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail(email, subject, htmlContent);
      console.log('OTP Email sent successfully via Resend');
    } catch (error) {
      console.error('Email Send Error:', error);
    }

    sendSuccess(res, 200, 'OTP sent to your registered email.');
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
