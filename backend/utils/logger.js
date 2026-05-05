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

    // Log to console
    console.log(`[AUDIT] ${action}:`, JSON.stringify(metadata));
    
    // Save to 'logs' collection in Firebase for permanent record
    try {
      await saveData('logs', logData);
    } catch (dbErr) {
      console.error('Failed to persist audit log to database:', dbErr);
    }
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

module.exports = { logAudit };
