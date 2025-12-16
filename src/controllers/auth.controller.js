const User = require('../models/User');
const { generateToken } = require('../utils/helpers');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, phoneNumber, donationPercentage } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    email,
    password,
    fullName,
    phoneNumber,
    donationPercentage: donationPercentage || 5
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        donationPercentage: user.donationPercentage,
        currency: user.currency,
        subscriptionTier: user.subscriptionTier
      },
      token
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !user.isActive) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // Check if password matches
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        donationPercentage: user.donationPercentage,
        currency: user.currency,
        subscriptionTier: user.subscriptionTier,
        givingScore: user.givingScore,
        totalDonated: user.totalDonated,
        totalIncome: user.totalIncome,
        totalExpenses: user.totalExpenses
      },
      token
    }
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        currency: user.currency,
        donationPercentage: user.donationPercentage,
        monthlyIncomeTarget: user.monthlyIncomeTarget,
        monthlyExpenseLimit: user.monthlyExpenseLimit,
        notificationsEnabled: user.notificationsEnabled,
        emailNotifications: user.emailNotifications,
        reminderFrequency: user.reminderFrequency,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiry: user.subscriptionExpiry,
        givingScore: user.givingScore,
        totalDonated: user.totalDonated,
        totalIncome: user.totalIncome,
        totalExpenses: user.totalExpenses,
        currentDonationGoal: user.currentDonationGoal,
        remainingDonationGoal: user.remainingDonationGoal,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'fullName',
    'phoneNumber',
    'currency',
    'donationPercentage',
    'monthlyIncomeTarget',
    'monthlyExpenseLimit',
    'notificationsEnabled',
    'emailNotifications',
    'reminderFrequency'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.userId,
    updates,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * @desc    Update profile picture
 * @route   PUT /api/auth/profile/picture
 * @access  Private
 */
const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Please upload an image'
    });
  }

  const profilePicture = `/uploads/profiles/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { profilePicture },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile picture updated successfully',
    data: {
      profilePicture: user.profilePicture
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.userId).select('+password');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Check current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Delete account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfilePicture,
  changePassword,
  deleteAccount
};

