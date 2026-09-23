const Donation = require('../models/Donation');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error.middleware');
const { paginate, buildPaginationResponse, getDateRange } = require('../utils/helpers');
const { resolveUserCurrency, resolveTransactionCurrency, normalizeCurrency } = require('../constants/currencies');
const { calculateDonationConsistency } = require('../utils/calculations');
const {
  getDonationObligations,
  buildProgressMessage,
  getProgressMetrics
} = require('../services/donation-obligation.service');
const moment = require('moment');

/**
 * @desc    Get all donations
 * @route   GET /api/donations
 * @access  Private
 */
const getAllDonations = asyncHandler(async (req, res) => {
  const { page, limit, category, startDate, endDate, sort, search } = req.query;
  
  // Build query
  const query = { user: req.userId };
  
  if (category) {
    query.category = category;
  }
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  if (search) {
    query.$or = [
      { recipient: { $regex: search, $options: 'i' } },
      { purpose: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Pagination
  const { page: currentPage, limit: pageLimit, skip } = paginate(page, limit);
  
  // Sort
  const sortOption = sort === 'oldest' ? { date: 1 } : { date: -1 };
  
  // Execute query
  const [donations, total] = await Promise.all([
    Donation.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit)
      .lean(),
    Donation.countDocuments(query)
  ]);
  
  res.status(200).json({
    status: 'success',
    ...buildPaginationResponse(donations, currentPage, pageLimit, total)
  });
});

/**
 * @desc    Get single donation
 * @route   GET /api/donations/:id
 * @access  Private
 */
const getDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findOne({
    _id: req.params.id,
    user: req.userId
  });
  
  if (!donation) {
    return res.status(404).json({
      status: 'error',
      message: 'Donation not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { donation }
  });
});

/**
 * @desc    Add new donation
 * @route   POST /api/donations
 * @access  Private
 */
const addDonation = asyncHandler(async (req, res) => {
  const donationData = {
    ...req.body,
    user: req.userId,
    currency: resolveTransactionCurrency(req.body.currency, req.user)
  };
  
  const donation = await Donation.create(donationData);
  
  res.status(201).json({
    status: 'success',
    message: 'Donation recorded successfully',
    data: { donation }
  });
});

/**
 * @desc    Update donation
 * @route   PUT /api/donations/:id
 * @access  Private
 */
const updateDonation = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (updates.currency == null || String(updates.currency).trim() === '') {
    delete updates.currency;
  } else {
    updates.currency = normalizeCurrency(updates.currency);
  }

  const donation = await Donation.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    updates,
    { new: true, runValidators: true }
  );
  
  if (!donation) {
    return res.status(404).json({
      status: 'error',
      message: 'Donation not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Donation updated successfully',
    data: { donation }
  });
});

/**
 * @desc    Delete donation
 * @route   DELETE /api/donations/:id
 * @access  Private
 */
const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findOneAndDelete({
    _id: req.params.id,
    user: req.userId
  });
  
  if (!donation) {
    return res.status(404).json({
      status: 'error',
      message: 'Donation not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Donation deleted successfully'
  });
});

/**
 * @desc    Upload donation receipt
 * @route   POST /api/donations/:id/receipt
 * @access  Private
 */
const uploadReceipt = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Please upload a receipt file'
    });
  }
  
  const receiptUrl = `/uploads/receipts/donations/${req.file.filename}`;
  
  const donation = await Donation.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    {
      receipt: {
        url: receiptUrl,
        filename: req.file.filename,
        uploadedAt: new Date()
      }
    },
    { new: true }
  );
  
  if (!donation) {
    return res.status(404).json({
      status: 'error',
      message: 'Donation not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Receipt uploaded successfully',
    data: {
      receipt: donation.receipt
    }
  });
});

/**
 * @desc    Get donation statistics
 * @route   GET /api/donations/stats
 * @access  Private
 */
