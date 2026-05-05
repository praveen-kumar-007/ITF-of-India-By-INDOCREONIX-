const express = require('express');
const router = express.Router();
const { submitContact, getContacts } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkSystemControl } = require('../middleware/systemControlMiddleware');

router.post('/', checkSystemControl('contact_enabled', 'Contact Gateway'), submitContact);
router.get('/', protect, authorize('superadmin', 'admin'), getContacts);

module.exports = router;
