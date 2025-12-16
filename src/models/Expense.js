const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Expense Details
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
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
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'food',
        'travel',
        'bills',
        'shopping',
        'healthcare',
        'education',
        'entertainment',
        'housing',
        'transportation',
        'utilities',
        'insurance',
        'personal',
        'charity',
        'other'
      ],
      message: '{VALUE} is not a valid category'
    },
    index: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Timing
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  
  // Receipt Management
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
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank-transfer', 'wallet', 'other'],
    default: 'cash'
  },
  
  vendor: {
    type: String,
    trim: true,
    maxlength: 200
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
  
  // Tracking
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null]
  },
  
  // AI Features
  autoCategorizied: {
    type: Boolean,
    default: false
  },
  
  needsReview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update user's total expenses after save
expenseSchema.post('save', async function() {
  const User = mongoose.model('User');
  const Expense = mongoose.model('Expense');
  
  const totalExpenses = await Expense.aggregate([
    { $match: { user: this.user } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const total = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
  await User.findByIdAndUpdate(this.user, { totalExpenses: total });
});

// Update user's total expenses after delete
expenseSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const User = mongoose.model('User');
    const Expense = mongoose.model('Expense');
    
    const totalExpenses = await Expense.aggregate([
      { $match: { user: doc.user } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const total = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
    await User.findByIdAndUpdate(doc.user, { totalExpenses: total });
  }
});

// Indexes for performance
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdAt: -1 });
expenseSchema.index({ user: 1, category: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;

