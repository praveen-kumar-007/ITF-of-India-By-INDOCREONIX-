const { saveData, getAllData } = require('../services/firebaseService');
const { sendContactConfirmation } = require('../services/mailService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const submitContact = async (req, res, next) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !email || !message) {
      return sendError(res, 400, 'Please provide name, email and message');
    }

    const contactData = {
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      message,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    await saveData('contacts', contactData);

    // Send confirmation email to user (don't await to keep response fast)
    sendContactConfirmation(email, firstName, message).catch(err => {
      console.error('Contact Email Confirmation Error:', err);
    });

    sendSuccess(res, 201, 'Message sent successfully. We will get back to you soon.');
  } catch (error) {
    next(error);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await getAllData('contacts');
    // Sort by newest
    contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendSuccess(res, 200, 'Contacts retrieved successfully', contacts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getContacts
};
