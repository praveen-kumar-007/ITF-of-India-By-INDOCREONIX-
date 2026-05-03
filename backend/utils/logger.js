const { saveData } = require('../services/firebaseService');

/**
 * Log sensitive actions for audit trail
 * @param {string} action - Description of action (e.g., 'LOGIN_SUCCESS')
 * @param {Object} metadata - Additional info (userId, ip, status)
 */
const logAudit = async (action, metadata = {}) => {
  try {
    const logData = {
      action,
      ...metadata,
      timestamp: new Date().toISOString(),
      userAgent: metadata.userAgent || 'unknown',
    };

    // Log to console for now, and optionally save to Firebase/Log file
    console.log(`[AUDIT] ${action}:`, JSON.stringify(metadata));
    
    // Optional: Save to a 'logs' collection in Firebase
    // await saveData('logs', logData);
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

module.exports = { logAudit };
