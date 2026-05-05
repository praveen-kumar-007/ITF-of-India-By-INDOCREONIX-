const express = require('express');
const router = express.Router();
const { uploadPhoto, getGallery, deletePhoto } = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const { checkSystemControl } = require('../middleware/systemControlMiddleware');

/**
 * Public Routes
 */
router.get('/', checkSystemControl('gallery_enabled', 'Public Gallery'), getGallery);

/**
 * Admin Routes
 */
router.post('/', protect, authorize('admin', 'superadmin'), upload.array('photos', 20), uploadPhoto);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deletePhoto);

module.exports = router;
