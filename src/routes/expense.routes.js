const express = require('express');
const router = express.Router();
const {
  getAllExpenses,
  getExpense,
  addExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  getExpenseStats
} = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const { sanitizeInput, handleValidationErrors } = require('../middleware/validation.middleware');
const {
  expenseValidation,
  objectIdValidation,
  dateRangeValidation,
  paginationValidation
} = require('../utils/validators');

// Apply authentication to all routes
router.use(protect);

// Statistics route (must be before /:id route)
router.get('/stats', dateRangeValidation, handleValidationErrors, getExpenseStats);

// CRUD routes
router.route('/')
  .get(sanitizeInput, paginationValidation, dateRangeValidation, handleValidationErrors, getAllExpenses)
  .post(sanitizeInput, expenseValidation, handleValidationErrors, addExpense);

router.route('/:id')
  .get(objectIdValidation, handleValidationErrors, getExpense)
  .put(sanitizeInput, objectIdValidation, expenseValidation, handleValidationErrors, updateExpense)
  .delete(objectIdValidation, handleValidationErrors, deleteExpense);

// Receipt upload
router.post('/:id/receipt', objectIdValidation, handleValidationErrors, upload.single('receipt'), handleUploadError, uploadReceipt);

module.exports = router;

