const moment = require('moment');
const Income = require('../models/Income');
const Donation = require('../models/Donation');
const { resolveUserCurrency } = require('../constants/currencies');
const {
  calculateDonationGoal,
  calculateDonationProgress
} = require('../utils/calculations');

const roundMoney = (value) => {
  const amount = Number(value) || 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

const toYearMonth = (date) => moment(date).format('YYYY-MM');

const nextYearMonth = (yearMonth) => moment(yearMonth, 'YYYY-MM').add(1, 'month').format('YYYY-MM');

const monthStatus = (due, paid, remaining) => {
  if (due > 0 && remaining <= 0) return 'paid';
  if (paid > 0 && remaining > 0) return 'partial';
  if (due <= 0 && paid <= 0) return 'paid';
  return 'pending';
};

const emptyCurrentMonth = (yearMonth) => ({
  yearMonth,
  incomeTotal: 0,
  due: 0,
  paid: 0,
  remaining: 0,
  status: 'paid'
});

const listYearMonths = (startYearMonth, endYearMonth) => {
  const months = [];
  let cursor = startYearMonth;

  while (cursor <= endYearMonth) {
    months.push(cursor);
    cursor = nextYearMonth(cursor);
    if (months.length > 240) break;
  }

  return months;
};

const summarizeMonth = (month) => ({
  yearMonth: month.yearMonth,
  incomeTotal: month.incomeTotal,
  due: month.due,
  paid: month.paid,
  remaining: month.remaining
});

/**
 * Pure FIFO ledger: monthly due from income, donations clear oldest remaining first.
 */
const buildObligationLedger = ({
  incomes = [],
  donations = [],
  percentage = 5,
  now = new Date(),
  currency = 'PKR'
}) => {
  const donationPercentage = Number(percentage) || 0;
  const nowMonth = toYearMonth(now);

  const datedItems = [...incomes, ...donations].filter((item) => item && item.date);
  if (datedItems.length === 0) {
    const currentMonth = emptyCurrentMonth(nowMonth);
    return {
      donationPercentage,
      currency,
      currentMonth: summarizeMonth(currentMonth),
      carryOver: { remaining: 0, months: [] },
      prepaid: 0,
      totalPending: 0,
      totalDueAllTime: 0,
      totalPaidAllTime: 0,
      months: []
    };
  }

  const earliest = datedItems.reduce((min, item) => {
    const ym = toYearMonth(item.date);
    return ym < min ? ym : min;
  }, nowMonth);

  const incomeByMonth = {};
  incomes.forEach((income) => {
    if (!income?.date) return;
    const yearMonth = toYearMonth(income.date);
    incomeByMonth[yearMonth] = roundMoney((incomeByMonth[yearMonth] || 0) + (income.amount || 0));
  });

  const months = listYearMonths(earliest, nowMonth).map((yearMonth) => {
    const incomeTotal = roundMoney(incomeByMonth[yearMonth] || 0);
    const due = roundMoney(calculateDonationGoal(incomeTotal, donationPercentage));
    return {
      yearMonth,
      incomeTotal,
      due,
      paid: 0,
      remaining: due
    };
  });

  const sortedDonations = [...donations].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let prepaid = 0;
  sortedDonations.forEach((donation) => {
    let leftover = roundMoney(donation.amount);
    months.forEach((month) => {
      if (leftover <= 0 || month.remaining <= 0) return;
      const applied = Math.min(leftover, month.remaining);
      month.paid = roundMoney(month.paid + applied);
      month.remaining = roundMoney(month.remaining - applied);
      leftover = roundMoney(leftover - applied);
    });
    if (leftover > 0) {
      prepaid = roundMoney(prepaid + leftover);
    }
  });

  const ledger = months
    .map((month) => ({
      ...month,
      status: monthStatus(month.due, month.paid, month.remaining)
    }))
    .filter((month) => month.incomeTotal > 0 || month.paid > 0 || month.remaining > 0);

  const currentFromLedger = ledger.find((month) => month.yearMonth === nowMonth);
  const currentMonth = currentFromLedger || emptyCurrentMonth(nowMonth);

  const carryMonths = ledger.filter(
    (month) => month.yearMonth < nowMonth && month.remaining > 0
  );
  const carryRemaining = roundMoney(
    carryMonths.reduce((sum, month) => sum + month.remaining, 0)
  );

  const totalDueAllTime = roundMoney(ledger.reduce((sum, month) => sum + month.due, 0));
  const totalPaidAllTime = roundMoney(ledger.reduce((sum, month) => sum + month.paid, 0));
  const totalPending = roundMoney(carryRemaining + currentMonth.remaining);

  return {
    donationPercentage,
    currency,
    currentMonth: summarizeMonth(currentMonth),
    carryOver: {
      remaining: carryRemaining,
      months: carryMonths.map((month) => ({
        yearMonth: month.yearMonth,
        incomeTotal: month.incomeTotal,
        due: month.due,
        paid: month.paid,
        remaining: month.remaining,
        status: month.status
      }))
    },
    prepaid,
    totalPending,
    totalDueAllTime,
    totalPaidAllTime,
    months: ledger
  };
};

const buildProgressMessage = (obligation) => {
  const currency = obligation.currency;
  const current = obligation.currentMonth;
  const carry = obligation.carryOver.remaining;

  if (obligation.totalPending <= 0) {
    if (current.due > 0) {
      return `You have met this month's ${currency} ${current.due} donation goal.`;
    }
    return 'No donation pending.';
  }

  const parts = [];
  if (current.remaining > 0) {
    parts.push(`${currency} ${current.remaining} due this month`);
  }
  if (carry > 0) {
    parts.push(`${currency} ${carry} pending from previous months`);
  }
  if (parts.length === 0) {
    return `You have ${currency} ${obligation.totalPending} pending.`;
  }
  return `${parts.join('. ')}.`;
};

const getProgressMetrics = (obligation) => {
  const donationGoal = roundMoney(
    obligation.currentMonth.due + obligation.carryOver.remaining
  );
  const progress = Math.round(
    calculateDonationProgress(obligation.currentMonth.paid, obligation.currentMonth.due) * 100
  ) / 100;

  return {
    donationGoal,
    totalDonated: obligation.currentMonth.paid,
    remaining: obligation.totalPending,
    progress
  };
};

const getDonationObligations = async (user, options = {}) => {
  const now = options.now || new Date();
  const percentage = user?.donationPercentage ?? 5;
  const currency = resolveUserCurrency(user);

  const [incomes, donations] = await Promise.all([
    Income.find({ user: user._id }).select('amount date').lean(),
    Donation.find({ user: user._id }).select('amount date').lean()
  ]);

  const obligation = buildObligationLedger({
    incomes,
    donations,
    percentage,
    now,
    currency
  });

  const monthLimit = parseInt(options.months, 10);
  if (Number.isInteger(monthLimit) && monthLimit > 0) {
    return {
      ...obligation,
      months: obligation.months.slice(-monthLimit)
    };
  }

  return obligation;
};

module.exports = {
  roundMoney,
  buildObligationLedger,
  buildProgressMessage,
  getProgressMetrics,
  getDonationObligations
};
