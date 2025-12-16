const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Donation Details
  recipient: {
    type: String,
    required: [true, 'Recipient is required'],
    trim: true,
    maxlength: [200, 'Recipient name cannot exceed 200 characters']
  },
  
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'AED']
  },
  
  // Purpose & Categorization
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'zakat',
        'sadaqah',
        'tithe',
        'education',
        'healthcare',
        'poverty-relief',
        'disaster-relief',
        'animal-welfare',
        'environment',
        'religious',
        'community',
        'other'
      ],
      message: '{VALUE} is not a valid donation category'
    },
    index: true
  },
  
  // Timing
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  
  // Organization Details
  organizationDetails: {
    name: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  // Verification & Documentation
  receipt: {
    url: {
      type: String
    },
    filename: {
      type: String
    },
    uploadedAt: {
      type: Date
    }
  },
  
  transactionId: {
    type: String,
    trim: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank-transfer', 'cheque', 'online', 'other'],
    default: 'cash'
  },
  
  // Tax Benefit
  isTaxDeductible: {
    type: Boolean,
    default: false
  },
  
  taxCertificate: {
    url: {
      type: String
    },
    uploadedAt: {
      type: Date
    }
  },
  
  // Metadata
  notes: {
    type: String,
    maxlength: 1000
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Recurring Donations
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly', null]
  },
  
  // Impact Tracking
  impactStory: {
    type: String,
    maxlength: 2000
  },
  
  beneficiariesHelped: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update user's total donations after save
donationSchema.post('save', async function() {
  const User = mongoose.model('User');
  const Donation = mongoose.model('Donation');
  
  const totalDonations = await Donation.aggregate([
    { $match: { user: this.user } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const total = totalDonations.length > 0 ? totalDonations[0].total : 0;
  const user = await User.findByIdAndUpdate(
    this.user, 
    { totalDonated: total },
    { new: true }
  );
  
  // Recalculate giving score
  if (user) {
    user.calculateGivingScore();
    await user.save();
  }
});

// Update user's total donations after delete
donationSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const User = mongoose.model('User');
    const Donation = mongoose.model('Donation');
    
    const totalDonations = await Donation.aggregate([
      { $match: { user: doc.user } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const total = totalDonations.length > 0 ? totalDonations[0].total : 0;
    const user = await User.findByIdAndUpdate(
      doc.user, 
      { totalDonated: total },
      { new: true }
    );
    
    // Recalculate giving score
    if (user) {
      user.calculateGivingScore();
      await user.save();
    }
  }
});

// Indexes for performance
donationSchema.index({ user: 1, date: -1 });
donationSchema.index({ category: 1 });
donationSchema.index({ recipient: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ user: 1, category: 1, date: -1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;

