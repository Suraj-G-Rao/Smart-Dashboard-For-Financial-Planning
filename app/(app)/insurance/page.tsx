'use client';

import { useState } from 'react';
import { Shield, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { formatINR } from '@/lib/format';

interface Recommendation {
  type: string;
  coverage: number | string;
  premium: number;
  premiumYearly: number;
  reason: string;
  priority: string;
  [key: string]: any;
}

export default function InsurancePage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [formData, setFormData] = useState({
    annualIncome: 0,
    dependents: 0,
    age: 0,
  });

  const handleGetRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insurance/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setRecommendations(result.data.recommendations);
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatINR(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Insurance Hub</h1>
        <p className="text-sm text-muted-foreground">
          Comprehensive insurance planning and policy tracking
        </p>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="policies">My Policies</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {/* Input Form */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Get Personalized Recommendations</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Annual Income (₹)</Label>
                <Input
                  type="number"
                  placeholder="1200000"
                  value={formData.annualIncome || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      annualIncome: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Number of Dependents</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={formData.dependents || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, dependents: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Your Age</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.age || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <Button
              onClick={handleGetRecommendations}
              disabled={loading || !formData.annualIncome || !formData.age}
              className="mt-4 w-full"
              size="lg"
            >
              {loading ? 'Analyzing...' : 'Get Recommendations'}
            </Button>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <SummaryCard
                  title="Total Monthly Premium"
                  value={formatCurrency(
                    recommendations.reduce((sum, r) => sum + (r.premium || 0), 0)
                  )}
                  icon={Shield}
                  iconColor="text-blue-500"
                />
                <SummaryCard
                  title="Total Yearly Premium"
                  value={formatCurrency(
                    recommendations.reduce((sum, r) => sum + (r.premiumYearly || 0), 0)
                  )}
                  icon={Shield}
                  iconColor="text-purple-500"
                />
                <SummaryCard
                  title="Coverage Affordability"
                  value={`${(
                    (recommendations.reduce((sum, r) => sum + (r.premiumYearly || 0), 0) /
                      formData.annualIncome) *
                    100
                  ).toFixed(1)}%`}
                  icon={CheckCircle}
                  iconColor="text-green-500"
                />
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-3">
                          <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{rec.type} Insurance</h3>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(
                              rec.priority
                            )}`}
                          >
                            {rec.priority} Priority
                          </span>
                        </div>
                      </div>
                      <Button>Add Policy</Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Coverage Amount</p>
                        <p className="text-xl font-bold">
                          {typeof rec.coverage === 'number'
                            ? formatCurrency(rec.coverage)
                            : rec.coverage}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Premium (Yearly)</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(rec.premiumYearly)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {rec.reason}
                      </p>
                      {rec.ageImpact && (
                        <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                          <AlertCircle className="mr-1 inline h-3 w-3" />
                          {rec.ageImpact}
                        </p>
                      )}
                      {rec.deductible && (
                        <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                          💡 {rec.deductible}
                        </p>
                      )}
                      {rec.note && (
                        <p className="mt-2 text-xs text-muted-foreground">{rec.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Policies</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </div>

          <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No policies yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by getting recommendations or add your existing policies
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
