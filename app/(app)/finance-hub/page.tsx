'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { formatINR } from '@/lib/format';
import { TrendingUp, TrendingDown, Brain, Target, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { z } from 'zod';

interface KPICards {
  incomeMTD: number;
  expensesMTD: number;
  savings: number;
  burnRate: number;
  netChange: number;
}

interface CoachTip {
  title: string;
  action: string;
  impactINR: number;
}

interface CoachResponse {
  headline: string;
  tips: CoachTip[];
  riskFlags: string[];
}

const periodSchema = z.object({
  period: z.enum(['7d', '30d', '90d']),
});

export default function FinanceHubPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [kpiCards, setKpiCards] = useState<KPICards>({
    incomeMTD: 0,
    expensesMTD: 0,
    savings: 0,
    burnRate: 0,
    netChange: 0,
  });
  const [coachResponse, setCoachResponse] = useState<CoachResponse | null>(null);

  useEffect(() => {
    fetchKPIData();
  }, [period]);

  const fetchKPIData = async () => {
    try {
      const response = await fetch('/api/coach/kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      });

      if (!response.ok) throw new Error('Failed to fetch KPI data');

      const data = await response.json();
      setKpiCards(data);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const validated = periodSchema.parse({ period });
      
      const response = await fetch('/api/coach/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setCoachResponse(data);
      
      toast({
        title: 'Analysis Complete',
        description: 'AI coach insights generated successfully',
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze finances',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveTip = async (tip: CoachTip) => {
    try {
      const response = await fetch('/api/coach/save-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tip }),
      });

      if (!response.ok) throw new Error('Failed to save tip');

      toast({
        title: 'Tip Saved',
        description: 'Financial tip saved to your insights',
      });
    } catch (error) {
      console.error('Save tip error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tip',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Brain className="h-10 w-10 text-purple-600" />
          AI Financial Coach
        </h1>
        <p className="text-muted-foreground mt-2">Get personalized insights and recommendations for your financial health</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Income MTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatINR(kpiCards.incomeMTD)}</div>
            <TrendingUp className="h-4 w-4 text-green-600 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses MTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatINR(kpiCards.expensesMTD)}</div>
            <TrendingDown className="h-4 w-4 text-red-600 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpiCards.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatINR(kpiCards.savings)}
            </div>
            <Target className="h-4 w-4 text-blue-600 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Burn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatINR(kpiCards.burnRate)}</div>
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpiCards.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpiCards.netChange >= 0 ? '+' : ''}{formatINR(kpiCards.netChange)}
            </div>
            {kpiCards.netChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 mt-2" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mt-2" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coach Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Coach Analysis
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={period} onValueChange={(value: '7d' | '30d' | '90d') => setPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7d</SelectItem>
                  <SelectItem value="30d">Last 30d</SelectItem>
                  <SelectItem value="90d">Last 90d</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAnalyze} disabled={analyzing} className="gap-2">
                {analyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Analyze
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!coachResponse ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Ready for Analysis</p>
              <p className="text-sm text-muted-foreground mb-6">
                Click "Analyze" to get personalized financial insights based on your spending patterns
              </p>
              <Button onClick={handleAnalyze} disabled={analyzing}>
                <Brain className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Headline */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                  {coachResponse.headline}
                </h3>
              </div>

              {/* Risk Flags */}
              {coachResponse.riskFlags && coachResponse.riskFlags.length > 0 && (
                <div className="space-y-2">
                  {coachResponse.riskFlags.map((flag, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{flag}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coachResponse.tips.map((tip, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                        <p className="text-xs text-muted-foreground">{tip.action}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ₹{tip.impactINR.toLocaleString('en-IN')}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveTip(tip)}
                          className="h-8 w-8"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {coachResponse.tips.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No specific recommendations for this period</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
