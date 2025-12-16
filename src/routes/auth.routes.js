const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfilePicture,
  changePassword,
  deleteAccount
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const { sanitizeInput, handleValidationErrors } = require('../middleware/validation.middleware');
const {
  registerValidation,
  loginValidation,
  profileUpdateValidation
} = require('../utils/validators');

// Public routes
router.post('/register', sanitizeInput, registerValidation, handleValidationErrors, register);
router.post('/login', sanitizeInput, loginValidation, handleValidationErrors, login);

// Protected routes
router.use(protect); // Apply authentication middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', sanitizeInput, profileUpdateValidation, handleValidationErrors, updateProfile);
router.put('/profile/picture', upload.single('profilePicture'), handleUploadError, updateProfilePicture);
router.put('/password', sanitizeInput, changePassword);
router.delete('/account', deleteAccount);

module.exports = router;

