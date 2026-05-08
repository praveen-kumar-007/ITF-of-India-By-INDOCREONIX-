const express = require("express");
const router = express.Router();
const {
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
  requestProfileOTP,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validateMiddleware");
const {
  loginSchema,
  adminCreateSchema,
  adminUpdateSchema,
  googleAuthSchema,
} = require("../utils/validationSchemas");
const upload = require("../middleware/multer");

router.post("/login", authLimiter, validate(loginSchema), login);
router.post(
  "/oauth/google",
  authLimiter,
  validate(googleAuthSchema),
  loginWithGoogle,
);

// Password Reset Routes (Public)
router.post("/request-reset", authLimiter, requestAdminReset);
router.post("/verify-reset", authLimiter, verifyAdminReset);

// Admin management routes (Super Admin only)
router.get("/", protect, authorize("superadmin"), getAllAdmins);
router.get("/system-health", protect, authorize("superadmin"), getSystemHealth);
router.post(
  "/create-admin",
  protect,
  authorize("superadmin"),
  validate(adminCreateSchema),
  createAdmin,
);
router.put(
  "/:id",
  protect,
  authorize("superadmin"),
  validate(adminUpdateSchema),
  updateAdmin,
);
router.delete("/:id", protect, authorize("superadmin"), deleteAdmin);
router.put(
  "/profile/:id",
  protect,
  upload.single("photo"),
  validate(adminUpdateSchema),
  updateProfile,
);
router.post("/request-profile-otp", protect, requestProfileOTP);

module.exports = router;
