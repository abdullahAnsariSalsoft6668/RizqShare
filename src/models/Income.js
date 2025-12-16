const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Income Details
  source: {
    type: String,
    required: [true, 'Income source is required'],
    trim: true,
    enum: {
      values: ['salary', 'freelance', 'business', 'investment', 'rental', 'gift', 'other'],
      message: '{VALUE} is not a valid income source'
    }
  },
  
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'AED']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Timing
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  
  frequency: {
    type: String,
    enum: ['one-time', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'one-time'
  },
  
  // Auto-calculated Donation
  suggestedDonation: {
    type: Number,
    default: 0
  },
  
  // Categorization
  category: {
    type: String,
    enum: ['primary', 'secondary', 'passive'],
    default: 'primary'
  },
  
  // Metadata
  notes: {
    type: String,
    maxlength: 1000
  },
  
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Tracking
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate suggested donation before saving
incomeSchema.pre('save', async function(next) {
  if (this.isModified('amount')) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    
    if (user) {
      this.suggestedDonation = (this.amount * user.donationPercentage) / 100;
    }
  }
  next();
});

// Update user's total income after save
incomeSchema.post('save', async function() {
  const User = mongoose.model('User');
  const Income = mongoose.model('Income');
  
  const totalIncome = await Income.aggregate([
    { $match: { user: this.user } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const total = totalIncome.length > 0 ? totalIncome[0].total : 0;
  await User.findByIdAndUpdate(this.user, { totalIncome: total });
});

// Update user's total income after delete
incomeSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const User = mongoose.model('User');
    const Income = mongoose.model('Income');
    
    const totalIncome = await Income.aggregate([
      { $match: { user: doc.user } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const total = totalIncome.length > 0 ? totalIncome[0].total : 0;
    await User.findByIdAndUpdate(doc.user, { totalIncome: total });
  }
});

// Indexes for performance
incomeSchema.index({ user: 1, date: -1 });
incomeSchema.index({ source: 1 });
incomeSchema.index({ createdAt: -1 });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;

