const multer = require('multer');
const path = require('path');

// Use memory storage as we'll upload directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Only allow specific image types to prevent malicious scripts/executables
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
