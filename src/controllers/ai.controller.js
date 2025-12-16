const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Donation = require('../models/Donation');
const openaiService = require('../config/openai');
const { asyncHandler } = require('../middleware/error.middleware');
const { getDateRange } = require('../utils/helpers');

/**
 * @desc    Get AI financial advice
 * @route   POST /api/ai/financial-advice
 * @access  Private (Pro tier)
 */
const getFinancialAdvice = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  
  // Get financial data
  const { startDate, endDate } = getDateRange('month');
  
  const [income, expenses, donations] = await Promise.all([
    Income.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } }),
    Expense.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } }),
    Donation.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } })
  ]);
  
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalDonations = donations.reduce((sum, item) => sum + item.amount, 0);
  
  const userData = {
    totalIncome,
    totalExpenses,
    totalDonations,
    donationGoal: user.currentDonationGoal,
    remainingGoal: user.remainingDonationGoal,
    currency: user.currency
  };
  
  try {
    const advice = await openaiService.getFinancialAdvice(userData);
    
    res.status(200).json({
      status: 'success',
      data: {
        advice,
        userData,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    // Fallback advice if AI service fails
    const fallbackAdvice = generateFallbackAdvice(userData);
    
    res.status(200).json({
      status: 'success',
      data: {
        advice: fallbackAdvice,
        userData,
        note: 'Generated using fallback system',
        generatedAt: new Date()
      }
    });
  }
});

/**
 * @desc    Get AI donation recommendations
 * @route   POST /api/ai/donation-recommendations
 * @access  Private
 */
const getDonationRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  
  // Calculate financial stability
  const { startDate, endDate } = getDateRange('month');
  
  const [income, expenses] = await Promise.all([
    Income.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } }),
    Expense.find({ user: req.userId, date: { $gte: startDate, $lte: endDate } })
  ]);
  
  const monthlyIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const monthlyExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
  
  let stability = 'low';
  if (savingsRate > 30) stability = 'high';
  else if (savingsRate > 15) stability = 'medium';
  
  const userData = {
    monthlyIncome,
    currentDonationPercentage: user.donationPercentage,
    stability
  };
  
  try {
    const recommendations = await openaiService.getDonationRecommendations(userData);
    
    res.status(200).json({
      status: 'success',
      data: {
        recommendations,
        userData,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    // Fallback recommendations
    const fallbackRecommendations = generateFallbackRecommendations(userData);
    
    res.status(200).json({
      status: 'success',
      data: {
        recommendations: fallbackRecommendations,
        userData,
        note: 'Generated using fallback system',
        generatedAt: new Date()
      }
    });
  }
});

/**
 * @desc    Auto-categorize expense
 * @route   POST /api/ai/categorize-expense
 * @access  Private
 */
const categorizeExpense = asyncHandler(async (req, res) => {
  const { description, amount } = req.body;
  
  if (!description) {
    return res.status(400).json({
      status: 'error',
      message: 'Description is required'
    });
  }
  
  try {
    const category = await openaiService.categorizeExpense(description, amount);
    
    res.status(200).json({
      status: 'success',
      data: {
        category: category.trim().toLowerCase(),
        description,
        amount
      }
    });
  } catch (error) {
    // Fallback categorization using keywords
    const category = categorizeFallback(description);
    
    res.status(200).json({
      status: 'success',
      data: {
        category,
        description,
        amount,
        note: 'Generated using fallback system'
      }
    });
  }
});

/**
 * @desc    Generate impact story
 * @route   POST /api/ai/impact-story
 * @access  Private (Pro tier)
 */
const generateImpactStory = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;
  
  const query = { user: req.userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  const donations = await Donation.find(query).sort({ date: -1 }).limit(10);
  
  if (donations.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No donations found for the specified period'
    });
  }
  
  try {
    const story = await openaiService.generateImpactStory(donations);
    
    res.status(200).json({
      status: 'success',
      data: {
        story,
        donationsCount: donations.length,
        totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
        generatedAt: new Date()
      }
    });
  } catch (error) {
    // Fallback story
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const story = `Through ${donations.length} generous donations totaling ${totalAmount}, you've made a meaningful difference in the lives of many. Your commitment to giving back demonstrates compassion and creates ripples of positive change in the world.`;
    
    res.status(200).json({
      status: 'success',
      data: {
        story,
        donationsCount: donations.length,
        totalAmount,
        note: 'Generated using fallback system',
        generatedAt: new Date()
      }
    });
  }
});

/**
 * @desc    Forecast future donations
 * @route   GET /api/ai/forecast
 * @access  Private (Pro tier)
 */
