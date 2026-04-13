'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { SummaryCard } from '@/components/finance/SummaryCard';
import { createSupabaseClient } from '@/lib/supabase/client';
import { formatINR } from '@/lib/format';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Plus, 
  Search, 
  BarChart3, 
  Target,
  Sparkles,
  RefreshCw,
  Eye,
  Activity
} from 'lucide-react';

interface Investment {
  id: string;
  symbol: string;
  company_name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  sector: string;
  purchase_date: string;
  last_price_update: string;
}

interface StockPrice {
  symbol: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  companyName: string;
  sector: string;
  volume: string;
  marketCap: string;
}

interface TechnicalAnalysis {
  symbol: string;
  signals: {
    overall: string;
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  emaCrossoverStrategy: {
    status: string;
    signal: string;
    confidence: string;
  };
  summary: string;
}

interface Recommendation {
  symbol: string;
  companyName: string;
  sector: string;
  signal: string;
  targetPrice: string;
  confidence: string;
  reasoning: string;
}

export default function InvestmentsPage() {
  const supabase = createSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [technicalAnalysis, setTechnicalAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  const [form, setForm] = useState({
    symbol: '',
    company_name: '',
    quantity: '',
    avg_price: '',
    sector: '',
    purchase_date: new Date().toISOString().slice(0, 10),
  });

  const [stats, setStats] = useState({
    totalValue: 0,
    totalInvested: 0,
    unrealizedPL: 0,
    unrealizedPLPercent: 0,
  });

  useEffect(() => {
    loadData();
    loadRecommendations();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: investmentsData } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (investmentsData) {
        setInvestments(investmentsData);
        await updatePrices(investmentsData);
        calculateStats(investmentsData);
      }
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrices = async (investmentsList: Investment[]) => {
    for (const investment of investmentsList) {
      try {
        const response = await fetch('/api/stocks/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: investment.symbol })
        });
        
        const priceData = await response.json();
        if (priceData.currentPrice && !priceData.error) {
          await supabase
            .from('investments')
            .update({ 
              current_price: parseFloat(priceData.currentPrice),
              last_price_update: new Date().toISOString()
            })
            .eq('id', investment.id);
        }
      } catch (error) {
        console.error(`Error updating price for ${investment.symbol}:`, error);
      }
    }
  };

  const calculateStats = (investmentsList: Investment[]) => {
    const totalInvested = investmentsList.reduce((sum, inv) => sum + (inv.quantity * inv.avg_price), 0);
    const totalValue = investmentsList.reduce((sum, inv) => sum + (inv.quantity * inv.current_price), 0);
    const unrealizedPL = totalValue - totalInvested;
    const unrealizedPLPercent = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;

    setStats({ totalValue, totalInvested, unrealizedPL, unrealizedPLPercent });
  };

  const handleAddStock = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get current price
      const priceResponse = await fetch('/api/stocks/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: form.symbol.toUpperCase() })
      });
      
      const priceData = await priceResponse.json();
      const currentPrice = priceData.currentPrice ? parseFloat(priceData.currentPrice) : parseFloat(form.avg_price);

      const { error } = await supabase.from('investments').insert({
        user_id: user.id,
        symbol: form.symbol.toUpperCase(),
        company_name: form.company_name || priceData.companyName || form.symbol,
        quantity: parseInt(form.quantity),
        avg_price: parseFloat(form.avg_price),
        current_price: currentPrice,
        sector: form.sector || priceData.sector || 'Unknown',
        purchase_date: form.purchase_date,
      });

      if (error) throw error;

      setShowAddModal(false);
      setForm({
        symbol: '',
        company_name: '',
        quantity: '',
        avg_price: '',
        sector: '',
        purchase_date: new Date().toISOString().slice(0, 10),
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to add stock');
    }
  };

  const loadTechnicalAnalysis = async (symbol: string) => {
    setLoadingAnalysis(true);
    try {
      const investment = investments.find(inv => inv.symbol === symbol);
      const response = await fetch('/api/stocks/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symbol: symbol,
          currentPrice: investment?.current_price
        })
      });
      
