/**
 * Helper to extract Public ID from Cloudinary URL
 * @param {string} url - The full Cloudinary secure URL
 * @returns {string|null} - The public ID including folders, or null
 */
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary')) return null;
  
  // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v12345678/folder/subfolder/public_id.jpg
  // We need "folder/subfolder/public_id"
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(p => p === 'upload');
  if (uploadIndex === -1) return null;
  
  // Everything after 'upload/' except the version (starts with 'v') and the extension
  let relevantParts = parts.slice(uploadIndex + 1);
  
  // If the first part starts with 'v' and is numeric (like v12345678), it's the version number
  // Sometimes there's no version number in the URL
  if (relevantParts[0].startsWith('v') && !isNaN(relevantParts[0].substring(1))) {
    relevantParts = relevantParts.slice(1);
  } else if (relevantParts[0].includes(',') && relevantParts[0].length < 50) {
    // If it's a transformation part (e.g., c_fill,w_300), skip it
    relevantParts = relevantParts.slice(1);
    // After transformation, there might still be a version number
    if (relevantParts[0].startsWith('v') && !isNaN(relevantParts[0].substring(1))) {
        relevantParts = relevantParts.slice(1);
    }
  }
  
  const lastPart = relevantParts[relevantParts.length - 1];
  relevantParts[relevantParts.length - 1] = lastPart.split('.')[0];
  
  return relevantParts.join('/');
};

module.exports = {
  getPublicIdFromUrl
};
