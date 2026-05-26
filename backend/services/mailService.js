const { Resend } = require("resend");
const { isServiceEnabled } = require("../utils/systemControl");
const dotenv = require("dotenv");

dotenv.config();

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

if (!resend) {
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "WARNING: RESEND_API_KEY is missing. Email service will run in MOCK mode.",
  );
}

/**
 * Generic Send Email function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Check if mail service is enabled in system control
    const enabled = await isServiceEnabled("mail_enabled");
    if (!enabled) {
      console.warn(
        `\x1b[33m%s\x1b[0m`,
        `[SYSTEM CONTROL] Mail service is DISABLED. Email to ${to} blocked.`,
      );
      return {
        id: "disabled-id",
        message: "Mail service disabled by administrator",
      };
    }

    if (!resend) {
      throw new Error(
        "Mail Service Unconfigured: RESEND_API_KEY is missing. Transactional emails cannot be sent.",
      );
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "ITF OF INDIA <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
      text: html.replace(/<[^>]*>?/gm, "").trim(), // Basic text version extraction
      reply_to: "support@itfindia.com",
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Mail Service Error:", error);
    throw error;
  }
};

/**
 * Email Styles Template
 */
const getEmailStyles = () => `
  <style>
    /* Reset styles for better client compatibility */
    html, body { width: 100% !important; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 16px 12px !important;
      width: 100% !important;
      background: #e2e8f0;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
    }
    *, *::before, *::after { box-sizing: border-box; }

    .email-container {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      padding: 50px 20px;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24);
    }
    .logo {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 4px solid #ffffff;
      padding: 4px;
      background: white;
      box-shadow: 0 0 25px rgba(251, 191, 36, 0.4);
    }
    .content {
      padding: 45px 40px;
      color: #1e293b;
      line-height: 1.7;
    }
    .content p {
      margin: 0 0 14px;
      font-size: 15px;
      color: #334155;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 20px;
      text-align: center;
      letter-spacing: -0.5px;
    }
    .status-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 25px;
      letter-spacing: 1px;
    }
    .status-pending { 
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
      color: #92400e; 
      border: 1px solid #fcd34d;
    }
    .status-approved { 
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); 
      color: #166534; 
      border: 1px solid #86efac;
    }
    .status-rejected { 
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); 
      color: #991b1b; 
      border: 1px solid #fca5a5;
    }
    
    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 30px 0;
      background: #f8fafc;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      table-layout: fixed;
    }
    .data-table td {
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 15px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .data-table tr:last-child td { border-bottom: none; }
    .data-label { color: #64748b; font-weight: 600; width: 35%; }
    .data-value { color: #0f172a; font-weight: 700; width: 65%; }
    
    .otp-display {
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

    .action-button {
      display: inline-block;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: #0f172a !important;
      padding: 16px 35px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 800;
      margin: 30px 0;
      text-align: center;
      box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4);
      transition: transform 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 14px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 35px 24px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 0 0 8px;
      line-height: 1.55;
    }
    .footer p:last-child {
      margin-bottom: 0;
    }
    .org-name {
      color: #fbbf24;
      font-weight: 800;
      letter-spacing: 2px;
      margin-top: 15px;
      display: block;
      font-size: 18px;
    }

    /* Large tablet styles */
    @media only screen and (max-width: 768px) {
      body {
        padding: 12px 10px !important;
      }
      .email-container {
        max-width: 100% !important;
      }
      .content {
        padding: 36px 26px !important;
      }
      .header {
        padding: 38px 18px !important;
      }
    }

    /* Tablet Styles */
    @media only screen and (max-width: 620px) {
      body {
        padding: 10px 8px !important;
      }
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        border-radius: 16px !important;
      }
      .content {
        padding: 30px 20px !important;
      }
      .title {
        font-size: 23px !important;
      }
    }

    /* Mobile Styles */
    @media only screen and (max-width: 480px) {
      body {
        padding: 0 !important;
        background: #ffffff !important;
      }
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        border-bottom: none !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      .content {
        padding: 24px 16px !important;
      }
      .title {
        font-size: 20px !important;
        margin-bottom: 14px !important;
      }
      .otp-code {
        font-size: 32px !important;
        letter-spacing: 6px !important;
      }
      .otp-display {
        padding: 15px !important;
        margin: 20px 0 !important;
      }
      .data-table {
        border-radius: 12px !important;
        margin: 18px 0 !important;
      }
      .data-table,
      .data-table tbody,
      .data-table tr,
      .data-table td {
        display: block !important;
        width: 100% !important;
      }
      .data-table tr {
        border-bottom: 1px solid #e2e8f0 !important;
      }
      .data-table tr:last-child {
        border-bottom: none !important;
      }
      .data-table td {
        padding: 10px 12px !important;
        font-size: 13px !important;
        border-bottom: none !important;
      }
      .data-label {
        width: 100% !important;
        font-size: 11px !important;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 2px;
      }
      .data-value {
        width: 100% !important;
        font-size: 14px !important;
      }
      .header {
        padding: 24px 16px !important;
      }
      .logo {
        width: 64px !important;
        height: 64px !important;
      }
      .action-button {
        padding: 12px 16px !important;
        font-size: 12px !important;
        display: block !important;
        width: 100% !important;
        margin: 16px 0 !important;
        border-radius: 10px !important;
      }
      .status-badge {
        padding: 8px 12px !important;
        font-size: 11px !important;
        letter-spacing: 0.06em !important;
      }
      .footer {
        padding: 20px 16px !important;
        font-size: 12px !important;
      }
    }

    /* Small Mobile Styles */
    @media only screen and (max-width: 360px) {
      .otp-code {
        font-size: 24px !important;
        letter-spacing: 3px !important;
      }
      .content {
        padding: 20px 12px !important;
      }
      .title {
        font-size: 18px !important;
      }
      .data-table td {
        font-size: 12px !important;
      }
    }
  </style>
`;

