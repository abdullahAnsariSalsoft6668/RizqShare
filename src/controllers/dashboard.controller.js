const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Donation = require('../models/Donation');
const { asyncHandler } = require('../middleware/error.middleware');
const { getDateRange } = require('../utils/helpers');
const {
  calculateSavings,
  calculateSavingsRate,
  calculateDonationProgress,
  calculateExpenseDistribution,
  calculateTrend,
  calculateFinancialHealth,
  projectFutureDonations
} = require('../utils/calculations');
const moment = require('moment');

/**
 * @desc    Get dashboard summary
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
  // Get user
  const user = await User.findById(req.userId);
  
  // Get date range
  const { startDate, endDate } = getDateRange(period);
  
  // Get all financial data for the period
  const [income, expenses, donations] = await Promise.all([
    Income.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } }),
    Expense.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } }),
    Donation.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } })
  ]);
  
  // Calculate totals
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalDonations = donations.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate derived metrics
  const savings = calculateSavings(totalIncome, totalExpenses, totalDonations);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses, totalDonations);
  const donationGoal = user.currentDonationGoal;
  const donationProgress = calculateDonationProgress(totalDonations, donationGoal);
  
  // Financial health score
  const financialHealth = calculateFinancialHealth(totalIncome, totalExpenses, totalDonations, savings);
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      startDate,
      endDate,
      summary: {
        income: {
          total: totalIncome,
          count: income.length,
          currency: user.currency
        },
        expenses: {
          total: totalExpenses,
          count: expenses.length,
          currency: user.currency
        },
        donations: {
          total: totalDonations,
          count: donations.length,
          goal: donationGoal,
          progress: Math.round(donationProgress * 100) / 100,
          remaining: Math.max(0, donationGoal - totalDonations),
          currency: user.currency
        },
        savings: {
          amount: savings,
          rate: Math.round(savingsRate * 100) / 100,
          currency: user.currency
        },
        scores: {
          givingScore: user.givingScore,
          financialHealth
        }
      }
    }
  });
});

/**
 * @desc    Get financial trends
 * @route   GET /api/dashboard/trends
 * @access  Private
 */
const getTrends = asyncHandler(async (req, res) => {
  const { period = 'month', months = 6 } = req.query;
  
  const user = await User.findById(req.userId);
  const monthsCount = parseInt(months) || 6;
  
  // Get data for last N months
  const trends = [];
  
  for (let i = monthsCount - 1; i >= 0; i--) {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() - i);
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 1);
    
    const [income, expenses, donations] = await Promise.all([
      Income.find({ user: req.userId, date: { $gte: startDate, $lt: endDate } }),
      Expense.find({ user: req.userId, date: { $gte: startDate, $lt: endDate } }),
      Donation.find({ user: req.userId, date: { $gte: startDate, $lt: endDate } })
    ]);
    
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalDonations = donations.reduce((sum, item) => sum + item.amount, 0);
    
    trends.push({
      month: moment(startDate).format('YYYY-MM'),
      income: totalIncome,
      expenses: totalExpenses,
      donations: totalDonations,
      savings: calculateSavings(totalIncome, totalExpenses, totalDonations)
    });
  }
  
  // Calculate trend directions
  const latestMonth = trends[trends.length - 1];
  const previousMonth = trends[trends.length - 2] || latestMonth;
  
  const trendDirections = {
    income: calculateTrend(latestMonth.income, previousMonth.income),
    expenses: calculateTrend(latestMonth.expenses, previousMonth.expenses),
    donations: calculateTrend(latestMonth.donations, previousMonth.donations),
    savings: calculateTrend(latestMonth.savings, previousMonth.savings)
  };
  
  res.status(200).json({
    status: 'success',
    data: {
      trends,
      trendDirections,
      currency: user.currency
    }
  });
});

/**
 * @desc    Get giving score details
 * @route   GET /api/dashboard/giving-score
 * @access  Private
 */
