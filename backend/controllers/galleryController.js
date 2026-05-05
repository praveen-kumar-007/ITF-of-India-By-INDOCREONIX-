const { saveData, getAllData, getDataById, deleteData } = require('../services/firebaseService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { getPublicIdFromUrl } = require('../utils/cloudinaryUtils');

/**
 * Admin: Upload Photos to Gallery (Supports Multiple)
 */
const uploadPhoto = async (req, res, next) => {
  try {
    const { title, category } = req.body;
    const files = req.files; // Array of files from multer.array('photos')

    if (!files || files.length === 0) {
      return sendError(res, 400, 'No photos provided');
    }

    const uploadResults = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Use provided title or append index if multiple
      const finalTitle = files.length > 1 && title 
        ? `${title} (${i + 1})` 
        : (title || 'Indra the Fighter');

      console.log(`Processing file ${i + 1}/${files.length}: ${finalTitle}`);

      const cloudResult = await uploadToCloudinary(
        file.buffer,
        'gallery',
        `gallery_${Date.now()}_${i}`
      );

      // Save metadata to Firebase
      const photoData = {
        title: finalTitle,
        category: category || 'General',
        imageUrl: cloudResult.secure_url,
        publicId: cloudResult.public_id,
        uploadedBy: req.user.id,
        width: cloudResult.width,
        height: cloudResult.height,
        format: cloudResult.format,
        createdAt: new Date().toISOString()
      };

      const docId = await saveData('gallery', photoData);
      uploadResults.push({ id: docId, ...photoData });
    }

    sendSuccess(res, 201, `${files.length} photo(s) uploaded successfully`, uploadResults);
  } catch (error) {
    console.error('Multi-Upload Error:', error);
    next(error);
  }
};

/**
 * Get all photos from Gallery
 */
const getGallery = async (req, res, next) => {
  try {
    const photos = await getAllData('gallery');
    // Sort by createdAt descending
    const sortedPhotos = photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendSuccess(res, 200, 'Gallery fetched successfully', sortedPhotos);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete photo from Gallery
 */
const deletePhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Delete Request for Photo ID:', id);
    const photo = await getDataById('gallery', id);

    if (!photo) {
      return sendError(res, 404, 'Photo not found');
    }

    // Delete from Cloudinary
    const publicId = photo.publicId || getPublicIdFromUrl(photo.imageUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Delete from Firebase
    await deleteData('gallery', id);

    sendSuccess(res, 200, 'Photo deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPhoto,
  getGallery,
  deletePhoto
};