const LOGO_URL =
  "https://res.cloudinary.com/dgfpfxkpk/image/upload/q_auto/f_auto/v1777829890/logo_hdbywh.png";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Send OTP Email
 */
const sendOTPEmail = async (to, otp) => {
  const subject = `Verification Code: ${otp} | ITF OF INDIA`;
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
          <h1 class="title">Verification Code</h1>
          <p>Please use the following verification code to complete your request. This code is required to verify your identity for official records.</p>
          
          <div class="otp-display">
            <h2 class="otp-code">${otp}</h2>
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
const sendPendingEmail = async (to, name, regNo, data = {}) => {
  const subject = `Registration Received: ${name} (ID: ${regNo}) | ITF OF INDIA`;
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
          <div style="text-align: center;"><span class="status-badge status-pending">Verification in Progress</span></div>
          <h1 class="title">Registration Received!</h1>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for choosing the <strong>ITF OF INDIA</strong>. Your official registration has been successfully received and is now under technical review.</p>
          
          <table class="data-table">
            <tr><td class="data-label">Athlete Name:</td><td class="data-value">${name}</td></tr>
            <tr><td class="data-label">Reference ID:</td><td class="data-value">${regNo}</td></tr>
            ${data.sportsDiscipline ? `<tr><td class="data-label">Discipline:</td><td class="data-value">${data.sportsDiscipline}</td></tr>` : ""}
            ${data.district ? `<tr><td class="data-label">District/State:</td><td class="data-value">${data.district}, ${data.state}</td></tr>` : ""}
            <tr><td class="data-label">Status:</td><td class="data-value">Technical Verification</td></tr>
          </table>

          <div style="background: #eff6ff; border-radius: 8px; padding: 15px; border: 1px solid #dbeafe; color: #1e40af; font-size: 14px;">
            <strong>Note:</strong> Our board will verify your Aadhar card and payment proof. This typically takes <strong>24 to 48 hours</strong>.
          </div>
        </div>
        <div class="footer">
          <p>ITF OF INDIA - National Multi-Sport Organization Trust</p>
          <p>Indra the Fighter of India</p>
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
const sendApprovalEmail = async (to, name, regNo, data = {}) => {
  const subject = `Application Approved: ${name} (ID: ${regNo}) | ITF OF INDIA`;
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
          <div style="text-align: center;"><span class="status-badge status-approved">Officially Verified</span></div>
          <h1 class="title" style="color: #16a34a;">Congratulations ${name}!</h1>
          <p>We are proud to inform you that your application for the <strong>ITF OF INDIA</strong> has been officially <strong>Approved</strong>.</p>
          
          <table class="data-table">
            <tr><td class="data-label">Registration ID:</td><td class="data-value">${regNo}</td></tr>
            <tr><td class="data-label">Athlete Name:</td><td class="data-value">${name}</td></tr>
            ${data.sportsDiscipline ? `<tr><td class="data-label">Sport/Discipline:</td><td class="data-value">${data.sportsDiscipline}</td></tr>` : ""}
            <tr><td class="data-label">Membership:</td><td class="data-value">Lifetime Athlete Access</td></tr>
          </table>

          <h3 style="color: #0f172a; margin-top: 30px; border-bottom: 2px solid #fbbf24; display: inline-block;">Complete Your Registration</h3>
          <p>To finalize your membership and access your official athlete profile, please complete your security setup using the button below:</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/setup-password?email=${to}" class="action-button" style="background: #fbbf24; box-shadow: 0 4px 14px rgba(251, 191, 36, 0.4);">Complete Security Setup →</a>
          </div>

          <p style="font-size: 13px; color: #64748b; background: #f8fafc; padding: 10px; border-radius: 6px;">
            <strong>Registration ID:</strong> ${regNo}<br>
            Please use this ID along with your password to login after setup.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ITF OF INDIA - National Multi-Sport Organization Trust</p>
          <p>Indra the Fighter of India</p>
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
const sendRejectionEmail = async (
  to,
  name,
  reason = "Documentation criteria not met",
) => {
  const subject = `Registration Update: ${name} | ITF OF INDIA`;
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
          <div style="text-align: center;"><span class="status-badge status-rejected">Review Completed</span></div>
          <h1 class="title">Registration Update</h1>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for your application to the <strong>ITF OF INDIA</strong>. After a thorough review of your submitted documents, we regret to inform you that your application could not be approved at this stage.</p>
          
          <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-weight: 700; color: #9f1239; text-transform: uppercase; font-size: 12px;">Reason for Rejection:</p>
            <p style="margin: 8px 0 0; color: #be123c; font-size: 15px; line-height: 1.5;">${reason}</p>
          </div>

          <p style="color: #64748b; font-size: 14px;">Common reasons include blurred document photos, incorrect payment screenshots, or mismatched Aadhar details. You are welcome to re-apply with corrected information.</p>
        </div>
        <div class="footer">
          <p>ITF OF INDIA - National Multi-Sport Organization Trust</p>
          <p>Indra the Fighter of India</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Send Contact Confirmation Email
 */
const sendContactConfirmation = async (to, name, messageSnippet) => {
  const subject = `ITF OF INDIA - We've received your message, ${name}`;
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
          <div style="text-align: center;"><span class="status-badge status-approved">Message Received</span></div>
          <h1 class="title">Thank You for Reaching Out!</h1>
          <p>Hello <strong>${name}</strong>,</p>
          <p>We've successfully received your enquiry via the <strong>ITF OF INDIA</strong> official website. Our administrative team is reviewing your message and will respond as soon as possible.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 11px;">Your Message Preview:</p>
            <p style="margin: 8px 0 0; color: #334155; font-size: 14px; font-style: italic;">"${messageSnippet.length > 150 ? messageSnippet.substring(0, 150) + "..." : messageSnippet}"</p>
          </div>

          <p style="color: #64748b; font-size: 14px;">If your enquiry is time-sensitive, please feel free to contact us directly via the details provided on our website.</p>
        </div>
        <div class="footer">
          <p>ITF OF INDIA - National Multi-Sport Organization Trust</p>
          <p>Indra the Fighter of India</p>
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
    status: resend ? "healthy" : "warning",
    mode: resend ? "production" : "unconfigured",
    message: resend
      ? "Mail service is ready"
      : "Mail service is unconfigured (RESEND_API_KEY is missing)",
  };
};

/**
 * Send Password Setup/Reset OTP Email
 */
const sendPasswordSetupEmail = async (to, name, otp) => {
  const subject = `Verification Code: ${otp} | ITF OF INDIA`;
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
          <h1 class="title">Access Verification</h1>
          <p>Hello <strong>${name}</strong>,</p>
          <p>You have requested a verification code to access the official <strong>ITF OF INDIA Athlete Portal</strong>.</p>
          
          <div class="otp-display">
            <h2 class="otp-code">${otp}</h2>
            <p style="font-size: 13px; color: #64748b; margin-top: 10px;">Valid for 10 minutes</p>
          </div>
          
          <p style="font-size: 14px; color: #475569;">Use this code to securely setup or reset your portal credentials. If you did not initiate this request, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ITF OF INDIA - National Multi-Sport Organization Trust</p>
          <p>This is an automated security notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(to, subject, html);
};

/**
 * Send Donation Under Verification Email
 */
const sendDonationUnderVerificationEmail = async (to, donation = {}) => {
  const donorName = escapeHtml(donation.name || "Donor");
  const donationId = escapeHtml(donation.id || "-");
  const amount = escapeHtml(donation.amount || "-");
  const paymentMethod = escapeHtml(donation.paymentMethod || "UPI");

  const subject = `Donation Received: ${donorName} (ID: ${donationId}) | ITF OF INDIA`;
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
          <div style="text-align: center;"><span class="status-badge status-pending">Under Verification</span></div>
          <h1 class="title">Thank You for Your Donation</h1>
          <p>Hello <strong>${donorName}</strong>,</p>
          <p>We have received your donation payment details. Your contribution is currently under verification by our finance team.</p>

          <table class="data-table">
            <tr><td class="data-label">Donation ID:</td><td class="data-value">${donationId}</td></tr>
            <tr><td class="data-label">Amount:</td><td class="data-value">Rs. ${amount}</td></tr>
            <tr><td class="data-label">Payment Method:</td><td class="data-value">${paymentMethod}</td></tr>
            <tr><td class="data-label">Status:</td><td class="data-value">Under Verification</td></tr>
          </table>

          <p style="color:#475569; font-size:14px;">Verification generally takes 24 to 48 hours. You will receive another email once review is completed.</p>
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
 * Send Donation Approved Email
 */
const sendDonationApprovedEmail = async (to, donation = {}) => {
  const donorName = escapeHtml(donation.name || "Donor");
  const donationId = escapeHtml(donation.id || "-");
  const amount = escapeHtml(donation.amount || "-");
  const reviewedAt = donation.reviewedAt
    ? new Date(donation.reviewedAt).toLocaleString()
    : "-";

  const subject = `Donation Approved: ${donationId} | ITF OF INDIA`;
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
          <div style="text-align: center;"><span class="status-badge status-approved">Approved</span></div>
          <h1 class="title" style="color:#166534;">Donation Verified Successfully</h1>
          <p>Hello <strong>${donorName}</strong>,</p>
          <p>Thank you for supporting ITF OF INDIA. Your donation has been verified and approved.</p>

          <table class="data-table">
            <tr><td class="data-label">Donation ID:</td><td class="data-value">${donationId}</td></tr>
            <tr><td class="data-label">Amount:</td><td class="data-value">Rs. ${amount}</td></tr>
            <tr><td class="data-label">Status:</td><td class="data-value">Approved</td></tr>
            <tr><td class="data-label">Verified On:</td><td class="data-value">${escapeHtml(reviewedAt)}</td></tr>
          </table>
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
 * Send Donation Rejected Email
 */
const sendDonationRejectedEmail = async (to, donation = {}, reason = "") => {
  const donorName = escapeHtml(donation.name || "Donor");
  const donationId = escapeHtml(donation.id || "-");
  const amount = escapeHtml(donation.amount || "-");
  const safeReason = escapeHtml(reason || "Verification criteria not met");

  const subject = `Donation Review Update: ${donationId} | ITF OF INDIA`;
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
          <div style="text-align: center;"><span class="status-badge status-rejected">Rejected</span></div>
          <h1 class="title">Donation Verification Update</h1>
          <p>Hello <strong>${donorName}</strong>,</p>
          <p>We reviewed your submitted donation payment details, but we could not verify this transaction at this time.</p>

          <table class="data-table">
            <tr><td class="data-label">Donation ID:</td><td class="data-value">${donationId}</td></tr>
            <tr><td class="data-label">Amount:</td><td class="data-value">Rs. ${amount}</td></tr>
            <tr><td class="data-label">Status:</td><td class="data-value">Rejected</td></tr>
          </table>

          <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-weight: 700; color: #9f1239; text-transform: uppercase; font-size: 12px;">Reason from Admin:</p>
            <p style="margin: 8px 0 0; color: #be123c; font-size: 15px; line-height: 1.5;">${safeReason}</p>
          </div>

          <p style="color:#475569; font-size:14px;">You may submit donation details again with correct payment information.</p>
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

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendPendingEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendContactConfirmation,
  sendPasswordSetupEmail,
  sendDonationUnderVerificationEmail,
  sendDonationApprovedEmail,
  sendDonationRejectedEmail,
  checkMailHealth,
};
