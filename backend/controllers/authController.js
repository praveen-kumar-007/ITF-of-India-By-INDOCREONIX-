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
    if (admin && admin.photo && admin.photo.includes('cloudinary')) {
      // Extract public ID and delete from Cloudinary
      const publicId = admin.photo.split('/').pop().split('.')[0];
      const folder = admin.photo.split('ITF_India/')[1].split('/')[0];
      await deleteFromCloudinary(`ITF_India/${folder}/${publicId}`);
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
      if (admin.photo && admin.photo.includes('cloudinary')) {
        const oldPublicId = admin.photo.split('/').pop().split('.')[0];
        const oldFolder = admin.photo.split('ITF_India/')[1].split('/')[0];
        await deleteFromCloudinary(`ITF_India/${oldFolder}/${oldPublicId}`);
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
    const firebase = await checkFirebaseHealth();
    const cloudinary = await checkCloudinaryHealth();
    const mail = checkMailHealth();

    const healthData = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      services: {
        firebase,
        cloudinary,
        mail
      }
    };

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