      const analysisData = await response.json();
      setTechnicalAnalysis(analysisData);
      setSelectedStock(symbol);
      setShowAnalysisModal(true);
    } catch (error) {
      console.error('Error loading technical analysis:', error);
      alert('Failed to load technical analysis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/stocks/recommendations');
      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations.slice(0, 5)); // Show top 5
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Investments</h1>
          <p className="text-muted-foreground">Track your portfolio performance and insights</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => loadRecommendations()} disabled={loadingRecommendations}>
            <Sparkles className="mr-2 h-4 w-4" />
            {loadingRecommendations ? 'Loading...' : 'EMA Recommendations'}
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatINR(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">{formatINR(stats.totalInvested)}</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unrealized P/L</p>
                <p className={`text-2xl font-bold ${stats.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatINR(stats.unrealizedPL)}
                </p>
              </div>
              {stats.unrealizedPL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Return %</p>
                <p className={`text-2xl font-bold ${stats.unrealizedPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.unrealizedPLPercent.toFixed(2)}%
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${stats.unrealizedPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EMA Crossover Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              EMA Crossover Strategy Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{rec.symbol}</h4>
                      <p className="text-sm text-muted-foreground">{rec.companyName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.signal === 'BUY' || rec.signal === 'STRONG_BUY' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.signal}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-medium">₹{rec.targetPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="font-medium">{rec.confidence}/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{rec.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No investments yet. Add your first stock!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => {
                const currentValue = investment.quantity * investment.current_price;
                const investedValue = investment.quantity * investment.avg_price;
                const pl = currentValue - investedValue;
                const plPercent = investedValue > 0 ? (pl / investedValue) * 100 : 0;
                
                return (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-semibold">{investment.symbol}</h4>
                          <p className="text-sm text-muted-foreground">{investment.company_name}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {investment.sector}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Qty:</span>
                          <span className="ml-1 font-medium">{investment.quantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Price:</span>
                          <span className="ml-1 font-medium">{formatINR(investment.avg_price)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current:</span>
                          <span className="ml-1 font-medium">{formatINR(investment.current_price)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value:</span>
                          <span className="ml-1 font-medium">{formatINR(currentValue)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pl >= 0 ? '+' : ''}{formatINR(pl)}
                      </div>
                      <div className={`text-sm ${plPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => loadTechnicalAnalysis(investment.symbol)}
                        disabled={loadingAnalysis}
                      >
                        <Activity className="mr-1 h-3 w-3" />
                        Analysis
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Stock Symbol</Label>
                <Input
                  value={form.symbol}
                  onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., RELIANCE, TCS"
                />
              </div>
              <div>
                <Label>Company Name (Optional)</Label>
                <Input
                  value={form.company_name}
                  onChange={e => setForm({ ...form, company_name: e.target.value })}
                  placeholder="Will be auto-filled if available"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>Average Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.avg_price}
                    onChange={e => setForm({ ...form, avg_price: e.target.value })}
                    placeholder="2450.50"
                  />
                </div>
              </div>
              <div>
                <Label>Sector (Optional)</Label>
                <Input
                  value={form.sector}
                  onChange={e => setForm({ ...form, sector: e.target.value })}
                  placeholder="e.g., Technology, Banking"
                />
              </div>
              <div>
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={form.purchase_date}
                  onChange={e => setForm({ ...form, purchase_date: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddStock} className="flex-1">
                  Add Stock
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Technical Analysis Modal */}
      {showAnalysisModal && technicalAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Technical Analysis - {selectedStock}
                <Button variant="outline" size="sm" onClick={() => setShowAnalysisModal(false)}>
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Signals */}
              <div>
                <h3 className="font-semibold mb-3">Trading Signals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Overall</div>
                    <div className="font-semibold">{technicalAnalysis.signals?.overall}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Short Term</div>
                    <div className="font-semibold">{technicalAnalysis.signals?.shortTerm}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Medium Term</div>
                    <div className="font-semibold">{technicalAnalysis.signals?.mediumTerm}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Long Term</div>
                    <div className="font-semibold">{technicalAnalysis.signals?.longTerm}</div>
                  </div>
                </div>
              </div>

              {/* EMA Crossover Strategy */}
              <div>
                <h3 className="font-semibold mb-3">EMA Crossover Strategy</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="font-semibold">{technicalAnalysis.emaCrossoverStrategy?.status}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Signal</div>
                      <div className={`font-semibold ${
                        technicalAnalysis.emaCrossoverStrategy?.signal === 'BUY' 
                          ? 'text-green-600' 
                          : technicalAnalysis.emaCrossoverStrategy?.signal === 'AVOID'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {technicalAnalysis.emaCrossoverStrategy?.signal}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-muted-foreground">Confidence Level</div>
                    <div className="font-semibold">{technicalAnalysis.emaCrossoverStrategy?.confidence}/10</div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-3">Analysis Summary</h3>
                <p className="text-sm text-muted-foreground">{technicalAnalysis.summary}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
