const { sendError } = require('../utils/responseHandler');

/**
 * Generic validation middleware
 * @param {Object} schema - Joi schema to validate against
 * @param {string} source - Where the data is located (body, query, params)
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return sendError(res, 400, errorMessage);
    }

    // Replace req[source] with validated and sanitized value
    req[source] = value;
    next();
  };
};

module.exports = validate;
