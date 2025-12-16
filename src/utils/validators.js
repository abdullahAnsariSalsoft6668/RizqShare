const { body, param, query } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for income
 */
const incomeValidation = [
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Income source is required')
    .isIn(['salary', 'freelance', 'business', 'investment', 'rental', 'gift', 'other'])
    .withMessage('Invalid income source'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP', 'AED'])
    .withMessage('Invalid currency'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

/**
 * Validation rules for expense
 */
const expenseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'food', 'travel', 'bills', 'shopping', 'healthcare', 'education',
      'entertainment', 'housing', 'transportation', 'utilities',
      'insurance', 'personal', 'charity', 'other'
    ])
    .withMessage('Invalid category'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP', 'AED'])
    .withMessage('Invalid currency'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

/**
 * Validation rules for donation
 */
const donationValidation = [
  body('recipient')
    .trim()
    .notEmpty()
    .withMessage('Recipient is required')
    .isLength({ max: 200 })
    .withMessage('Recipient name cannot exceed 200 characters'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ max: 500 })
    .withMessage('Purpose cannot exceed 500 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'zakat', 'sadaqah', 'tithe', 'education', 'healthcare',
      'poverty-relief', 'disaster-relief', 'animal-welfare',
      'environment', 'religious', 'community', 'other'
    ])
    .withMessage('Invalid category'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP', 'AED'])
    .withMessage('Invalid currency'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

/**
 * Validation rules for ObjectId param
 */
const objectIdValidation = [
  param('id')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid ID format')
];

/**
 * Validation rules for date range query
 */
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

/**
 * Validation rules for pagination
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation rules for profile update
 */
const profileUpdateValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number format'),
  body('donationPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Donation percentage must be between 0 and 100'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP', 'AED'])
    .withMessage('Invalid currency')
];

module.exports = {
  registerValidation,
  loginValidation,
  incomeValidation,
  expenseValidation,
  donationValidation,
  objectIdValidation,
  dateRangeValidation,
  paginationValidation,
  profileUpdateValidation
};

