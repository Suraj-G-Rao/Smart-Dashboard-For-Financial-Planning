'use client';

import { useState } from 'react';
import { TrendingUp, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { formatINR } from '@/lib/format';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface PredictionData {
  predictions: {
    oneYear: { low: number; mid: number; high: number };
    threeYear: { low: number; mid: number; high: number };
    factors: {
      baseCAGR: string;
      skillBoost: string;
      roleMultiplier: string;
      totalGrowth: string;
    };
  };
  recommendations: Array<{
    skill: string;
    action: string;
    timeframe: string;
    impact: string;
  }>;
}

export default function SalaryPage() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [formData, setFormData] = useState({
    role: '',
    city: '',
    expYears: 0,
    currentCTC: 0,
    skills: '',
  });

  const handlePredict = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/salary/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPrediction(result.data);
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${formatINR(amount / 100000)}L`.replace('₹', '₹');
  };

  const chartData = prediction
    ? [
        { year: 'Current', value: formData.currentCTC },
        { year: '1Y', value: prediction.predictions.oneYear.mid },
        { year: '3Y', value: prediction.predictions.threeYear.mid },
      ]
    : [];

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Salary Predictor</h1>
        <p className="text-sm text-muted-foreground">
          Get personalized salary forecasts and career growth recommendations
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Your Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Role / Designation</Label>
            <Input
              placeholder="e.g., Senior Software Engineer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              placeholder="e.g., Bangalore"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div>
            <Label>Experience (years)</Label>
            <Input
              type="number"
              placeholder="5"
              value={formData.expYears || ''}
              onChange={(e) =>
                setFormData({ ...formData, expYears: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <Label>Current CTC (₹)</Label>
            <Input
              type="number"
              placeholder="1200000"
              value={formData.currentCTC || ''}
              onChange={(e) =>
                setFormData({ ...formData, currentCTC: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label>Skills (comma-separated)</Label>
            <Input
              placeholder="e.g., React, Node.js, AWS, GenAI"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>
        </div>
        <Button
          onClick={handlePredict}
          disabled={loading || !formData.role || !formData.currentCTC}
          className="mt-4 w-full"
          size="lg"
        >
          {loading ? 'Analyzing...' : 'Predict Salary'}
        </Button>
      </div>

      {/* Results */}
      {prediction && (
        <>
          {/* Predictions */}
          <div className="grid gap-6 md:grid-cols-3">
            <SummaryCard
              title="Current CTC"
              value={formatCurrency(formData.currentCTC)}
              icon={Target}
              iconColor="text-gray-500"
            />
            <SummaryCard
              title="1-Year Forecast"
              value={formatCurrency(prediction.predictions.oneYear.mid)}
              change={
                ((prediction.predictions.oneYear.mid - formData.currentCTC) /
                  formData.currentCTC) *
                100
              }
              icon={TrendingUp}
              iconColor="text-blue-500"
              trend="up"
            />
            <SummaryCard
              title="3-Year Forecast"
              value={formatCurrency(prediction.predictions.threeYear.mid)}
              change={
                ((prediction.predictions.threeYear.mid - formData.currentCTC) /
                  formData.currentCTC) *
                100
              }
              icon={Sparkles}
              iconColor="text-purple-500"
              trend="up"
            />
          </div>

          {/* Chart */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Salary Trajectory</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'CTC']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground">1Y Range</p>
                <p className="font-medium">
                  {formatCurrency(prediction.predictions.oneYear.low)} -{' '}
                  {formatCurrency(prediction.predictions.oneYear.high)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">3Y Range</p>
                <p className="font-medium">
                  {formatCurrency(prediction.predictions.threeYear.low)} -{' '}
                  {formatCurrency(prediction.predictions.threeYear.high)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Growth Rate</p>
                <p className="font-medium">{prediction.predictions.factors.totalGrowth}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-2xl border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">4-Step Growth Plan</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {prediction.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border bg-white dark:bg-gray-900 p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-sm font-bold text-purple-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{rec.skill}</h3>
                    </div>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">{rec.action}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1">
                      {rec.timeframe}
                    </span>
                    <span className="font-medium text-green-600">{rec.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
