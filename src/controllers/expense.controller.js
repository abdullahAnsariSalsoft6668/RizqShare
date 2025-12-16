const Expense = require('../models/Expense');
const { asyncHandler } = require('../middleware/error.middleware');
const { paginate, buildPaginationResponse, getDateRange } = require('../utils/helpers');
const { calculateExpenseDistribution } = require('../utils/calculations');
const moment = require('moment');

/**
 * @desc    Get all expenses
 * @route   GET /api/expenses
 * @access  Private
 */
const getAllExpenses = asyncHandler(async (req, res) => {
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
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { vendor: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Pagination
  const { page: currentPage, limit: pageLimit, skip } = paginate(page, limit);
  
  // Sort
  const sortOption = sort === 'oldest' ? { date: 1 } : { date: -1 };
  
  // Execute query
  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit)
      .lean(),
    Expense.countDocuments(query)
  ]);
  
  res.status(200).json({
    status: 'success',
    ...buildPaginationResponse(expenses, currentPage, pageLimit, total)
  });
});

/**
 * @desc    Get single expense
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.userId
  });
  
  if (!expense) {
    return res.status(404).json({
      status: 'error',
      message: 'Expense not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { expense }
  });
});

/**
 * @desc    Add new expense
 * @route   POST /api/expenses
 * @access  Private
 */
const addExpense = asyncHandler(async (req, res) => {
  const expenseData = {
    ...req.body,
    user: req.userId
  };
  
  const expense = await Expense.create(expenseData);
  
  res.status(201).json({
    status: 'success',
    message: 'Expense added successfully',
    data: { expense }
  });
});

/**
 * @desc    Update expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!expense) {
    return res.status(404).json({
      status: 'error',
      message: 'Expense not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Expense updated successfully',
    data: { expense }
  });
});

/**
 * @desc    Delete expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.userId
  });
  
  if (!expense) {
    return res.status(404).json({
      status: 'error',
      message: 'Expense not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Expense deleted successfully'
  });
});

/**
 * @desc    Upload expense receipt
 * @route   POST /api/expenses/:id/receipt
 * @access  Private
 */
const uploadReceipt = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Please upload a receipt file'
    });
  }
  
  const receiptUrl = `/uploads/receipts/expenses/${req.file.filename}`;
  
  const expense = await Expense.findOneAndUpdate(
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
  
  if (!expense) {
    return res.status(404).json({
      status: 'error',
      message: 'Expense not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Receipt uploaded successfully',
    data: {
      receipt: expense.receipt
    }
  });
});

/**
 * @desc    Get expense statistics
 * @route   GET /api/expenses/stats
 * @access  Private
 */
const getExpenseStats = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
  // Get date range
  const { startDate, endDate } = getDateRange(period);
  
  // Get all expenses for the period
  const expenses = await Expense.find({
    user: req.userId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  
  // Category distribution
  const distribution = calculateExpenseDistribution(expenses);
  
  // Top categories
  const topCategories = Object.entries(distribution)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5)
    .map(([category, data]) => ({
      category,
      ...data
    }));
  
  // Group by date for trends
  const byDate = expenses.reduce((acc, item) => {
    const date = moment(item.date).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = { count: 0, total: 0 };
    }
    acc[date].count++;
    acc[date].total += item.amount;
    return acc;
  }, {});
  
  // Group by month
  const byMonth = expenses.reduce((acc, item) => {
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
  
  const previousExpenses = await Expense.find({
    user: req.userId,
    date: { $gte: prevStartDate, $lte: prevEndDate }
  });
  
  const previousTotal = previousExpenses.reduce((sum, item) => sum + item.amount, 0);
  const growth = previousTotal > 0 ? ((totalExpenses - previousTotal) / previousTotal) * 100 : 0;
  
  // Payment method breakdown
  const byPaymentMethod = expenses.reduce((acc, item) => {
    const method = item.paymentMethod || 'other';
    if (!acc[method]) {
      acc[method] = { count: 0, total: 0 };
    }
    acc[method].count++;
    acc[method].total += item.amount;
    return acc;
  }, {});
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      startDate,
      endDate,
      summary: {
        total: totalExpenses,
        count: expenses.length,
        average: averageExpense,
        growth: Math.round(growth * 100) / 100
      },
      distribution,
      topCategories,
      byDate,
      byMonth,
      byPaymentMethod,
      recentExpenses: expenses.slice(-5).reverse()
    }
  });
});

module.exports = {
  getAllExpenses,
  getExpense,
  addExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  getExpenseStats
};