const getGivingScore = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  
  // Get all donations
  const donations = await Donation.find({ user: req.userId }).sort({ date: 1 });
  
  // Calculate giving score components
  const donationRate = user.totalIncome > 0 ? (user.totalDonated / user.totalIncome) * 100 : 0;
  const goalAchievement = user.currentDonationGoal > 0 
    ? (user.totalDonated / user.currentDonationGoal) * 100 
    : 0;
  
  // Consistency metrics
  let consistencyScore = 0;
  let averageDaysBetween = 0;
  
  if (donations.length > 1) {
    let totalDays = 0;
    for (let i = 1; i < donations.length; i++) {
      const daysDiff = Math.abs(
        (new Date(donations[i].date) - new Date(donations[i - 1].date)) / (1000 * 60 * 60 * 24)
      );
      totalDays += daysDiff;
    }
    averageDaysBetween = totalDays / (donations.length - 1);
    
    if (averageDaysBetween <= 7) consistencyScore = 100;
    else if (averageDaysBetween <= 14) consistencyScore = 80;
    else if (averageDaysBetween <= 30) consistencyScore = 60;
    else if (averageDaysBetween <= 60) consistencyScore = 40;
    else consistencyScore = 20;
  }
  
  // Get milestones
  const milestones = [];
  
  if (donations.length >= 1) milestones.push({ name: 'First Donation', achieved: true });
  if (donations.length >= 10) milestones.push({ name: '10 Donations', achieved: true });
  if (donations.length >= 50) milestones.push({ name: '50 Donations', achieved: true });
  if (user.totalDonated >= 10000) milestones.push({ name: '₹10,000 Donated', achieved: true });
  if (user.totalDonated >= 50000) milestones.push({ name: '₹50,000 Donated', achieved: true });
  if (donationRate >= 5) milestones.push({ name: '5% Donation Rate', achieved: true });
  
  // Next milestone
  let nextMilestone = null;
  if (donations.length < 10) nextMilestone = { name: '10 Donations', remaining: 10 - donations.length };
  else if (donations.length < 50) nextMilestone = { name: '50 Donations', remaining: 50 - donations.length };
  else if (user.totalDonated < 10000) nextMilestone = { name: '₹10,000 Donated', remaining: 10000 - user.totalDonated };
  
  res.status(200).json({
    status: 'success',
    data: {
      givingScore: user.givingScore,
      breakdown: {
        donationRate: {
          score: Math.round(donationRate * 100) / 100,
          weight: 40,
          description: 'Percentage of income donated'
        },
        consistency: {
          score: consistencyScore,
          weight: 30,
          averageDaysBetween: Math.round(averageDaysBetween),
          description: 'Frequency of donations'
        },
        goalAchievement: {
          score: Math.round(goalAchievement * 100) / 100,
          weight: 30,
          description: 'Progress towards donation goal'
        }
      },
      milestones,
      nextMilestone,
      totalDonations: donations.length,
      totalDonated: user.totalDonated,
      currency: user.currency
    }
  });
});

/**
 * @desc    Get category breakdown
 * @route   GET /api/dashboard/categories
 * @access  Private
 */
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
  const user = await User.findById(req.userId);
  const { startDate, endDate } = getDateRange(period);
  
  // Get expenses and donations
  const [expenses, donations] = await Promise.all([
    Expense.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } }),
    Donation.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } })
  ]);
  
  // Expense distribution
  const expenseDistribution = calculateExpenseDistribution(expenses);
  
  // Donation distribution
  const donationDistribution = {};
  let totalDonations = 0;
  
  donations.forEach(donation => {
    const category = donation.category || 'other';
    donationDistribution[category] = (donationDistribution[category] || 0) + donation.amount;
    totalDonations += donation.amount;
  });
  
  // Convert to percentage
  Object.keys(donationDistribution).forEach(category => {
    const amount = donationDistribution[category];
    donationDistribution[category] = {
      amount,
      percentage: totalDonations > 0 ? (amount / totalDonations) * 100 : 0
    };
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      expenses: expenseDistribution,
      donations: donationDistribution,
      currency: user.currency
    }
  });
});

/**
 * @desc    Get predictions
 * @route   GET /api/dashboard/predictions
 * @access  Private
 */
const getPredictions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  
  // Get all historical data
  const [allIncome, allExpenses, allDonations] = await Promise.all([
    Income.find({ user: req.userId }).sort({ date: 1 }),
    Expense.find({ user: req.userId }).sort({ date: 1 }),
    Donation.find({ user: req.userId }).sort({ date: 1 })
  ]);
  
  // Calculate monthly averages (last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const recentIncome = allIncome.filter(i => new Date(i.date) >= threeMonthsAgo);
  const recentExpenses = allExpenses.filter(e => new Date(e.date) >= threeMonthsAgo);
  const recentDonations = allDonations.filter(d => new Date(d.date) >= threeMonthsAgo);
  
  const avgMonthlyIncome = recentIncome.reduce((sum, i) => sum + i.amount, 0) / 3;
  const avgMonthlyExpense = recentExpenses.reduce((sum, e) => sum + e.amount, 0) / 3;
  const avgMonthlyDonation = recentDonations.reduce((sum, d) => sum + d.amount, 0) / 3;
  
  // Project next 3 months
  const donationProjections = projectFutureDonations(recentDonations, 3);
  
  res.status(200).json({
    status: 'success',
    data: {
      averages: {
        monthlyIncome: Math.round(avgMonthlyIncome),
        monthlyExpense: Math.round(avgMonthlyExpense),
        monthlyDonation: Math.round(avgMonthlyDonation),
        monthlySavings: Math.round(avgMonthlyIncome - avgMonthlyExpense - avgMonthlyDonation)
      },
      projections: donationProjections,
      currency: user.currency,
      note: 'Predictions based on last 3 months of data'
    }
  });
});

module.exports = {
  getDashboardSummary,
  getTrends,
  getGivingScore,
  getCategoryBreakdown,
  getPredictions
};

