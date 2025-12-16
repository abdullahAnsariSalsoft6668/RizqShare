const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getTrends,
  getGivingScore,
  getCategoryBreakdown,
  getPredictions
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
const { sanitizeInput, handleValidationErrors } = require('../middleware/validation.middleware');

// Apply authentication to all routes
router.use(protect);

// Dashboard routes
router.get('/summary', sanitizeInput, handleValidationErrors, getDashboardSummary);
router.get('/trends', sanitizeInput, handleValidationErrors, getTrends);
router.get('/giving-score', getGivingScore);
router.get('/categories', sanitizeInput, handleValidationErrors, getCategoryBreakdown);
router.get('/predictions', getPredictions);

module.exports = router;

