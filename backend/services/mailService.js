const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn('\x1b[33m%s\x1b[0m', 'WARNING: RESEND_API_KEY is missing. Email service will run in MOCK mode.');
}

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password
 */
const sendOTPEmail = async (to, otp) => {
  try {
    if (!resend) {
      console.log(`\x1b[36m%s\x1b[0m`, `[MOCK EMAIL] To: ${to} | Subject: ITF OF INDIA Verification | OTP: ${otp}`);
      return { id: 'mock-id', message: 'Sent in mock mode' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: 'ITF OF INDIA - Email Verification',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #000; padding: 20px; text-align: center;">
            <h1 style="color: #FFD700; margin: 0; font-size: 24px; letter-spacing: 2px;">ITF OF INDIA</h1>
            <p style="color: #fff; margin: 5px 0 0; font-size: 14px; text-transform: uppercase;">National Sports Trust</p>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #555; line-height: 1.6;">Welcome to the official ITF OF INDIA Athlete Portal. To complete your registration, please use the verification code below:</p>
            
            <div style="background: #f9f9f9; border: 2px dashed #FFD700; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
            </div>
            
            <p style="color: #555; font-size: 14px; margin-bottom: 30px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888;">
              <p>This is an automated message from ITF OF INDIA. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error('Failed to send OTP email');
    }

    return data;
  } catch (error) {
    console.error('Mail Service Error:', error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail
};
