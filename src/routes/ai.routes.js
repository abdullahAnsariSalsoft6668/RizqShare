const express = require('express');
const router = express.Router();
const {
  getFinancialAdvice,
  getDonationRecommendations,
  categorizeExpense,
  generateImpactStory,
  forecastDonations
} = require('../controllers/ai.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { sanitizeInput, handleValidationErrors } = require('../middleware/validation.middleware');
const { body } = require('express-validator');

// Apply authentication to all routes
router.use(protect);

// AI routes
router.post('/financial-advice', getFinancialAdvice);

router.post('/donation-recommendations', getDonationRecommendations);

router.post(
  '/categorize-expense',
  sanitizeInput,
  [
    body('description').notEmpty().withMessage('Description is required'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number')
  ],
  handleValidationErrors,
  categorizeExpense
);

router.post('/impact-story', sanitizeInput, generateImpactStory);

router.get('/forecast', sanitizeInput, forecastDonations);

module.exports = router;

