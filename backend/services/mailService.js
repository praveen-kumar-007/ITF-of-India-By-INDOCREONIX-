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
 * Email Styles Template
 */
const getEmailStyles = () => `
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
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 99px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      background: #f8fafc;
      border-radius: 12px;
      overflow: hidden;
    }
    .data-table td {
      padding: 12px 15px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    .data-label { color: #64748b; font-weight: 600; width: 40%; }
    .data-value { color: #1e293b; font-weight: 500; }
    
    .action-button {
      display: inline-block;
      background: #fbbf24;
      color: #0f172a;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      margin: 25px 0;
      text-align: center;
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
`;

const LOGO_URL = 'https://res.cloudinary.com/dgfpfxkpk/image/upload/q_auto/f_auto/v1777829890/logo_hdbywh.png';

/**
 * Send OTP Email
 */
const sendOTPEmail = async (to, otp) => {
  const subject = 'ITF OF INDIA - Email Verification';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${getEmailStyles()}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="${LOGO_URL}" alt="ITF Logo" class="logo">
          <span class="org-name">ITF OF INDIA</span>
        </div>
        <div class="content">
          <h1 class="title">Security Verification</h1>
          <p>Please use the following high-security verification code to complete your action. This code ensures the safety of your official records.</p>
          
          <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 25px; margin: 32px 0; text-align: center;">
            <h2 style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #b45309; margin: 0;">${otp}</h2>
            <p style="font-size: 13px; color: #64748b; margin-top: 10px;">Valid for 10 minutes</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ITF OF INDIA - National Multi-Sport Organization Trust</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Send Registration Pending Email
 */
const sendPendingEmail = async (to, name, regNo) => {
  const subject = 'Application Received - ITF OF INDIA Registration';
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${getEmailStyles()}</head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="${LOGO_URL}" alt="ITF Logo" class="logo">
          <span class="org-name">ITF OF INDIA</span>
        </div>
        <div class="content">
          <div style="text-align: center;"><span class="status-badge status-pending">Verification Pending</span></div>
          <h1 class="title">Application Received</h1>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your official registration for the <strong>ITF OF INDIA</strong> has been successfully received. Our administrative board is currently reviewing your documents.</p>
          
          <table class="data-table">
            <tr><td class="data-label">Reference ID:</td><td class="data-value">${regNo}</td></tr>
            <tr><td class="data-label">Current Status:</td><td class="data-value">Awaiting Official Review</td></tr>
          </table>

          <p>Please allow <strong>24-48 hours</strong> for the verification process to complete. You will receive another email once your application is approved.</p>
        </div>
        <div class="footer">
          <p>ITF of India - National Multi-Sport Organization Trust</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Send Approval Email
 */
const sendApprovalEmail = async (to, name, regNo) => {
  const subject = 'Application Approved - Welcome to ITF OF INDIA';
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${getEmailStyles()}</head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="${LOGO_URL}" alt="ITF Logo" class="logo">
          <span class="org-name">ITF OF INDIA</span>
        </div>
        <div class="content">
          <div style="text-align: center;"><span class="status-badge status-approved">Officially Approved</span></div>
          <h1 class="title">Welcome to the Organization</h1>
          <p>Dear <strong>${name}</strong>,</p>
          <p>Congratulations! Your athlete registration with the <strong>ITF OF INDIA</strong> has been officially <strong>Approved</strong>.</p>
          
          <table class="data-table">
            <tr><td class="data-label">Registration No:</td><td class="data-value">${regNo}</td></tr>
            <tr><td class="data-label">Member Status:</td><td class="data-value">Active Member</td></tr>
          </table>

          <h3 style="color: #0f172a; margin-top: 30px;">Next Steps: Set Your Password</h3>
          <p>To access your official athlete profile and download your E-Card, you must set your portal password using the link below:</p>
          
          <div style="text-align: center;">
            <a href="https://itf-of-india.vercel.app/setup-password?email=${to}" class="action-button">Set Portal Password →</a>
          </div>

          <p style="font-size: 14px; color: #64748b;">Alternatively, visit the Athlete Login page and use the "Setup Password" option.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ITF OF INDIA - National Multi-Sport Organization Trust</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Send Rejection Email
 */
const sendRejectionEmail = async (to, name, reason = "Documentation criteria not met") => {
  const subject = 'Application Update - ITF OF INDIA Registration';
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${getEmailStyles()}</head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="${LOGO_URL}" alt="ITF Logo" class="logo">
          <span class="org-name">ITF OF INDIA</span>
        </div>
        <div class="content">
          <div style="text-align: center;"><span class="status-badge status-rejected">Application Rejected</span></div>
          <h1 class="title">Registration Update</h1>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for your interest in the <strong>ITF OF INDIA</strong>. After reviewing your submission, our board has decided not to move forward with your application at this time.</p>
          
          <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: 600; color: #9f1239;">Reason for Rejection:</p>
            <p style="margin: 5px 0 0; color: #be123c;">${reason}</p>
          </div>

          <p>If you believe this is a mistake or would like to re-apply with corrected documents, please visit our website or contact our regional support center.</p>
        </div>
        <div class="footer">
          <p>ITF of India - National Multi-Sport Organization Trust</p>
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
  sendPendingEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  checkMailHealth
};
