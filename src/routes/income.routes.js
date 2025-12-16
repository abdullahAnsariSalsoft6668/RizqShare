const express = require('express');
const router = express.Router();
const {
  getAllIncome,
  getIncome,
  addIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats
} = require('../controllers/income.controller');
const { protect } = require('../middleware/auth.middleware');
const { sanitizeInput, handleValidationErrors } = require('../middleware/validation.middleware');
const {
  incomeValidation,
  objectIdValidation,
  dateRangeValidation,
  paginationValidation
} = require('../utils/validators');

// Apply authentication to all routes
router.use(protect);

// Statistics route (must be before /:id route)
router.get('/stats', dateRangeValidation, handleValidationErrors, getIncomeStats);

// CRUD routes
router.route('/')
  .get(sanitizeInput, paginationValidation, dateRangeValidation, handleValidationErrors, getAllIncome)
  .post(sanitizeInput, incomeValidation, handleValidationErrors, addIncome);

router.route('/:id')
  .get(objectIdValidation, handleValidationErrors, getIncome)
  .put(sanitizeInput, objectIdValidation, incomeValidation, handleValidationErrors, updateIncome)
  .delete(objectIdValidation, handleValidationErrors, deleteIncome);

module.exports = router;

