const express = require('express');
const router = express.Router();
const { createNews, getNews, deleteNews } = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const { checkSystemControl } = require('../middleware/systemControlMiddleware');

/**
 * Public Routes
 */
router.get('/', checkSystemControl('news_enabled', 'Public News & Notice Board'), getNews);

/**
 * Admin Routes
 */
router.post('/', protect, authorize('admin', 'superadmin'), upload.single('image'), createNews);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteNews);

module.exports = router;
