const { saveData, getAllData, getDataById, deleteData } = require('../services/firebaseService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { getPublicIdFromUrl } = require('../utils/cloudinaryUtils');

/**
 * Admin: Create News Item
 */
const createNews = async (req, res, next) => {
  try {
    const { title, content, date, category } = req.body;
    const file = req.file;

    if (!title || !content) {
      return sendError(res, 400, 'Title and content are required');
    }

    let imageUrl = null;
    let publicId = null;

    if (file) {
      const cloudResult = await uploadToCloudinary(
        file.buffer,
        'news',
        `news_${Date.now()}`
      );
      imageUrl = cloudResult.secure_url;
      publicId = cloudResult.public_id;
    }

    const newsData = {
      title,
      content,
      date: date || new Date().toISOString(),
      category: category || 'General',
      imageUrl,
      publicId,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    const docId = await saveData('news', newsData);
    sendSuccess(res, 201, 'News item created successfully', { id: docId, ...newsData });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all News Items
 */
const getNews = async (req, res, next) => {
  try {
    const news = await getAllData('news');
    // Sort by date or createdAt descending
    const sortedNews = news.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    sendSuccess(res, 200, 'News fetched successfully', sortedNews);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete News Item
 */
const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsItem = await getDataById('news', id);

    if (!newsItem) {
      return sendError(res, 404, 'News item not found');
    }

    // Delete image from Cloudinary if exists
    const publicId = newsItem.publicId || (newsItem.imageUrl ? getPublicIdFromUrl(newsItem.imageUrl) : null);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Delete from Firebase
    await deleteData('news', id);

    sendSuccess(res, 200, 'News item deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNews,
  getNews,
  deleteNews
};
