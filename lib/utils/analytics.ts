import { Decimal } from '@prisma/client/runtime/library';

/**
 * Calculate z-score for anomaly detection
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Detect spending anomalies using z-score
 */
export function detectAnomalies(
  dailySpending: { date: Date; amount: number; category: string }[],
  threshold: number = 2.0
): { date: Date; amount: number; category: string; zScore: number }[] {
  if (dailySpending.length < 3) return [];

  const amounts = dailySpending.map((d) => d.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance =
    amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  return dailySpending
    .map((day) => ({
      ...day,
      zScore: calculateZScore(day.amount, mean, stdDev),
    }))
    .filter((day) => Math.abs(day.zScore) > threshold);
}

/**
 * Calculate Financial Health Score (0-100)
 */
export interface FinancialMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundMonths: number;
  monthlyEMI: number;
  onTimePaymentRate: number; // 0-1
}

export function calculateFinancialScore(metrics: FinancialMetrics): {
  score: number;
  breakdown: {
    savingsRate: { score: number; weight: number };
    emergencyFund: { score: number; weight: number };
    debtRatio: { score: number; weight: number };
    paymentHistory: { score: number; weight: number };
  };
} {
  // 1. Savings Rate (30% weight)
  const savingsRate = metrics.monthlyIncome > 0
    ? (metrics.monthlyIncome - metrics.monthlyExpenses) / metrics.monthlyIncome
    : 0;
  let savingsScore = 0;
  if (savingsRate >= 0.25) savingsScore = 100;
  else if (savingsRate >= 0.20) savingsScore = 90;
  else if (savingsRate >= 0.15) savingsScore = 70;
  else if (savingsRate >= 0.10) savingsScore = 50;
  else if (savingsRate >= 0.05) savingsScore = 30;
  else savingsScore = 0;

  // 2. Emergency Fund Coverage (25% weight)
  let emergencyScore = 0;
  if (metrics.emergencyFundMonths >= 6) emergencyScore = 100;
  else if (metrics.emergencyFundMonths >= 5) emergencyScore = 85;
  else if (metrics.emergencyFundMonths >= 4) emergencyScore = 70;
  else if (metrics.emergencyFundMonths >= 3) emergencyScore = 50;
  else if (metrics.emergencyFundMonths >= 2) emergencyScore = 30;
  else if (metrics.emergencyFundMonths >= 1) emergencyScore = 15;
  else emergencyScore = 0;

  // 3. Debt Ratio (25% weight) - EMI to income ratio
  const debtRatio = metrics.monthlyIncome > 0
    ? metrics.monthlyEMI / metrics.monthlyIncome
    : 0;
  let debtScore = 0;
  if (debtRatio <= 0.15) debtScore = 100;
  else if (debtRatio <= 0.25) debtScore = 80;
  else if (debtRatio <= 0.35) debtScore = 50;
  else if (debtRatio <= 0.45) debtScore = 20;
  else debtScore = 0;

  // 4. Payment History (20% weight)
  const paymentScore = metrics.onTimePaymentRate * 100;

  // Calculate weighted total
  const totalScore =
    savingsScore * 0.3 +
    emergencyScore * 0.25 +
    debtScore * 0.25 +
    paymentScore * 0.2;

  return {
    score: Math.round(totalScore),
    breakdown: {
      savingsRate: { score: Math.round(savingsScore), weight: 30 },
      emergencyFund: { score: Math.round(emergencyScore), weight: 25 },
      debtRatio: { score: Math.round(debtScore), weight: 25 },
      paymentHistory: { score: Math.round(paymentScore), weight: 20 },
    },
  };
}

/**
 * Forecast cashflow for next N days using simple averaging
 */
export interface CashflowForecast {
  date: Date;
  projectedIncome: number;
  projectedExpense: number;
  projectedBalance: number;
}

export function forecastCashflow(
  historicalIncome: number[], // Last 90 days
  historicalExpenses: number[], // Last 90 days
  currentBalance: number,
  upcomingBills: { date: Date; amount: number }[],
  upcomingSubscriptions: { date: Date; amount: number }[],
  forecastDays: number = 30
): CashflowForecast[] {
  const avgDailyIncome = historicalIncome.reduce((a, b) => a + b, 0) / historicalIncome.length || 0;
  const avgDailyExpense = historicalExpenses.reduce((a, b) => a + b, 0) / historicalExpenses.length || 0;

  const forecast: CashflowForecast[] = [];
  let balance = currentBalance;
  const today = new Date();

  for (let i = 0; i < forecastDays; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);

    // Check for upcoming bills and subscriptions on this date
    const billsToday = upcomingBills.filter(
      (b) => b.date.toDateString() === forecastDate.toDateString()
    );
    const subsToday = upcomingSubscriptions.filter(
      (s) => s.date.toDateString() === forecastDate.toDateString()
    );

    const extraExpenses =
      billsToday.reduce((sum, b) => sum + b.amount, 0) +
      subsToday.reduce((sum, s) => sum + s.amount, 0);

    const dayIncome = avgDailyIncome;
    const dayExpense = avgDailyExpense + extraExpenses;

    balance += dayIncome - dayExpense;

    forecast.push({
      date: new Date(forecastDate),
      projectedIncome: dayIncome,
      projectedExpense: dayExpense,
      projectedBalance: balance,
    });
  }

  return forecast;
}

/**
 * Calculate overspending percentage vs previous period
 */
export function calculateOverspending(
  currentPeriodExpenses: number,
  previousPeriodExpenses: number
): number {
  if (previousPeriodExpenses === 0) return 0;
  return ((currentPeriodExpenses - previousPeriodExpenses) / previousPeriodExpenses) * 100;
}

/**
 * Generate spending heatmap data (day of week vs week number)
 */
export interface HeatmapCell {
  day: string; // Mon, Tue, etc.
  week: number;
  amount: number;
  date: Date;
}

export function generateSpendingHeatmap(
  transactions: { date: Date; amount: number }[],
  weeks: number = 4
): HeatmapCell[] {
  const heatmap: HeatmapCell[] = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  for (let week = 0; week < weeks; week++) {
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (week * 7 + (6 - dayOfWeek)));

      const dayTransactions = transactions.filter(
        (t) => t.date.toDateString() === date.toDateString()
      );

      const totalAmount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

      heatmap.push({
        day: days[dayOfWeek],
        week: weeks - week,
        amount: totalAmount,
        date: new Date(date),
      });
    }
  }

  return heatmap;
}

/**
 * Convert Prisma Decimal to number safely
 */
export function decimalToNumber(decimal: Decimal | number): number {
  if (typeof decimal === 'number') return decimal;
  return parseFloat(decimal.toString());
}
