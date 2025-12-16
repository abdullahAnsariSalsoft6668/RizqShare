/**
 * Calculate donation goal based on income and percentage
 */
const calculateDonationGoal = (income, percentage) => {
  return (income * percentage) / 100;
};

/**
 * Calculate donation progress
 */
const calculateDonationProgress = (donated, goal) => {
  if (goal === 0) return 0;
  return Math.min((donated / goal) * 100, 100);
};

/**
 * Calculate remaining amount to reach goal
 */
const calculateRemainingGoal = (goal, donated) => {
  return Math.max(0, goal - donated);
};

/**
 * Calculate savings amount
 */
const calculateSavings = (income, expenses, donations) => {
  return income - expenses - donations;
};

/**
 * Calculate savings rate
 */
const calculateSavingsRate = (income, expenses, donations) => {
  if (income === 0) return 0;
  const savings = calculateSavings(income, expenses, donations);
  return (savings / income) * 100;
};

/**
 * Calculate burn rate (how many days until money runs out)
 */
const calculateBurnRate = (currentSavings, averageDailyExpense) => {
  if (averageDailyExpense === 0) return Infinity;
  return Math.floor(currentSavings / averageDailyExpense);
};

/**
 * Calculate category-wise expense distribution
 */
const calculateExpenseDistribution = (expenses) => {
  const distribution = {};
  let total = 0;
  
  expenses.forEach(expense => {
    const category = expense.category || 'other';
    distribution[category] = (distribution[category] || 0) + expense.amount;
    total += expense.amount;
  });
  
  // Convert to percentage
  Object.keys(distribution).forEach(category => {
    distribution[category] = {
      amount: distribution[category],
      percentage: total > 0 ? (distribution[category] / total) * 100 : 0
    };
  });
  
  return distribution;
};

/**
 * Calculate giving score
 */
const calculateGivingScore = (totalIncome, totalDonated, donationGoal, consistency) => {
  // Component 1: Donation rate (40%)
  const donationRate = totalIncome > 0 ? (totalDonated / totalIncome) * 100 : 0;
  const rateScore = Math.min(donationRate * 4, 40); // Max 40 points
  
  // Component 2: Consistency (30%)
  const consistencyScore = (consistency || 0) * 0.3; // Max 30 points
  
  // Component 3: Goal achievement (30%)
  const goalAchievement = donationGoal > 0 ? (totalDonated / donationGoal) * 100 : 0;
  const goalScore = Math.min(goalAchievement * 0.3, 30); // Max 30 points
  
  return Math.round(rateScore + consistencyScore + goalScore);
};

/**
 * Calculate donation consistency (how regularly user donates)
 */
const calculateDonationConsistency = (donations) => {
  if (donations.length === 0) return 0;
  if (donations.length === 1) return 20;
  
  // Sort by date
  const sortedDonations = donations.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate average days between donations
  let totalDays = 0;
  let gaps = 0;
  
  for (let i = 1; i < sortedDonations.length; i++) {
    const daysDiff = Math.abs(
      (new Date(sortedDonations[i].date) - new Date(sortedDonations[i - 1].date)) / (1000 * 60 * 60 * 24)
    );
    totalDays += daysDiff;
    gaps++;
  }
  
  const avgDaysBetween = gaps > 0 ? totalDays / gaps : 0;
  
  // Score based on frequency (lower days = higher score)
  // Daily (1-7 days): 100 points
  // Weekly (8-14 days): 80 points
  // Bi-weekly (15-30 days): 60 points
  // Monthly (31-60 days): 40 points
  // Quarterly (61-90 days): 20 points
  // Less frequent: 10 points
  
  if (avgDaysBetween <= 7) return 100;
  if (avgDaysBetween <= 14) return 80;
  if (avgDaysBetween <= 30) return 60;
  if (avgDaysBetween <= 60) return 40;
  if (avgDaysBetween <= 90) return 20;
  return 10;
};

/**
 * Calculate trend (increasing, decreasing, stable)
 */
const calculateTrend = (currentPeriod, previousPeriod) => {
  if (previousPeriod === 0) {
    return currentPeriod > 0 ? 'increasing' : 'stable';
  }
  
  const change = ((currentPeriod - previousPeriod) / previousPeriod) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
};

/**
 * Calculate average monthly amount
 */
const calculateMonthlyAverage = (items, months = 3) => {
  if (items.length === 0) return 0;
  
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return total / months;
};

/**
 * Project future donations based on historical data
 */
const projectFutureDonations = (donations, months = 3) => {
  if (donations.length === 0) return [];
  
  const monthlyAverage = calculateMonthlyAverage(donations);
  const projections = [];
  
  for (let i = 1; i <= months; i++) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + i);
    
    projections.push({
      month: futureDate.toISOString().substring(0, 7),
      projectedAmount: Math.round(monthlyAverage),
      confidence: donations.length > 5 ? 'high' : 'medium'
    });
  }
  
  return projections;
};

/**
 * Calculate financial health score
 */
const calculateFinancialHealth = (income, expenses, donations, savings) => {
  let score = 0;
  
  // Expense ratio (40 points)
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 100;
  if (expenseRatio < 50) score += 40;
  else if (expenseRatio < 70) score += 30;
  else if (expenseRatio < 85) score += 20;
  else score += 10;
  
  // Donation ratio (20 points)
  const donationRatio = income > 0 ? (donations / income) * 100 : 0;
  if (donationRatio >= 5) score += 20;
  else if (donationRatio >= 2) score += 15;
  else if (donationRatio >= 1) score += 10;
  else score += 5;
  
  // Savings ratio (40 points)
  const savingsRatio = income > 0 ? (savings / income) * 100 : 0;
  if (savingsRatio >= 30) score += 40;
  else if (savingsRatio >= 20) score += 30;
  else if (savingsRatio >= 10) score += 20;
  else score += 10;
  
  return Math.round(score);
};

module.exports = {
  calculateDonationGoal,
  calculateDonationProgress,
  calculateRemainingGoal,
  calculateSavings,
  calculateSavingsRate,
  calculateBurnRate,
  calculateExpenseDistribution,
  calculateGivingScore,
  calculateDonationConsistency,
  calculateTrend,
  calculateMonthlyAverage,
  projectFutureDonations,
  calculateFinancialHealth
};

