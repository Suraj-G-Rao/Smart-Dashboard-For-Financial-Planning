'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, Download, Save, Sparkles, TrendingUp, Shield, Target, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatINR } from '@/lib/utils';
import type { BudgetResult } from '@/lib/budget/engine';

interface BudgetResultsProps {
  result: BudgetResult;
  onExport: (format: 'pdf' | 'csv') => void;
  onSavePreset: () => void;
  onCopyResults: () => void;
  loading?: boolean;
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

export default function BudgetResults({ 
  result, 
  onExport, 
  onSavePreset, 
  onCopyResults, 
  loading = false 
}: BudgetResultsProps) {
  const { allocations, summary, badges, notes } = result;

  // Prepare chart data
  const chartData = allocations
    .filter(allocation => allocation.amount > 0)
    .map((allocation, index) => ({
      name: allocation.name,
      value: allocation.amount,
      percentage: allocation.percentage,
      color: COLORS[index % COLORS.length],
    }));

  const essentialAllocations = allocations.filter(a => a.type === 'essential' && a.amount > 0);
  const goalAllocations = allocations.filter(a => a.type === 'goal' && a.amount > 0);
  const lifestyleAllocations = allocations.filter(a => a.type === 'lifestyle' && a.amount > 0);
  const fixedAllocations = allocations.filter(a => a.type === 'fixed' && a.amount > 0);

  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">{formatINR(data.value)}</p>
          <p className="text-gray-500">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
        <h2 className="text-2xl font-bold">Your Optimized Budget</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopyResults} className="hover:scale-105 transition-transform">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('csv')} className="hover:scale-105 transition-transform">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('pdf')} className="hover:scale-105 transition-transform">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onSavePreset} className="hover:scale-105 transition-transform">
            <Save className="h-4 w-4 mr-2" />
            Save Preset
          </Button>
        </div>
      </div>

      {/* Strategy Strip */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">
                  EF: {summary.monthsToEfTarget === Infinity ? '∞' : summary.monthsToEfTarget} months
                </span>
              </div>
              {summary.debtFreeEta && (
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">
                    Debt-free in {summary.debtFreeEta} months
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">
                  Invest ≥ {summary.investingPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant={badge.includes('Over Cap') || badge.includes('High DTI') ? 'destructive' : 'secondary'}
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-200">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Allocated</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatINR(summary.totalAllocated)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Essentials</div>
            <div className="text-2xl font-bold text-orange-600">
              {summary.essentialsPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Investing</div>
            <div className="text-2xl font-bold text-green-600">
              {summary.investingPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Lifestyle</div>
            <div className="text-2xl font-bold text-purple-600">
              {summary.lifestylePercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>Visual breakdown of your monthly budget</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>Detailed allocation by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fixed Commitments */}
            {fixedAllocations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Fixed Commitments</h4>
                <div className="space-y-2">
                  {fixedAllocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{allocation.icon}</span>
                        <span className="text-sm">{allocation.name}</span>
                        {allocation.isOverCap && <Badge variant="destructive" className="text-xs">Over Cap</Badge>}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatINR(allocation.amount)}</div>
                        <div className="text-xs text-gray-500">{allocation.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Essentials */}
            {essentialAllocations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Essentials</h4>
                <div className="space-y-2">
                  {essentialAllocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{allocation.icon}</span>
                        <span className="text-sm">{allocation.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatINR(allocation.amount)}</div>
                        <div className="text-xs text-gray-500">{allocation.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {goalAllocations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Financial Goals</h4>
                <div className="space-y-2">
                  {goalAllocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{allocation.icon}</span>
                        <span className="text-sm">{allocation.name}</span>
                        {allocation.isAtFloor && <Badge variant="outline" className="text-xs">At Floor</Badge>}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatINR(allocation.amount)}</div>
                        <div className="text-xs text-gray-500">{allocation.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {lifestyleAllocations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Lifestyle</h4>
                <div className="space-y-2">
                  {lifestyleAllocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{allocation.icon}</span>
                        <span className="text-sm">{allocation.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatINR(allocation.amount)}</div>
                        <div className="text-xs text-gray-500">{allocation.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {notes.length > 0 && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-purple-900 mb-2">Budget Insights</div>
                <ul className="space-y-1">
                  {notes.map((note, index) => (
                    <li key={index} className="text-gray-700 text-sm">• {note}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-3 italic">
                  Educational insights only, not financial advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
