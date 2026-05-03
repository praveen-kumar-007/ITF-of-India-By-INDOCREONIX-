const { saveData, getAllData, getDataById, updateData, deleteData } = require('../services/firebaseService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendPendingEmail, sendApprovalEmail, sendRejectionEmail } = require('../services/mailService');

/**
 * Helper to extract Public ID from Cloudinary URL
 */
const getPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const fileName = parts[parts.length - 1].split('.')[0];
  const folder1 = parts[parts.length - 2];
  const folder2 = parts[parts.length - 3];
  return `${folder2}/${folder1}/${fileName}`;
};

/**
 * Handle athlete registration
 */
const registerAthlete = async (req, res, next) => {
  try {
    const formData = req.body;
    const files = req.files;
    const { queryData } = require('../services/firebaseService');

    // 1. Check Unique Email
    const existingEmail = await queryData('registrations', 'email', formData.email);
    if (existingEmail.length > 0) return sendError(res, 400, 'This email is already registered.');

    // 2. Check Unique Phone
    const existingPhone = await queryData('registrations', 'contactNumber', formData.contactNumber);
    if (existingPhone.length > 0) return sendError(res, 400, 'This contact number is already registered.');

    // 3. Check Unique Aadhar
    const existingAadhar = await queryData('registrations', 'aadharNumber', formData.aadharNumber);
    if (existingAadhar.length > 0) return sendError(res, 400, 'This Aadhar number is already registered.');

    // 4. Check Unique Identity (Name + Father + DOB)
    const nameMatches = await queryData('registrations', 'fullName', formData.fullName);
    const identityMatch = nameMatches.find(reg => 
      reg.fatherName.toLowerCase() === formData.fatherName.toLowerCase() && 
      reg.dob === formData.dob
    );
    if (identityMatch) return sendError(res, 400, 'Candidate already registered with this identity.');

    if (!files || Object.keys(files).length === 0) return sendError(res, 400, 'Required documents are missing');

    const expectedFiles = ['photo', 'signature', 'aadharFront', 'aadharBack', 'paymentProof'];
    const uploadedUrls = {};

    for (const fieldName of expectedFiles) {
      if (files[fieldName] && files[fieldName][0]) {
        const file = files[fieldName][0];
        const result = await uploadToCloudinary(
          file.buffer, 
          'registrations', 
          `${formData.fullName.replace(/\s+/g, '_')}_${fieldName}_${Date.now()}`
        );
        uploadedUrls[fieldName] = result.secure_url;
      }
    }

    const regNo = `ITF/REG/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    const registrationData = { ...formData, ...uploadedUrls, registrationNumber: regNo, status: 'pending' };
    const docId = await saveData('registrations', registrationData);

    // [ASYNC] Send Pending Verification Email with Details
    sendPendingEmail(formData.email, formData.fullName, regNo, registrationData)
      .catch(err => console.error("Pending Email Error:", err));

    sendSuccess(res, 201, 'Athlete registered successfully', { id: docId, registrationNumber: regNo });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all registrations
 */
const getRegistrations = async (req, res, next) => {
  try {
    const registrations = await getAllData('registrations');
    sendSuccess(res, 200, 'Registrations fetched successfully', registrations);
  } catch (error) {
    next(error);
  }
};

/**
 * Get registration details by ID
 */
const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await getDataById('registrations', req.params.id);
    if (!registration) return sendError(res, 404, 'Registration not found');
    sendSuccess(res, 200, 'Fetched successfully', registration);
  } catch (error) {
    next(error);
  }
};

/**
 * Update registration status
 */
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // 1. Get current data for email info
    const athlete = await getDataById('registrations', id);
    if (!athlete) return sendError(res, 404, 'Athlete not found');

    // 2. Update Status
    const updateFields = { status };
    if (status === 'rejected' && reason) {
      updateFields.rejectionReason = reason;
    }
    await updateData('registrations', id, updateFields);

    // 3. Trigger Status Emails [ASYNC]
    if (status === 'approved') {
      sendApprovalEmail(athlete.email, athlete.fullName, athlete.registrationNumber, athlete)
        .catch(err => console.error("Approval Email Error:", err));
    } else if (status === 'rejected') {
      sendRejectionEmail(athlete.email, athlete.fullName, reason)
        .catch(err => console.error("Rejection Email Error:", err));
    }

    sendSuccess(res, 200, `Status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Soft Delete - Move to Trash
 */
const deleteRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    await updateData('registrations', id, { 
      status: 'deleted',
      deletedAt: new Date().toISOString()
    });
    sendSuccess(res, 200, 'Athlete moved to trash');
  } catch (error) {
    next(error);
  }
};

/**
 * Restore from Trash
 */
const restoreRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    await updateData('registrations', id, { status: 'pending', deletedAt: null });
    sendSuccess(res, 200, 'Athlete restored successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Permanent Delete - Clean DB and Cloudinary
 */
const permanentDeleteRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const player = await getDataById('registrations', id);
    if (!player) return sendError(res, 404, 'Player not found');

    const assets = ['photo', 'signature', 'aadharFront', 'aadharBack', 'paymentProof'];
    for (const key of assets) {
      const publicId = getPublicId(player[key]);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    await deleteData('registrations', id);
    sendSuccess(res, 200, 'Athlete and files deleted permanently');
  } catch (error) {
    next(error);
  }
};

/**
 * Empty Trash
 */
const emptyTrash = async (req, res, next) => {
  try {
    const all = await getAllData('registrations');
    const trash = all.filter(reg => reg.status === 'deleted');

    for (const player of trash) {
      const assets = ['photo', 'signature', 'aadharFront', 'aadharBack', 'paymentProof'];
      for (const key of assets) {
        const publicId = getPublicId(player[key]);
        if (publicId) await deleteFromCloudinary(publicId);
      }
      await deleteData('registrations', player.id);
    }

    sendSuccess(res, 200, `${trash.length} items cleared permanently`);
  } catch (error) {
    next(error);
  }
};

/**
 * Update registration data
 */
const updateRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    await updateData('registrations', id, req.body);
    sendSuccess(res, 200, 'Registration updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Check availability
 */
const checkAvailability = async (req, res, next) => {
  try {
    const { email, contactNumber, aadharNumber, fullName, fatherName, dob } = req.query;
    const { queryData } = require('../services/firebaseService');

    if (email) {
      const existing = await queryData('registrations', 'email', email);
      if (existing.length > 0) return sendError(res, 400, 'Email already registered.');
    }
    if (contactNumber) {
      const existing = await queryData('registrations', 'contactNumber', contactNumber);
      if (existing.length > 0) return sendError(res, 400, 'Phone already registered.');
    }
    if (aadharNumber) {
      const existing = await queryData('registrations', 'aadharNumber', aadharNumber);
      if (existing.length > 0) return sendError(res, 400, 'Aadhar already registered.');
    }
    if (fullName && fatherName && dob) {
      const nameMatches = await queryData('registrations', 'fullName', fullName);
      const identityMatch = nameMatches.find(reg => 
        reg.fatherName.toLowerCase() === fatherName.toLowerCase() && reg.dob === dob
      );
      if (identityMatch) return sendError(res, 400, 'Identity already registered.');
    }

    sendSuccess(res, 200, 'Available');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerAthlete,
  getRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  deleteRegistration,
  updateRegistration,
  checkAvailability,
  restoreRegistration,
  permanentDeleteRegistration,
  emptyTrash
};
