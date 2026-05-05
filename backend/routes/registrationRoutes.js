const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { 
  registerAthlete, 
  getRegistrations, 
  getRegistrationById,
  updateRegistrationStatus,
  updateRegistration,
  deleteRegistration,
  getUniqueId
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validateMiddleware');
const { athleteRegistrationSchema } = require('../utils/validationSchemas');
const { checkSystemControl } = require('../middleware/systemControlMiddleware');

// Define file upload fields
const cpUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 }
]);

// Routes
router.get('/check-availability', checkSystemControl('registration_enabled', 'Registration Portal'), (req, res, next) => {
  const { checkAvailability } = require('../controllers/registrationController');
  checkAvailability(req, res, next);
});
router.get('/generate-id', protect, getUniqueId);
router.post('/register', checkSystemControl('registration_enabled', 'Registration Portal'), authLimiter, cpUpload, validate(athleteRegistrationSchema), registerAthlete); // Public

router.get('/', protect, getRegistrations);
router.get('/:id', protect, getRegistrationById);
router.patch('/:id/status', protect, authorize('superadmin', 'admin'), updateRegistrationStatus);
router.patch('/:id/restore', protect, authorize('superadmin', 'admin'), (req, res, next) => {
  const { restoreRegistration } = require('../controllers/registrationController');
  restoreRegistration(req, res, next);
});
router.delete('/:id/permanent', protect, authorize('superadmin'), (req, res, next) => {
  const { permanentDeleteRegistration } = require('../controllers/registrationController');
  permanentDeleteRegistration(req, res, next);
});
router.delete('/empty-trash', protect, authorize('superadmin'), (req, res, next) => {
  const { emptyTrash } = require('../controllers/registrationController');
  emptyTrash(req, res, next);
});
router.put('/:id', protect, authorize('superadmin', 'admin'), cpUpload, updateRegistration);

router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteRegistration);


module.exports = router;
