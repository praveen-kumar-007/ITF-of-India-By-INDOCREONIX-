const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  saveData,
  queryData,
  getDataById,
  getAllData,
  deleteData,
  updateData,
  checkFirebaseHealth,
} = require("../services/firebaseService");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  checkCloudinaryHealth,
} = require("../services/cloudinaryService");
const { checkMailHealth } = require("../services/mailService");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const { logAudit } = require("../utils/logger");
const { getPublicIdFromUrl } = require("../utils/cloudinaryUtils");
const { getCache, setCache } = require("../utils/cache");
const redis = require("../config/redis");
const os = require("os");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

const sanitizeAdmin = (admin) => {
  const adminData = { ...admin };
  delete adminData.password;
  delete adminData.resetOtp;
  delete adminData.resetOtpExpiry;
  return adminData;
};

/**
 * Admin Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for admins in Firebase
    const admins = await queryData("admins", "email", email);
    const admin = admins[0];

    if (!admin) {
      await logAudit("LOGIN_FAILED", {
        email,
        reason: "user_not_found",
        ip: req.ip,
      });
      return sendError(res, 401, "Invalid credentials");
    }

    // Check if admin is verified/active
    if (admin.status !== "active") {
      const reason =
        admin.status === "locked" ? "account_locked" : "account_inactive";
      const message =
        admin.status === "locked"
          ? 'Account locked due to 10+ failed attempts. Please use the "Forgot Password" flow to unlock.'
          : "Your account is not active. Please contact Super Admin.";

      await logAudit("LOGIN_BLOCKED", { email, reason, ip: req.ip });
      return sendError(res, 403, message);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      const newAttempts = (admin.failedAttempts || 0) + 1;
      const shouldLock = newAttempts >= 10;

      const updateFields = { failedAttempts: newAttempts };
      if (shouldLock) updateFields.status = "locked";

      await updateData("admins", admin.id, updateFields);

      await logAudit("LOGIN_FAILED", {
        email,
        reason: "wrong_password",
        attempts: newAttempts,
        isLocked: shouldLock,
        ip: req.ip,
      });

      if (shouldLock) {
        return sendError(
          res,
          403,
          "Too many failed attempts. Your account has been locked. Please reset your password to unlock.",
        );
      }

      return sendError(
        res,
        401,
        `Invalid credentials. ${10 - newAttempts} attempts remaining.`,
      );
    }

    // 🚀 Successful Login: Reset failed attempts
    if (admin.failedAttempts > 0) {
      await updateData("admins", admin.id, { failedAttempts: 0 });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role || "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    await logAudit("LOGIN_SUCCESS", {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      ip: req.ip,
    });

    sendSuccess(res, 200, "Login successful", {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role || "admin",
        fullName: admin.fullName,
        photo: admin.photo || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Google OAuth Login
 */
const loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return sendError(res, 400, "Google token is required");
    }

    if (!googleClient) {
      return sendError(
        res,
        500,
        "Google login is not configured on the server",
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return sendError(res, 401, "Google account email is not verified");
    }

    const email = payload.email.toLowerCase();
    const admins = await queryData("admins", "email", email);
    const admin = admins[0];

    if (!admin) {
      await logAudit("LOGIN_FAILED", {
        email,
        reason: "user_not_found",
        ip: req.ip,
      });
      return sendError(res, 401, "Invalid credentials");
    }

    if (admin.status !== "active") {
      const reason =
        admin.status === "locked" ? "account_locked" : "account_inactive";
      const message =
        admin.status === "locked"
          ? 'Account locked due to 10+ failed attempts. Please use the "Forgot Password" flow to unlock.'
          : "Your account is not active. Please contact Super Admin.";

      await logAudit("LOGIN_BLOCKED", { email, reason, ip: req.ip });
      return sendError(res, 403, message);
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role || "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    await logAudit("LOGIN_SUCCESS", {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      ip: req.ip,
    });

    sendSuccess(res, 200, "Login successful", {
      token,
      user: sanitizeAdmin(admin),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new admin (Super Admin only)
 */
const createAdmin = async (req, res, next) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Check if admin already exists
    const existing = await queryData("admins", "email", email);
    if (existing.length > 0) {
      return sendError(res, 400, "Admin with this email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminData = {
      email,
      password: hashedPassword,
      fullName,
      status: "active", // Can be 'pending' if you want a verification flow
      role: role || "admin",
      createdAt: new Date().toISOString(),
    };

    const id = await saveData("admins", adminData);

    await logAudit("ADMIN_CREATED", {
      id,
      email: adminData.email,
      role: adminData.role,
      createdBy: req.user.email,
      ip: req.ip,
    });

    sendSuccess(res, 201, "Admin created successfully", { id });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all admins (Super Admin only)
 */
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await getAllData("admins");
    // Remove passwords from response
    const safeAdmins = admins.map(({ password, ...admin }) => admin);
    sendSuccess(res, 200, "Admins retrieved successfully", safeAdmins);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an admin (Super Admin only)
 */
const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get admin to find photo URL
    const admin = await getDataById("admins", id);
    const publicId = getPublicIdFromUrl(admin?.photo);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    await deleteData("admins", id);

    await logAudit("ADMIN_DELETED", {
      targetId: id,
      targetEmail: admin?.email,
      deletedBy: req.user.email,
      ip: req.ip,
    });

    sendSuccess(res, 200, "Admin deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Update Admin Profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, email, password } = req.body;
    const file = req.file;

    const admin = await getDataById("admins", id);
    if (!admin) {
      return sendError(res, 404, "Admin not found");
    }

    const updateFields = { fullName, email };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    if (file) {
      // Delete old photo if exists
      const oldPublicId = getPublicIdFromUrl(admin.photo);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }

      // Upload new photo
      const result = await uploadToCloudinary(
        file.buffer,
        "admins",
        `admin_${id}_${Date.now()}`,
      );
      updateFields.photo = result.secure_url;
    }

    await updateData("admins", id, updateFields);

    await logAudit("ADMIN_PROFILE_UPDATED", {
      id,
      updatedBy: req.user.email,
      fields: Object.keys(updateFields).filter((f) => f !== "password"),
      ip: req.ip,
    });

    sendSuccess(res, 200, "Profile updated successfully", {
      photo: updateFields.photo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Admin (Manage other admins)
 */
const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, password, status } = req.body;

    const admin = await getDataById("admins", id);
    if (!admin) {
      return sendError(res, 404, "Admin not found");
    }

    const updateFields = { fullName, email, role, status };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    await updateData("admins", id, updateFields);

    await logAudit("ADMIN_MANAGED_UPDATE", {
      targetId: id,
      targetEmail: admin.email,
      managedBy: req.user.email,
      fields: Object.keys(updateFields).filter((f) => f !== "password"),
      ip: req.ip,
    });

    sendSuccess(res, 200, "Admin updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get System Health (Super Admin Only)
 */
const getSystemHealth = async (req, res, next) => {
  try {
    // 🚀 Check cache first (Bypass if refresh=true is passed)
    const forceRefresh = req.query.refresh === "true";

    if (!forceRefresh) {
      const cachedData = await getCache("system_health");
      if (cachedData) {
        return sendSuccess(
          res,
          200,
          "System health retrieved from cache",
          cachedData,
        );
      }
    }

    const firebase = await checkFirebaseHealth();
    const cloudinary = await checkCloudinaryHealth();
    const mail = checkMailHealth();

    // 🚀 Redis Health & Usage Check
    const checkRedisHealth = async () => {
      if (!redis || redis.status !== "ready") {
        return {
          status: "warning",
          mode: "in-memory",
          message: "Redis not connected. Using local fallback.",
          memory_used: "0 B",
        };
      }
      try {
        const info = await redis.info("memory");
        const usedMemory =
          info.match(/used_memory_human:(.*)/)?.[1] || "Unknown";
        const peakMemory =
          info.match(/used_memory_peak_human:(.*)/)?.[1] || "Unknown";
        return {
          status: "healthy",
          mode: "redis-cloud",
          message: "Mediation layer active",
          memory_used: usedMemory,
          memory_peak: peakMemory,
        };
      } catch (err) {
        return { status: "unhealthy", message: "Redis check failed" };
      }
    };

    const redisHealth = await checkRedisHealth();

    // Integrity Checks: Verify if key collections are readable and active
    const checkIntegrity = async (path, filterFn = null) => {
      try {
        const data = await getAllData(path);
        const filteredData = filterFn ? data.filter(filterFn) : data;
        return {
          status: "healthy",
          count: filteredData.length,
          message: "System Link Operational",
        };
      } catch (error) {
        return {
          status: "unhealthy",
          count: 0,
          message: "Integrity Breach or Collection Missing",
        };
      }
    };

    const galleryIntegrity = await checkIntegrity("gallery");
    const newsIntegrity = await checkIntegrity(
      "news",
      (item) =>
        item.category !== "Notice" &&
        item.category !== "Announcement",
    );
    const noticeIntegrity = await checkIntegrity(
      "news",
      (item) => item.category === "Notice" || item.category === "Announcement",
    );
    const contactIntegrity = await checkIntegrity("contacts");

    // Get basic stats
    const adminCount = (await getAllData("admins")).length;
    const athleteCount = (await getAllData("registrations")).length;
    const trashCount = (await getAllData("recycle_bin")).length;

    // Check environment variables (masking values)
    const envStatus = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      FIREBASE_DATABASE_URL: !!process.env.FIREBASE_DATABASE_URL,
      CLOUDINARY_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_KEY: !!process.env.CLOUDINARY_API_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      NODE_ENV: process.env.NODE_ENV || "development",
    };

    const healthData = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: os.platform(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        percentageUsed: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
        node_rss: process.memoryUsage().rss,
      },
      stats: {
        totalAdmins: adminCount,
        totalAthletes: athleteCount,
        trashItems: trashCount,
      },
      env: envStatus,
      services: {
        firebase: {
          status: firebase.status,
          message: firebase.message,
        },
        cloudinary: {
          status: cloudinary.status,
          message: cloudinary.message,
        },
        mail: {
          status: mail.status,
          message: mail.message,
          mode: mail.mode,
        },
        googleAuth: {
          status: process.env.GOOGLE_CLIENT_ID ? "healthy" : "warning",
          message: process.env.GOOGLE_CLIENT_ID
            ? "OAuth configured"
            : "Missing Google client ID",
        },
        redis: redisHealth,
      },
      integrity: {
        gallery: galleryIntegrity,
        news: newsIntegrity,
        notices: noticeIntegrity,
        contact: contactIntegrity,
      },
      pageConnectivity: {
        home: { status: "healthy", title: "Home Page", link: "/" },
        about: { status: "healthy", title: "About Page", link: "/about" },
        gallery: {
          status: galleryIntegrity.status,
          title: "Gallery Page",
          link: "/gallery",
        },
        news: {
          status: newsIntegrity.status,
          title: "News & Notices",
          link: "/news",
        },
        registration: {
          status: "healthy",
          title: "Registration Portal",
          link: "/registration",
        },
        contact: {
          status: contactIntegrity.status,
          title: "Contact Section",
          link: "/#contact",
        },
      },
    };

    console.log("System Health Data Size:", JSON.stringify(healthData).length);

    // 🚀 Store in cache for 60 seconds
    await setCache("system_health", healthData, 60);

    sendSuccess(res, 200, "System health retrieved successfully", healthData);
  } catch (error) {
    next(error);
  }
};

/**
 * Request Admin Password Reset OTP
 */
const requestAdminReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { sendPasswordSetupEmail } = require("../services/mailService");

    const admins = await queryData(
      "admins",
      "email",
      email.trim().toLowerCase(),
    );
    if (admins.length === 0)
      return sendError(res, 404, "Admin account not found");

    const admin = admins[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

    await updateData("admins", admin.id, {
      resetOtp: otp,
      resetOtpExpiry: otpExpiry,
    });

    await sendPasswordSetupEmail(admin.email, admin.fullName, otp);
    await logAudit("ADMIN_PASSWORD_RESET_OTP_SENT", {
      id: admin.id,
      email: admin.email,
      ip: req.ip,
    });

    sendSuccess(res, 200, "Verification OTP sent to your email");
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Admin OTP and Set New Password
 */
const verifyAdminReset = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const admins = await queryData(
      "admins",
      "email",
      email.trim().toLowerCase(),
    );
    if (admins.length === 0) return sendError(res, 404, "Admin not found");

    const admin = admins[0];

    if (
      !admin.resetOtp ||
      admin.resetOtp !== otp ||
      Date.now() > admin.resetOtpExpiry
    ) {
      return sendError(res, 400, "Invalid or expired OTP");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await updateData("admins", admin.id, {
      password: hashedPassword,
      status: "active", // Unlock account
      failedAttempts: 0,
      resetOtp: null,
      resetOtpExpiry: null,
    });

    await logAudit("ADMIN_PASSWORD_RESET_SUCCESS", {
      id: admin.id,
      email: admin.email,
      ip: req.ip,
    });
    sendSuccess(res, 200, "Password updated. You can now login.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  loginWithGoogle,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateProfile,
  updateAdmin,
  getSystemHealth,
  requestAdminReset,
  verifyAdminReset,
};
