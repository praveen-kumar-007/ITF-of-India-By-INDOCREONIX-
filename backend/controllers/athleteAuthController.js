const {
  queryData,
  updateData,
  getDataById,
} = require("../services/firebaseService");
const { sendPasswordSetupEmail } = require("../services/mailService");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const { logAudit } = require("../utils/logger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error(
    "CRITICAL ERROR: JWT_SECRET is not defined in environment variables.",
  );
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

const sanitizeAthlete = (athlete) => {
  const athleteData = { ...athlete };
  delete athleteData.password;
  delete athleteData.tempOtp;
  delete athleteData.otpExpiry;
  return athleteData;
};

const ensureAthleteApproved = async (athlete, context, ip) => {
  if (!athlete) {
    return {
      ok: false,
      status: 404,
      message: "No athlete record found for this account.",
    };
  }

  if (athlete.status === "deleted") {
    await logAudit("ATHLETE_LOGIN_BLOCKED", {
      context,
      reason: "account_deleted",
      ip,
    });
    return {
      ok: false,
      status: 403,
      message: "Access denied. Your account is in the recycle bin.",
    };
  }

  if (athlete.status === "rejected") {
    await logAudit("ATHLETE_LOGIN_BLOCKED", {
      context,
      reason: "account_rejected",
      ip,
    });
    return {
      ok: false,
      status: 403,
      message: "Your registration was rejected. Access is not permitted.",
    };
  }

  if (athlete.status === "pending") {
    await logAudit("ATHLETE_LOGIN_BLOCKED", {
      context,
      reason: "account_pending",
      ip,
    });
    return {
      ok: false,
      status: 403,
      message: "Your registration is pending verification.",
    };
  }

  if (athlete.status !== "approved") {
    await logAudit("ATHLETE_LOGIN_BLOCKED", {
      context,
      reason: "account_unverified",
      ip,
    });
    return {
      ok: false,
      status: 403,
      message: "Only verified athletes can access the portal.",
    };
  }

  if (athlete.isLocked) {
    await logAudit("ATHLETE_LOGIN_LOCKED", {
      context,
      reason: "too_many_failed_attempts",
      ip,
    });
    return {
      ok: false,
      status: 423,
      message:
        "Account locked due to 10+ failed attempts. Please reset your password via OTP to unlock.",
    };
  }

  return { ok: true };
};

/**
 * Request OTP for first-time password setup or Forgot Password
 */
