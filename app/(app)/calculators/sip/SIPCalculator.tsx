'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, DollarSign, Calendar, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState('5000');
  const [expectedReturn, setExpectedReturn] = useState('12');
  const [timePeriod, setTimePeriod] = useState('10');
  const [result, setResult] = useState<any>(null);

  const calculateSIP = () => {
    const P = parseFloat(monthlyInvestment);
    const r = parseFloat(expectedReturn) / 100 / 12; // Monthly rate
    const n = parseFloat(timePeriod) * 12; // Total months

    // SIP Future Value Formula: FV = P × [(1 + r)^n - 1] / r × (1 + r)
    const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvested = P * n;
    const estimatedReturns = futureValue - totalInvested;

    // Generate year-wise data
    const yearWiseData = [];
    for (let year = 1; year <= parseInt(timePeriod); year++) {
      const months = year * 12;
      const fv = P * (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
      const invested = P * months;
      yearWiseData.push({
        year: `Year ${year}`,
        invested: Math.round(invested),
        returns: Math.round(fv - invested),
        total: Math.round(fv),
      });
    }

    setResult({
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      yearWiseData,
    });
  };

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              SIP Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="monthly">Monthly Investment (₹)</Label>
              <Input
                id="monthly"
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(e.target.value)}
                className="text-lg"
              />
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="return">Expected Return Rate (% p.a.)</Label>
              <Input
                id="return"
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                className="text-lg"
              />
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Time Period (Years)</Label>
              <Input
                id="period"
                type="number"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="text-lg"
              />
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full"
              />
            </div>

            <Button 
              onClick={calculateSIP}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Calculate SIP Returns
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        {result && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <DollarSign className="h-4 w-4" />
                    Total Investment
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{result.totalInvested.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Estimated Returns
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{result.estimatedReturns.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                  <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
                    <Calendar className="h-4 w-4" />
                    Total Value
                  </div>
                  <div className="text-3xl font-bold">
                    ₹{result.futureValue.toLocaleString()}
                  </div>
                </div>

                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Invested', value: result.totalInvested },
                          { name: 'Returns', value: result.estimatedReturns },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[0, 1].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Year-wise Growth Chart */}
      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Year-wise Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.yearWiseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="invested" stroke="#3b82f6" strokeWidth={2} name="Invested Amount" />
                  <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Year</th>
                    <th className="text-right py-2">Invested</th>
                    <th className="text-right py-2">Returns</th>
                    <th className="text-right py-2">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearWiseData.map((row: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{row.year}</td>
                      <td className="text-right text-blue-600">₹{row.invested.toLocaleString()}</td>
                      <td className="text-right text-green-600">₹{row.returns.toLocaleString()}</td>
                      <td className="text-right font-semibold">₹{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
