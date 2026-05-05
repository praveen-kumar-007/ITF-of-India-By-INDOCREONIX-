const { isServiceEnabled } = require('../utils/systemControl');
const { sendError } = require('../utils/responseHandler');

/**
 * Middleware to check if a specific system service is enabled
 * @param {string} serviceName - e.g. 'registration_enabled'
 * @param {string} displayName - e.g. 'Registration Portal'
 */
const checkSystemControl = (serviceName, displayName) => {
  return async (req, res, next) => {
    const enabled = await isServiceEnabled(serviceName);
    if (!enabled) {
      return sendError(res, 503, `The ${displayName} is currently offline for maintenance. Please try again later.`);
    }
    next();
  };
};

module.exports = { checkSystemControl };
