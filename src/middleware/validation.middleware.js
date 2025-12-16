const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Middleware to sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  // Remove any MongoDB operators from request body
  const removeOperators = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        removeOperators(obj[key]);
      }
    });
    
    return obj;
  };
  
  if (req.body) {
    req.body = removeOperators(req.body);
  }
  
  if (req.query) {
    req.query = removeOperators(req.query);
  }
  
  if (req.params) {
    req.params = removeOperators(req.params);
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  sanitizeInput
};

