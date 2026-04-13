'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function PPFCalculator() {
  const [yearlyDeposit, setYearlyDeposit] = useState('150000');
  const [timePeriod, setTimePeriod] = useState('15');
  const [interestRate, setInterestRate] = useState('7.1');
  const [result, setResult] = useState<any>(null);

  const calculatePPF = () => {
    const P = parseFloat(yearlyDeposit);
    const r = parseFloat(interestRate) / 100;
    const n = parseInt(timePeriod);

    // PPF Calculation: FV = P × [((1 + r)^n - 1) / r]
    let totalAmount = 0;
    let totalDeposit = 0;
    const yearlyData = [];

    for (let year = 1; year <= n; year++) {
      totalDeposit += P;
      totalAmount = totalAmount * (1 + r) + P;
      
      yearlyData.push({
        year: `Year ${year}`,
        deposit: totalDeposit,
        interest: Math.round(totalAmount - totalDeposit),
        total: Math.round(totalAmount),
      });
    }

    const totalInterest = totalAmount - totalDeposit;

    // Calculate maturity value if extended for 5 more years
    let extendedAmount = totalAmount;
    for (let i = 1; i <= 5; i++) {
      extendedAmount = extendedAmount * (1 + r);
    }

    setResult({
      totalDeposit: Math.round(totalDeposit),
      totalInterest: Math.round(totalInterest),
      maturityValue: Math.round(totalAmount),
      extendedValue: Math.round(extendedAmount),
      yearlyData,
      monthlyDeposit: Math.round(P / 12),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-purple-600" />
              PPF Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-sm text-purple-900 mb-2">PPF Rules (2024)</h4>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Minimum deposit: ₹500/year</li>
                <li>• Maximum deposit: ₹1,50,000/year</li>
                <li>• Lock-in period: 15 years</li>
                <li>• Current interest rate: 7.1% p.a.</li>
                <li>• Tax benefit under Section 80C</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearly">Yearly Deposit (₹)</Label>
              <Input
                id="yearly"
                type="number"
                value={yearlyDeposit}
                onChange={(e) => setYearlyDeposit(e.target.value)}
                className="text-lg"
              />
              <input
                type="range"
                min="500"
                max="150000"
                step="500"
                value={yearlyDeposit}
                onChange={(e) => setYearlyDeposit(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-600">
                Monthly: ₹{Math.round(parseFloat(yearlyDeposit) / 12).toLocaleString()}
              </p>
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
                min="15"
                max="50"
                step="1"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-600">Minimum 15 years required</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Interest Rate (% p.a.)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-gray-600">Current rate: 7.1% (Q4 FY 2023-24)</p>
            </div>

            <Button 
              onClick={calculatePPF}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              Calculate Maturity Value
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        {result && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Maturity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <DollarSign className="h-4 w-4" />
                    Total Deposits
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{result.totalDeposit.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Over {timePeriod} years
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Total Interest Earned
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{result.totalInterest.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Tax-free returns
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                  <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
                    <Calendar className="h-4 w-4" />
                    Maturity Value
                  </div>
                  <div className="text-3xl font-bold">
                    ₹{result.maturityValue.toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    After {timePeriod} years
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">
                    If Extended for 5 More Years
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{result.extendedValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    No new deposits, interest continues
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="text-xs text-gray-600">Monthly Deposit</div>
                    <div className="text-lg font-semibold">₹{result.monthlyDeposit.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="text-xs text-gray-600">Interest Rate</div>
                    <div className="text-lg font-semibold">{interestRate}%</div>
                  </div>
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
            <CardTitle>Year-wise PPF Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="deposit" stroke="#3b82f6" strokeWidth={2} name="Total Deposits" />
                  <Line type="monotone" dataKey="interest" stroke="#10b981" strokeWidth={2} name="Interest Earned" />
                  <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Year</th>
                    <th className="text-right py-2">Deposits</th>
                    <th className="text-right py-2">Interest</th>
                    <th className="text-right py-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map((row: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2">{row.year}</td>
                      <td className="text-right text-blue-600">₹{row.deposit.toLocaleString()}</td>
                      <td className="text-right text-green-600">₹{row.interest.toLocaleString()}</td>
                      <td className="text-right font-semibold text-purple-600">₹{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PPF Information */}
      <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-purple-900">PPF Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Tax Benefits</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• EEE status (Exempt-Exempt-Exempt)</li>
                <li>• Deduction under Section 80C</li>
                <li>• Interest earned is tax-free</li>
                <li>• Maturity amount is tax-free</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Withdrawal Rules</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Partial withdrawal after 7 years</li>
                <li>• Loan available from 3rd year</li>
                <li>• Can extend in blocks of 5 years</li>
                <li>• No withdrawals during extension</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Contribution Limits</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Minimum: ₹500 per year</li>
                <li>• Maximum: ₹1,50,000 per year</li>
                <li>• Can deposit in lump sum or installments</li>
                <li>• 12 deposits allowed per year</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Interest Calculation</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Compounded annually</li>
                <li>• Calculated monthly on lowest balance</li>
                <li>• Deposit before 5th of month for interest</li>
                <li>• Rate revised quarterly by Govt.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
