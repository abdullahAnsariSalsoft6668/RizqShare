const Income = require('../models/Income');
const { asyncHandler } = require('../middleware/error.middleware');
const { paginate, buildPaginationResponse, getDateRange } = require('../utils/helpers');
const moment = require('moment');

/**
 * @desc    Get all income entries
 * @route   GET /api/income
 * @access  Private
 */
const getAllIncome = asyncHandler(async (req, res) => {
  const { page, limit, source, startDate, endDate, sort } = req.query;
  
  // Build query
  const query = { user: req.userId };
  
  if (source) {
    query.source = source;
  }
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  // Pagination
  const { page: currentPage, limit: pageLimit, skip } = paginate(page, limit);
  
  // Sort
  const sortOption = sort === 'oldest' ? { date: 1 } : { date: -1 };
  
  // Execute query
  const [income, total] = await Promise.all([
    Income.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit)
      .lean(),
    Income.countDocuments(query)
  ]);
  
  res.status(200).json({
    status: 'success',
    ...buildPaginationResponse(income, currentPage, pageLimit, total)
  });
});

/**
 * @desc    Get single income entry
 * @route   GET /api/income/:id
 * @access  Private
 */
const getIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOne({
    _id: req.params.id,
    user: req.userId
  });
  
  if (!income) {
    return res.status(404).json({
      status: 'error',
      message: 'Income entry not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { income }
  });
});

/**
 * @desc    Add new income entry
 * @route   POST /api/income
 * @access  Private
 */
const addIncome = asyncHandler(async (req, res) => {
  const incomeData = {
    ...req.body,
    user: req.userId
  };
  
  const income = await Income.create(incomeData);
  
  res.status(201).json({
    status: 'success',
    message: 'Income added successfully',
    data: { income }
  });
});

/**
 * @desc    Update income entry
 * @route   PUT /api/income/:id
 * @access  Private
 */
const updateIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!income) {
    return res.status(404).json({
      status: 'error',
      message: 'Income entry not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Income updated successfully',
    data: { income }
  });
});

/**
 * @desc    Delete income entry
 * @route   DELETE /api/income/:id
 * @access  Private
 */
const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOneAndDelete({
    _id: req.params.id,
    user: req.userId
  });
  
  if (!income) {
    return res.status(404).json({
      status: 'error',
      message: 'Income entry not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Income deleted successfully'
  });
});

/**
 * @desc    Get income statistics
 * @route   GET /api/income/stats
 * @access  Private
 */
const getIncomeStats = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
  // Get date range
  const { startDate, endDate } = getDateRange(period);
  
  // Get all income for the period
  const income = await Income.find({
    user: req.userId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  // Calculate statistics
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const averageIncome = income.length > 0 ? totalIncome / income.length : 0;
  const suggestedDonation = income.reduce((sum, item) => sum + item.suggestedDonation, 0);
  
  // Group by source
  const bySource = income.reduce((acc, item) => {
    const source = item.source;
    if (!acc[source]) {
      acc[source] = { count: 0, total: 0 };
    }
    acc[source].count++;
    acc[source].total += item.amount;
    return acc;
  }, {});
  
  // Group by month (for trends)
  const byMonth = income.reduce((acc, item) => {
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
  
  const previousIncome = await Income.find({
    user: req.userId,
    date: { $gte: prevStartDate, $lte: prevEndDate }
  });
  
  const previousTotal = previousIncome.reduce((sum, item) => sum + item.amount, 0);
  const growth = previousTotal > 0 ? ((totalIncome - previousTotal) / previousTotal) * 100 : 0;
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      startDate,
      endDate,
      summary: {
        total: totalIncome,
        count: income.length,
        average: averageIncome,
        suggestedDonation,
        growth: Math.round(growth * 100) / 100
      },
      bySource,
      byMonth,
      recentEntries: income.slice(-5).reverse()
    }
  });
});

module.exports = {
  getAllIncome,
  getIncome,
  addIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats
};

