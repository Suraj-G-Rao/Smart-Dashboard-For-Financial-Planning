'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Target,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { Heatmap } from '@/components/finance/Heatmap';
import { TrendBadge } from '@/components/finance/TrendBadge';
import { formatINR } from '@/lib/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface AnalyticsData {
  score: number;
  breakdown: {
    savingsRate: { value: string; score: number; maxScore: number };
    emergencyFund: { months: string; score: number; maxScore: number };
    debtRatio: { value: string; score: number; maxScore: number };
    onTimePayments: { value: string; score: number; maxScore: number };
  };
  metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyEMI: number;
    totalBalance: number;
  };
}

interface ForecastData {
  period: string;
  forecast: {
    income: number;
    expenses: number;
    scheduledPayments: number;
    totalExpenses: number;
    netCashflow: number;
  };
  dailyForecast: Array<{ date: string; income: number; expense: number; balance: number }>;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<AnalyticsData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [forecastDays, setForecastDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [forecastDays]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/score');
      const result = await response.json();
      if (result.success) {
        setScoreData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/forecast?days=${forecastDays}`);
      const result = await response.json();
      if (result.success) {
        setForecastData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatINR(amount);
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  if (loading || !scoreData || !forecastData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const breakdownData = [
    { name: 'Savings', value: scoreData.breakdown.savingsRate.score },
    { name: 'Emergency', value: scoreData.breakdown.emergencyFund.score },
    { name: 'Debt', value: scoreData.breakdown.debtRatio.score },
    { name: 'Payments', value: scoreData.breakdown.onTimePayments.score },
  ];

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Next-Level Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Advanced insights, forecasts, and financial health tracking
        </p>
      </div>

      {/* Financial Health Score */}
      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Health Score</h2>
            <p className="text-sm text-muted-foreground">Based on 4 key metrics</p>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(scoreData.score)}`}>
              {scoreData.score}
            </div>
            <div className="mt-2 rounded-full bg-white dark:bg-gray-900 px-4 py-1 text-sm font-semibold">
              Grade: {getScoreGrade(scoreData.score)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-muted-foreground">Savings Rate</p>
            <p className="mt-2 text-2xl font-bold">{scoreData.breakdown.savingsRate.value}%</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${
                      (scoreData.breakdown.savingsRate.score /
                        scoreData.breakdown.savingsRate.maxScore) *
                      100
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium">
                {scoreData.breakdown.savingsRate.score}/{scoreData.breakdown.savingsRate.maxScore}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Emergency Fund
            </p>
            <p className="mt-2 text-2xl font-bold">
              {scoreData.breakdown.emergencyFund.months} mo
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${
                      (scoreData.breakdown.emergencyFund.score /
                        scoreData.breakdown.emergencyFund.maxScore) *
                      100
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium">
                {scoreData.breakdown.emergencyFund.score}/
                {scoreData.breakdown.emergencyFund.maxScore}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-muted-foreground">Debt Ratio</p>
            <p className="mt-2 text-2xl font-bold">{scoreData.breakdown.debtRatio.value}%</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${
                      (scoreData.breakdown.debtRatio.score /
                        scoreData.breakdown.debtRatio.maxScore) *
                      100
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium">
                {scoreData.breakdown.debtRatio.score}/{scoreData.breakdown.debtRatio.maxScore}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              On-time Payments
            </p>
            <p className="mt-2 text-2xl font-bold">
              {scoreData.breakdown.onTimePayments.value}%
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-orange-500"
                  style={{
                    width: `${
                      (scoreData.breakdown.onTimePayments.score /
                        scoreData.breakdown.onTimePayments.maxScore) *
                      100
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium">
                {scoreData.breakdown.onTimePayments.score}/
                {scoreData.breakdown.onTimePayments.maxScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cashflow Forecast */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cashflow Forecast</h2>
          <Select
            value={forecastDays.toString()}
            onValueChange={(v) => setForecastDays(parseInt(v))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Expected Income"
            value={formatCurrency(forecastData.forecast.income)}
            icon={TrendingUp}
            iconColor="text-green-500"
          />
          <SummaryCard
            title="Expected Expenses"
            value={formatCurrency(forecastData.forecast.totalExpenses)}
            icon={Activity}
            iconColor="text-red-500"
          />
          <SummaryCard
            title="Scheduled Payments"
            value={formatCurrency(forecastData.forecast.scheduledPayments)}
            icon={Calendar}
            iconColor="text-orange-500"
          />
          <SummaryCard
            title="Net Cashflow"
            value={formatCurrency(forecastData.forecast.netCashflow)}
            icon={DollarSign}
            iconColor="text-blue-500"
          />
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData.dailyForecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(v) => new Date(v).getDate().toString()} />
            <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, '']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Net Worth & Heatmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Net Worth Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold">
                {formatCurrency(scoreData.metrics.totalBalance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-xl font-semibold">
                {formatCurrency(scoreData.metrics.monthlyIncome)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Expenses</p>
              <p className="text-xl font-semibold">
                {formatCurrency(scoreData.metrics.monthlyExpenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly EMI</p>
              <p className="text-xl font-semibold">
                {formatCurrency(scoreData.metrics.monthlyEMI)}
              </p>
            </div>
          </div>
        </div>

        <Heatmap
          data={forecastData.dailyForecast.map((d) => ({ date: d.date, amount: d.expense }))}
        />
      </div>
    </div>
  );
}
