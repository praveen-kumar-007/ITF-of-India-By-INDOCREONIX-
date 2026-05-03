const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn('\x1b[33m%s\x1b[0m', 'WARNING: RESEND_API_KEY is missing. Email service will run in MOCK mode.');
}

/**
 * Generic Send Email function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!resend) {
      console.log(`\x1b[36m%s\x1b[0m`, `[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      return { id: 'mock-id', message: 'Sent in mock mode' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: html
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error('Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Mail Service Error:', error);
    throw error;
  }
};

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password
 */
const sendOTPEmail = async (to, otp) => {
  const subject = 'ITF OF INDIA - Email Verification';
  const logoUrl = 'https://res.cloudinary.com/dgfpfxkpk/image/upload/q_auto/f_auto/v1777829890/logo_hdbywh.png';
  
  const html = `
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
          <h1 class="title">Email Verification</h1>
          <p>Welcome to the <strong>ITF OF INDIA Athlete Portal</strong>.</p>
          <p>Please use the following high-security verification code to complete your registration or login process. For security reasons, do not share this code with anyone.</p>
          
          <div class="otp-box">
            <h2 class="otp-code">${otp}</h2>
            <p style="font-size: 13px; color: #64748b; margin-top: 10px;">Valid for the next 10 minutes</p>
          </div>
          
          <p style="font-size: 14px; color: #475569;">If you did not request this code, your account security may be at risk. Please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ITF OF INDIA - National Multi-Sport Organization Trust</p>
          <p>This is an automated security notification. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Check Mail service health
 * @returns {Object}
 */
const checkMailHealth = () => {
  return {
    status: resend ? 'healthy' : 'warning',
    mode: resend ? 'production' : 'mock',
    message: resend ? 'Mail service is ready' : 'Mail service is running in MOCK mode (Check console for OTPs)'
  };
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  checkMailHealth
};
