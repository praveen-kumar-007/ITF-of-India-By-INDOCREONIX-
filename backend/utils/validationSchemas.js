const Joi = require('joi');

/**
 * Auth Schemas
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required(),
});

const adminCreateSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().required().trim(),
  role: Joi.string().valid('admin', 'superadmin').default('admin'),
});

const adminUpdateSchema = Joi.object({
  fullName: Joi.string().trim(),
  email: Joi.string().email().trim(),
  password: Joi.string().min(8).allow('', null),
  role: Joi.string().valid('admin', 'superadmin'),
  status: Joi.string().valid('active', 'inactive'),
});

/**
 * Registration Schemas
 */
const athleteRegistrationSchema = Joi.object({
  fullName: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),
  phone: Joi.string().required().trim(),
  dob: Joi.string().required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  discipline: Joi.string().required(),
  address: Joi.string().required(),
  aadharNumber: Joi.string().length(12).pattern(/^[0-9]+$/).required(),
  state: Joi.string().required(),
  district: Joi.string().required(),
  pincode: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  // Files are handled by multer, so we just check for existence if needed
  // or validate other text fields
}).unknown(true); // Allow other fields for now as registration is complex

/**
 * OTP Schemas
 */
const otpSendSchema = Joi.object({
  email: Joi.string().email().required().trim(),
});

const otpVerifySchema = Joi.object({
  email: Joi.string().email().required().trim(),
  otp: Joi.string().length(6).required().trim(),
});

/**
 * Athlete Auth Schemas
 */
const athleteLoginSchema = Joi.object({
  identifier: Joi.string().required().trim(), // Reg ID or Email
  password: Joi.string().required(),
});

const setupPasswordSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  otp: Joi.string().length(6).required().trim(),
  password: Joi.string().min(8).required(),
});

module.exports = {
  loginSchema,
  adminCreateSchema,
  adminUpdateSchema,
  athleteRegistrationSchema,
  otpSendSchema,
  otpVerifySchema,
  athleteLoginSchema,
  setupPasswordSchema,
};
