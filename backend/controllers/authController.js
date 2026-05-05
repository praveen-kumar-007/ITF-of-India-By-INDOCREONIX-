const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { 
  saveData, 
  queryData, 
  getDataById, 
  getAllData, 
  deleteData, 
  updateData,
  checkFirebaseHealth 
} = require('../services/firebaseService');
const { 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  checkCloudinaryHealth 
} = require('../services/cloudinaryService');
const { checkMailHealth } = require('../services/mailService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { logAudit } = require('../utils/logger');
const { getPublicIdFromUrl } = require('../utils/cloudinaryUtils');
const { getCache, setCache } = require('../utils/cache');
const os = require('os');

/**
 * Admin Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for admins in Firebase
    const admins = await queryData('admins', 'email', email);
    const admin = admins[0];


    if (!admin) {
      await logAudit('LOGIN_FAILED', { email, reason: 'user_not_found', ip: req.ip });
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if admin is verified/active
    if (admin.status !== 'active') {
      await logAudit('LOGIN_BLOCKED', { email, reason: 'account_inactive', ip: req.ip });
      return sendError(res, 403, 'Your account is not active. Please contact Super Admin.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      await logAudit('LOGIN_FAILED', { email, reason: 'wrong_password', ip: req.ip });
      return sendError(res, 401, 'Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role || 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAudit('LOGIN_SUCCESS', { id: admin.id, email: admin.email, role: admin.role, ip: req.ip });

    sendSuccess(res, 200, 'Login successful', {
      token,
      user: { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role || 'admin', 
        fullName: admin.fullName,
        photo: admin.photo || '' 
      }
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
    const existing = await queryData('admins', 'email', email);
    if (existing.length > 0) {
      return sendError(res, 400, 'Admin with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminData = {
      email,
      password: hashedPassword,
      fullName,
      status: 'active', // Can be 'pending' if you want a verification flow
      role: role || 'admin',
      createdAt: new Date().toISOString()
    };


    const id = await saveData('admins', adminData);

    sendSuccess(res, 201, 'Admin created successfully', { id });
  } catch (error) {
    next(error);
  }
};


/**
 * Get all admins (Super Admin only)
 */
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await getAllData('admins');
    // Remove passwords from response
    const safeAdmins = admins.map(({ password, ...admin }) => admin);
    sendSuccess(res, 200, 'Admins retrieved successfully', safeAdmins);
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
    const admin = await getDataById('admins', id);
    const publicId = getPublicIdFromUrl(admin?.photo);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    await deleteData('admins', id);
    sendSuccess(res, 200, 'Admin deleted successfully');
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


    const admin = await getDataById('admins', id);
    if (!admin) {
      return sendError(res, 404, 'Admin not found');
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
        'admins',
        `admin_${id}_${Date.now()}`
      );
      updateFields.photo = result.secure_url;
    }

    await updateData('admins', id, updateFields);
    sendSuccess(res, 200, 'Profile updated successfully', { photo: updateFields.photo });
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

    const admin = await getDataById('admins', id);
    if (!admin) {
      return sendError(res, 404, 'Admin not found');
    }

    const updateFields = { fullName, email, role, status };
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    await updateData('admins', id, updateFields);
    sendSuccess(res, 200, 'Admin updated successfully');
  } catch (error) {
    next(error);
  }
};




/**
 * Get System Health (Super Admin Only)
 */
const getSystemHealth = async (req, res, next) => {
  try {
    // 🚀 Check cache first
    const cachedData = await getCache('system_health');
    if (cachedData) {
      return sendSuccess(res, 200, 'System health retrieved from cache', cachedData);
    }

    const firebase = await checkFirebaseHealth();
    const cloudinary = await checkCloudinaryHealth();
    const mail = checkMailHealth();

    // Integrity Checks: Verify if key collections are readable and active
    const checkIntegrity = async (path, filterFn = null) => {
      try {
        const data = await getAllData(path);
        const filteredData = filterFn ? data.filter(filterFn) : data;
        return {
          status: 'healthy',
          count: filteredData.length,
          message: 'System Link Operational'
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          count: 0,
          message: 'Integrity Breach or Collection Missing'
        };
      }
    };

    const galleryIntegrity = await checkIntegrity('gallery');
    const newsIntegrity = await checkIntegrity('news', (item) => item.category === 'News' || item.category === 'General' || !item.category);
    const noticeIntegrity = await checkIntegrity('news', (item) => item.category === 'Notice' || item.category === 'Announcement');
    const contactIntegrity = await checkIntegrity('contacts');

    // Get basic stats
    const adminCount = (await getAllData('admins')).length;
    const athleteCount = (await getAllData('registrations')).length;
    const trashCount = (await getAllData('recycle_bin')).length;

    // Check environment variables (masking values)
    const envStatus = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      FIREBASE_DATABASE_URL: !!process.env.FIREBASE_DATABASE_URL,
      CLOUDINARY_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_KEY: !!process.env.CLOUDINARY_API_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      NODE_ENV: process.env.NODE_ENV || 'development'
    };

    const healthData = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      stats: {
        totalAdmins: adminCount,
        totalAthletes: athleteCount,
        trashItems: trashCount
      },
      env: envStatus,
      services: {
        firebase: { 
          status: firebase.status, 
          message: firebase.message 
        },
        cloudinary: { 
          status: cloudinary.status, 
          message: cloudinary.message 
        },
        mail: { 
          status: mail.status, 
          message: mail.message,
          mode: mail.mode
        }
      },
      integrity: {
        gallery: galleryIntegrity,
        news: newsIntegrity,
        notices: noticeIntegrity,
        contact: contactIntegrity
      },
      pageConnectivity: {
        home: { status: 'healthy', title: 'Home Page', link: '/' },
        about: { status: 'healthy', title: 'About Page', link: '/about' },
        gallery: { status: galleryIntegrity.status, title: 'Gallery Page', link: '/gallery' },
        news: { status: newsIntegrity.status, title: 'News & Notices', link: '/news' },
        registration: { status: 'healthy', title: 'Registration Portal', link: '/registration' },
        contact: { status: contactIntegrity.status, title: 'Contact Section', link: '/#contact' }
      }
    };

    console.log('System Health Data Size:', JSON.stringify(healthData).length);
    
    // 🚀 Store in cache for 60 seconds
    await setCache('system_health', healthData, 60);

    sendSuccess(res, 200, 'System health retrieved successfully', healthData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateProfile,
  updateAdmin,
  getSystemHealth
};


