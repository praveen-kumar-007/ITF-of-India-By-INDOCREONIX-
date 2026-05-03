const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { 
  registerAthlete, 
  getRegistrations, 
  getRegistrationById,
  updateRegistrationStatus,
  updateRegistration,
  deleteRegistration
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validateMiddleware');
const { athleteRegistrationSchema } = require('../utils/validationSchemas');

// Define file upload fields
const cpUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 }
]);

// Routes
router.get('/check-availability', (req, res, next) => {
  const { checkAvailability } = require('../controllers/registrationController');
  checkAvailability(req, res, next);
});
router.post('/register', authLimiter, cpUpload, validate(athleteRegistrationSchema), registerAthlete); // Public

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
router.put('/:id', protect, authorize('superadmin', 'admin'), updateRegistration);

router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteRegistration);


module.exports = router;
