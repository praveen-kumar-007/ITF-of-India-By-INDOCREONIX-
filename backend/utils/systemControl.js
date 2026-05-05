const { db } = require('../config/firebase');

/**
 * Check if a specific system service is enabled
 * @param {string} serviceName - Key in settings/system_control (e.g. 'mail_enabled')
 * @returns {Promise<boolean>}
 */
const isServiceEnabled = async (serviceName) => {
  try {
    const snapshot = await db.ref(`settings/system_control/${serviceName}`).once('value');
    const isEnabled = snapshot.val();
    
    // Default to true if setting is missing
    return isEnabled !== false;
  } catch (error) {
    console.error(`System Control Check Error (${serviceName}):`, error);
    return true; // Fail safe to enabled
  }
};

module.exports = { isServiceEnabled };
