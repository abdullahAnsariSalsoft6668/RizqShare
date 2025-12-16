const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  
  // Profile Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  
  // Financial Settings
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'AED']
  },
  donationPercentage: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  monthlyIncomeTarget: {
    type: Number,
    default: 0
  },
  monthlyExpenseLimit: {
    type: Number,
    default: 0
  },
  
  // Preferences
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  reminderFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'never'],
    default: 'weekly'
  },
  
  // Subscription
  subscriptionTier: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  subscriptionExpiry: {
    type: Date
  },
  
  // Analytics
  givingScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalDonated: {
    type: Number,
    default: 0
  },
  totalIncome: {
    type: Number,
    default: 0
  },
  totalExpenses: {
    type: Number,
    default: 0
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for donation goal
userSchema.virtual('currentDonationGoal').get(function() {
  return (this.totalIncome * this.donationPercentage) / 100;
});

// Virtual for remaining donation
userSchema.virtual('remainingDonationGoal').get(function() {
  return Math.max(0, this.currentDonationGoal - this.totalDonated);
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate giving score
userSchema.methods.calculateGivingScore = function() {
  const donationRate = this.totalIncome > 0 ? (this.totalDonated / this.totalIncome) * 100 : 0;
  const consistency = 50; // This would be calculated based on donation frequency
  const goalAchievement = Math.min((this.totalDonated / this.currentDonationGoal) * 100, 100) || 0;
  
  this.givingScore = Math.round((donationRate * 0.4 + consistency * 0.3 + goalAchievement * 0.3));
  return this.givingScore;
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

