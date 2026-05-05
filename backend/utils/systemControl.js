const { db } = require('../config/firebase');
const { getCache, setCache } = require('./cache');

/**
 * Check if a specific system service is enabled
 * @param {string} serviceName - Key in settings/system_control (e.g. 'mail_enabled')
 * @returns {Promise<boolean>}
 */
const isServiceEnabled = async (serviceName) => {
  try {
    // 🚀 Redis Mediation: Use the full settings cache if available
    let settings = await getCache('system_controls');

    if (!settings) {
      const snapshot = await db.ref('settings/system_control').once('value');
      settings = snapshot.val();
      
      if (settings) {
        // Cache for 5 minutes
        await setCache('system_controls', settings, 300);
      }
    }

    if (settings && typeof settings[serviceName] !== 'undefined') {
      return settings[serviceName] !== false;
    }
    
    // Fallback if cache/db fails or setting missing
    return true;
  } catch (error) {
    console.error(`System Control Check Error (${serviceName}):`, error);
    return true; // Fail safe to enabled
  }
};

module.exports = { isServiceEnabled };