const forecastDonations = asyncHandler(async (req, res) => {
  const { months = 3 } = req.query;
  
  // Get historical donation data
  const donations = await Donation.find({ user: req.userId })
    .sort({ date: 1 })
    .limit(100);
  
  if (donations.length < 3) {
    return res.status(400).json({
      status: 'error',
      message: 'Insufficient data for forecasting. At least 3 donations required.'
    });
  }
  
  // Group by month
  const monthlyData = donations.reduce((acc, donation) => {
    const month = new Date(donation.date).toISOString().substring(0, 7);
    if (!acc[month]) {
      acc[month] = { total: 0, count: 0 };
    }
    acc[month].total += donation.amount;
    acc[month].count++;
    return acc;
  }, {});
  
  const historicalData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    amount: data.total,
    count: data.count
  }));
  
  try {
    const forecastStr = await openaiService.forecastDonations(historicalData);
    
    // Try to parse the response as JSON
    let forecast;
    try {
      forecast = JSON.parse(forecastStr);
    } catch {
      // If parsing fails, create simple forecast
      forecast = createSimpleForecast(historicalData, parseInt(months));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        forecast,
        historicalData: historicalData.slice(-6),
        generatedAt: new Date()
      }
    });
  } catch (error) {
    // Fallback forecast using simple average
    const forecast = createSimpleForecast(historicalData, parseInt(months));
    
    res.status(200).json({
      status: 'success',
      data: {
        forecast,
        historicalData: historicalData.slice(-6),
        note: 'Generated using fallback system',
        generatedAt: new Date()
      }
    });
  }
});

// Helper functions

function generateFallbackAdvice(userData) {
  const tips = [];
  
  const savingsRate = ((userData.totalIncome - userData.totalExpenses - userData.totalDonations) / userData.totalIncome) * 100;
  
  if (savingsRate < 10) {
    tips.push('Your savings rate is low. Try to reduce unnecessary expenses to improve your financial stability.');
  }
  
  if (userData.totalDonations < userData.donationGoal) {
    const remaining = userData.donationGoal - userData.totalDonations;
    tips.push(`You're ${remaining} away from your donation goal. Consider setting aside small amounts regularly.`);
  }
  
  const expenseRate = (userData.totalExpenses / userData.totalIncome) * 100;
  if (expenseRate > 70) {
    tips.push('Your expenses are high relative to income. Review your spending categories to identify areas for reduction.');
  }
  
  tips.push('Set up automatic transfers to a savings account to build your emergency fund.');
  
  return tips.join('\n\n');
}

function generateFallbackRecommendations(userData) {
  let recommendedPercentage = 5;
  
  if (userData.stability === 'high') {
    recommendedPercentage = 7;
  } else if (userData.stability === 'low') {
    recommendedPercentage = 2;
  }
  
  return `Based on your financial stability (${userData.stability}), we recommend donating ${recommendedPercentage}% of your income.\n\nSuggested causes:\n- Education programs for underprivileged children\n- Healthcare initiatives in your community\n- Environmental conservation projects\n\nStart small and increase gradually as your income grows.`;
}

function categorizeFallback(description) {
  const desc = description.toLowerCase();
  
  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('grocery')) return 'food';
  if (desc.includes('uber') || desc.includes('taxi') || desc.includes('bus') || desc.includes('train')) return 'travel';
  if (desc.includes('electric') || desc.includes('water') || desc.includes('gas') || desc.includes('bill')) return 'bills';
  if (desc.includes('shop') || desc.includes('store') || desc.includes('mall')) return 'shopping';
  if (desc.includes('doctor') || desc.includes('hospital') || desc.includes('medicine')) return 'healthcare';
  if (desc.includes('school') || desc.includes('course') || desc.includes('book')) return 'education';
  if (desc.includes('movie') || desc.includes('game') || desc.includes('concert')) return 'entertainment';
  
  return 'other';
}

function createSimpleForecast(historicalData, months) {
  const recentData = historicalData.slice(-3);
  const avgAmount = recentData.reduce((sum, d) => sum + d.amount, 0) / recentData.length;
  
  const forecast = [];
  for (let i = 1; i <= months; i++) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + i);
    
    forecast.push({
      month: futureDate.toISOString().substring(0, 7),
      predictedAmount: Math.round(avgAmount),
      confidence: historicalData.length > 6 ? 'medium' : 'low'
    });
  }
  
  return forecast;
}

module.exports = {
  getFinancialAdvice,
  getDonationRecommendations,
  categorizeExpense,
  generateImpactStory,
  forecastDonations
};