const requestPasswordSetup = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) return sendError(res, 400, "Email address is required.");

    // 1. Find athlete by Email
    const emailLower = email.trim().toLowerCase();
    const athletes = await queryData("registrations", "email", emailLower);

    if (athletes.length === 0) {
      await logAudit("AUTH_PASSWORD_SETUP_REQUEST_FAILED", {
        email: emailLower,
        reason: "user_not_found",
        ip: req.ip,
      });
      return sendError(res, 404, "No account found with this email.");
    }

    const athlete = athletes[0];

    // Check if in Recycle Bin
    if (athlete.status === "deleted") {
      await logAudit("AUTH_PASSWORD_SETUP_REQUEST_BLOCKED", {
        email: athlete.email,
        reason: "account_deleted",
        ip: req.ip,
      });
      return sendError(
        res,
        403,
        "Account suspended or moved to trash. Please contact administrator.",
      );
    }

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 4. Store OTP in database
    await updateData("registrations", athlete.id, {
      tempOtp: otp,
      otpExpiry,
    });

    // 5. Send Email via Unified Mail Service (Resend)
    try {
      await sendPasswordSetupEmail(email, athlete.fullName, otp);
      await logAudit("AUTH_PASSWORD_SETUP_OTP_SENT", {
        id: athlete.id,
        email: athlete.email,
        ip: req.ip,
      });
    } catch (error) {
      console.error("Email Send Error:", error);
    }

    sendSuccess(res, 200, "OTP sent to your registered email.");
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
      return sendError(res, 400, "Email, OTP, and Password are required.");
    }

    const athletes = await queryData("registrations", "email", email.trim());
    if (athletes.length === 0) return sendError(res, 404, "Athlete not found.");

    const athlete = athletes[0];

    // 1. Check OTP
    if (!athlete.tempOtp || athlete.tempOtp !== otp) {
      return sendError(res, 400, "Invalid OTP.");
    }

    // 2. Check Expiry
    if (Date.now() > athlete.otpExpiry) {
      return sendError(res, 400, "OTP has expired.");
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Update Athlete
    await updateData("registrations", athlete.id, {
      password: hashedPassword,
      isPasswordSet: true,
      tempOtp: null,
      otpExpiry: null,
      lastPasswordUpdate: new Date().toISOString(),
      failedLoginAttempts: 0,
      isLocked: false, // 🚀 Unlock account after password reset
    });

    await logAudit("AUTH_PASSWORD_SETUP_SUCCESS", {
      id: athlete.id,
      email: athlete.email,
      ip: req.ip,
    });

    sendSuccess(res, 200, "Password setup successful. You can now login.");
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
      return sendError(res, 400, "Identifier and Password are required.");
    }

    // 1. Find athlete by Registration ID or Email
    let athlete = null;
    const cleanId = identifier.trim();

    // Check Reg ID
    const byRegNo = await queryData(
      "registrations",
      "registrationNumber",
      cleanId,
    );
    if (byRegNo.length > 0) {
      athlete = byRegNo[0];
    } else {
      // Check Email
      const byEmail = await queryData("registrations", "email", cleanId);
      if (byEmail.length > 0) athlete = byEmail[0];
    }

    if (!athlete) return sendError(res, 404, "Invalid credentials.");

    const statusCheck = await ensureAthleteApproved(
      athlete,
      `password_login:${cleanId}`,
      req.ip,
    );
    if (!statusCheck.ok) {
      return sendError(res, statusCheck.status, statusCheck.message);
    }

    // 3. Check if password is set
    if (!athlete.isPasswordSet) {
      return sendError(
        res,
        400,
        "Password not set. Please use OTP to setup your password first.",
      );
    }

    // 4. Verify Password
    const isMatch = await bcrypt.compare(password, athlete.password);
    if (!isMatch) {
      const newAttempts = (athlete.failedLoginAttempts || 0) + 1;
      const isLocked = newAttempts >= 10;

      await updateData("registrations", athlete.id, {
        failedLoginAttempts: newAttempts,
        isLocked: isLocked,
      });

      await logAudit("ATHLETE_LOGIN_FAILED", {
        identifier: cleanId,
        reason: "wrong_password",
        attempts: newAttempts,
        locked: isLocked,
        ip: req.ip,
      });

      if (isLocked) {
        return sendError(
          res,
          423,
          "Too many failed attempts. Your account has been locked for security. Please reset your password to unlock.",
        );
      }

      return sendError(
        res,
        400,
        `Invalid credentials. ${10 - newAttempts} attempts remaining.`,
      );
    }

    // 🚀 Successful Login: Reset failed attempts
    if (athlete.failedLoginAttempts > 0) {
      await updateData("registrations", athlete.id, { failedLoginAttempts: 0 });
    }

    // 5. Generate Token
    const token = jwt.sign(
      {
        id: athlete.id,
        registrationNumber: athlete.registrationNumber,
        role: "athlete",
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 6. Response
    await logAudit("ATHLETE_LOGIN_SUCCESS", {
      id: athlete.id,
      registrationNumber: athlete.registrationNumber,
      ip: req.ip,
    });

    sendSuccess(res, 200, "Login successful", {
      token,
      athlete: sanitizeAthlete(athlete),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Athlete Google OAuth Login
 */
const loginAthleteWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return sendError(res, 400, "Google token is required.");
    }

    if (!googleClient) {
      return sendError(
        res,
        500,
        "Google login is not configured on the server.",
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return sendError(res, 401, "Google account email is not verified.");
    }

    const emailLower = payload.email.toLowerCase();
    const athletes = await queryData("registrations", "email", emailLower);
    const athlete = athletes[0];

    const statusCheck = await ensureAthleteApproved(
      athlete,
      `google_login:${emailLower}`,
      req.ip,
    );
    if (!statusCheck.ok) {
      return sendError(res, statusCheck.status, statusCheck.message);
    }

    const token = jwt.sign(
      {
        id: athlete.id,
        registrationNumber: athlete.registrationNumber,
        role: "athlete",
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    await logAudit("ATHLETE_GOOGLE_LOGIN_SUCCESS", {
      id: athlete.id,
      email: athlete.email,
      ip: req.ip,
    });

    sendSuccess(res, 200, "Login successful", {
      token,
      athlete: sanitizeAthlete(athlete),
    });
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
    const athlete = await getDataById("registrations", athleteId);

    if (!athlete) {
      return sendError(res, 404, "Athlete record not found.");
    }

    const athleteData = { ...athlete };
    delete athleteData.password;
    delete athleteData.tempOtp;
    delete athleteData.otpExpiry;

    sendSuccess(res, 200, "Profile retrieved", athleteData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestPasswordSetup,
  setupPassword,
  loginAthlete,
  loginAthleteWithGoogle,
  getAthleteProfile,
};
