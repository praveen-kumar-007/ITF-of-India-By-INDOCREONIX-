const express = require('express');
const router = express.Router();
const { submitContact, getContacts, deleteContact } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkSystemControl } = require('../middleware/systemControlMiddleware');

router.post('/', checkSystemControl('contact_enabled', 'Contact Gateway'), submitContact);
router.get('/', protect, authorize('superadmin', 'admin'), getContacts);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteContact);

module.exports = router;
