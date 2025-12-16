const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Donation = require('../models/Donation');
const User = require('../models/User');

/**
 * Analytics service for generating insights
 */
class AnalyticsService {
  
  /**
   * Get user's financial overview
   */
  async getUserFinancialOverview(userId, startDate, endDate) {
    const [income, expenses, donations] = await Promise.all([
      Income.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
      Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
      Donation.find({ user: userId, date: { $gte: startDate, $lte: endDate } })
    ]);
    
    return {
      income: {
        items: income,
        total: income.reduce((sum, i) => sum + i.amount, 0),
        count: income.length
      },
      expenses: {
        items: expenses,
        total: expenses.reduce((sum, e) => sum + e.amount, 0),
        count: expenses.length
      },
      donations: {
        items: donations,
        total: donations.reduce((sum, d) => sum + d.amount, 0),
        count: donations.length
      }
    };
  }
  
  /**
   * Calculate spending patterns
   */
  async getSpendingPatterns(userId, months = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const expenses = await Expense.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Group by day of week
    const byDayOfWeek = expenses.reduce((acc, expense) => {
      const day = new Date(expense.date).getDay();
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {});
    
    // Group by category
    const byCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    // Average daily spending
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgDailySpending = totalSpent / days;
    
    return {
      byDayOfWeek,
      byCategory,
      avgDailySpending,
      totalSpent,
      periodDays: days
    };
  }
  
  /**
   * Get donation insights
   */
  async getDonationInsights(userId) {
    const donations = await Donation.find({ user: userId }).sort({ date: 1 });
    
    if (donations.length === 0) {
      return {
        totalDonated: 0,
        donationCount: 0,
        averageDonation: 0,
        favoriteCategory: null,
        consistency: 0
      };
    }
    
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const averageDonation = totalDonated / donations.length;
    
    // Find favorite category
    const categoryCount = donations.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {});
    
    const favoriteCategory = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    // Calculate consistency
    let totalDays = 0;
    for (let i = 1; i < donations.length; i++) {
      const daysDiff = Math.abs(
        (new Date(donations[i].date) - new Date(donations[i - 1].date)) / (1000 * 60 * 60 * 24)
      );
      totalDays += daysDiff;
    }
    
    const avgDaysBetween = donations.length > 1 ? totalDays / (donations.length - 1) : 0;
    let consistency = 0;
    if (avgDaysBetween <= 7) consistency = 100;
    else if (avgDaysBetween <= 14) consistency = 80;
    else if (avgDaysBetween <= 30) consistency = 60;
    else if (avgDaysBetween <= 60) consistency = 40;
    else consistency = 20;
    
    return {
      totalDonated,
      donationCount: donations.length,
      averageDonation,
      favoriteCategory,
      consistency,
      avgDaysBetween: Math.round(avgDaysBetween)
    };
  }
  
  /**
   * Update user analytics
   */
  async updateUserAnalytics(userId) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    // Recalculate giving score
    user.calculateGivingScore();
    await user.save();
    
    return user;
  }
}

module.exports = new AnalyticsService();

