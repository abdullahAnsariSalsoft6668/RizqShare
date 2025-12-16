const express = require('express');
const router = express.Router();
const {
  getAllDonations,
  getDonation,
  addDonation,
  updateDonation,
  deleteDonation,
  uploadReceipt,
  getDonationStats,
  getDonationProgress,
  exportDonations
} = require('../controllers/donation.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const { sanitizeInput, handleValidationErrors } = require('../middleware/validation.middleware');
const {
  donationValidation,
  objectIdValidation,
  dateRangeValidation,
  paginationValidation
} = require('../utils/validators');

// Apply authentication to all routes
router.use(protect);

// Special routes (must be before /:id route)
router.get('/stats', dateRangeValidation, handleValidationErrors, getDonationStats);
router.get('/progress', dateRangeValidation, handleValidationErrors, getDonationProgress);
router.get('/export', dateRangeValidation, handleValidationErrors, exportDonations);

// CRUD routes
router.route('/')
  .get(sanitizeInput, paginationValidation, dateRangeValidation, handleValidationErrors, getAllDonations)
  .post(sanitizeInput, donationValidation, handleValidationErrors, addDonation);

router.route('/:id')
  .get(objectIdValidation, handleValidationErrors, getDonation)
  .put(sanitizeInput, objectIdValidation, donationValidation, handleValidationErrors, updateDonation)
  .delete(objectIdValidation, handleValidationErrors, deleteDonation);

// Receipt upload
router.post('/:id/receipt', objectIdValidation, handleValidationErrors, upload.single('receipt'), handleUploadError, uploadReceipt);

module.exports = router;