const getDonationStats = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
  // Get date range
  const { startDate, endDate } = getDateRange(period);
  
  // Get user
  const user = await User.findById(req.userId);
  
  // Get all donations for the period
  const donations = await Donation.find({
    user: req.userId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  // Calculate statistics
  const totalDonations = donations.reduce((sum, item) => sum + item.amount, 0);
  const averageDonation = donations.length > 0 ? totalDonations / donations.length : 0;
  
  // Group by category
  const byCategory = donations.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = { count: 0, total: 0 };
    }
    acc[category].count++;
    acc[category].total += item.amount;
    return acc;
  }, {});
  
  // Top recipients
  const byRecipient = donations.reduce((acc, item) => {
    const recipient = item.recipient;
    if (!acc[recipient]) {
      acc[recipient] = { count: 0, total: 0 };
    }
    acc[recipient].count++;
    acc[recipient].total += item.amount;
    return acc;
  }, {});
  
  const topRecipients = Object.entries(byRecipient)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([recipient, data]) => ({
      recipient,
      ...data
    }));
  
  // Group by month for trends
  const byMonth = donations.reduce((acc, item) => {
    const month = moment(item.date).format('YYYY-MM');
    if (!acc[month]) {
      acc[month] = { count: 0, total: 0 };
    }
    acc[month].count++;
    acc[month].total += item.amount;
    return acc;
  }, {});
  
  // Get previous period for comparison
  const prevEndDate = startDate;
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - (endDate - startDate) / (1000 * 60 * 60 * 24));
  
  const previousDonations = await Donation.find({
    user: req.userId,
    date: { $gte: prevStartDate, $lte: prevEndDate }
  });
  
  const previousTotal = previousDonations.reduce((sum, item) => sum + item.amount, 0);
  const growth = previousTotal > 0 ? ((totalDonations - previousTotal) / previousTotal) * 100 : 0;
  
  // Consistency score
  const allDonations = await Donation.find({ user: req.userId }).sort({ date: 1 });
  const consistency = calculateDonationConsistency(allDonations);
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      startDate,
      endDate,
      summary: {
        total: totalDonations,
        count: donations.length,
        average: averageDonation,
        growth: Math.round(growth * 100) / 100,
        consistency,
        currency: resolveUserCurrency(user)
      },
      byCategory,
      byMonth,
      topRecipients,
      recentDonations: donations.slice(-5).reverse()
    }
  });
});

/**
 * @desc    Get donation progress
 * @route   GET /api/donations/progress
 * @access  Private
 */
const getDonationProgress = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  const obligation = await getDonationObligations(user);
  const metrics = getProgressMetrics(obligation);

  res.status(200).json({
    status: 'success',
    data: {
      period,
      donationGoal: metrics.donationGoal,
      totalDonated: metrics.totalDonated,
      remaining: metrics.remaining,
      progress: metrics.progress,
      donationPercentage: obligation.donationPercentage,
      currency: obligation.currency,
      currentMonth: obligation.currentMonth,
      carryOver: obligation.carryOver,
      prepaid: obligation.prepaid,
      totalPending: obligation.totalPending,
      totalDueAllTime: obligation.totalDueAllTime,
      totalPaidAllTime: obligation.totalPaidAllTime,
      message: buildProgressMessage(obligation)
    }
  });
});

/**
 * @desc    Get monthly donation obligations (history)
 * @route   GET /api/donations/obligations
 * @access  Private
 */
const getDonationObligationsHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  const obligation = await getDonationObligations(user, { months: req.query.months });

  res.status(200).json({
    status: 'success',
    data: obligation
  });
});

/**
 * @desc    Export donation report
 * @route   GET /api/donations/export
 * @access  Private
 */
const exportDonations = asyncHandler(async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  const query = { user: req.userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const donations = await Donation.find(query).sort({ date: -1 }).lean();
  
  const user = await User.findById(req.userId);
  
  const report = {
    user: {
      name: user.fullName,
      email: user.email
    },
    period: {
      startDate: startDate || 'Beginning',
      endDate: endDate || 'Now'
    },
    summary: {
      totalDonations: donations.reduce((sum, d) => sum + d.amount, 0),
      count: donations.length,
      currency: resolveUserCurrency(user)
    },
    donations: donations.map(d => ({
      date: d.date,
      recipient: d.recipient,
      amount: d.amount,
      currency: d.currency || resolveUserCurrency(user),
      purpose: d.purpose,
      category: d.category,
      transactionId: d.transactionId,
      isTaxDeductible: d.isTaxDeductible
    }))
  };
  
  if (format === 'csv') {
    // Simple CSV format
    const csv = [
      'Date,Recipient,Amount,Purpose,Category,Transaction ID,Tax Deductible',
      ...donations.map(d => 
        `${moment(d.date).format('YYYY-MM-DD')},${d.recipient},${d.amount},"${d.purpose}",${d.category},${d.transactionId || ''},${d.isTaxDeductible}`
      )
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=donations.csv');
    return res.send(csv);
  }
  
  res.status(200).json({
    status: 'success',
    data: report
  });
});

module.exports = {
  getAllDonations,
  getDonation,
  addDonation,
  updateDonation,
  deleteDonation,
  uploadReceipt,
  getDonationStats,
  getDonationProgress,
  getDonationObligationsHistory,
  exportDonations
};

