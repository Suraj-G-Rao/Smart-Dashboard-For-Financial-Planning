'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt, Percent, DollarSign, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TaxCalculator() {
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [grossIncome, setGrossIncome] = useState('1200000');
  const [deductions, setDeductions] = useState({
    section80C: '150000',
    section80D: '25000',
    homeLoanInterest: '200000',
    nps: '50000',
  });
  const [result, setResult] = useState<any>(null);

  const calculateTax = () => {
    const income = parseFloat(grossIncome);
    let taxableIncome = income;
    let tax = 0;
    let cess = 0;

    if (regime === 'new') {
      // New Tax Regime (FY 2023-24)
      if (income <= 300000) tax = 0;
      else if (income <= 600000) tax = (income - 300000) * 0.05;
      else if (income <= 900000) tax = 15000 + (income - 600000) * 0.10;
      else if (income <= 1200000) tax = 45000 + (income - 900000) * 0.15;
      else if (income <= 1500000) tax = 90000 + (income - 1200000) * 0.20;
      else tax = 150000 + (income - 1500000) * 0.30;
    } else {
      // Old Tax Regime with deductions
      const total80C = Math.min(parseFloat(deductions.section80C), 150000);
      const total80D = Math.min(parseFloat(deductions.section80D), 25000);
      const homeLoan = Math.min(parseFloat(deductions.homeLoanInterest), 200000);
      const nps = Math.min(parseFloat(deductions.nps), 50000);
      
      taxableIncome = income - total80C - total80D - homeLoan - nps;

      if (taxableIncome <= 250000) tax = 0;
      else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
      else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
      else tax = 112500 + (taxableIncome - 1000000) * 0.30;
    }

    // Health and Education Cess (4%)
    cess = tax * 0.04;
    const totalTax = tax + cess;
    const netIncome = income - totalTax;

    // Tax breakdown by slab
    const slabData = [];
    if (regime === 'new') {
      if (income > 300000) slabData.push({ slab: '₹3L-₹6L @ 5%', tax: Math.min((income - 300000) * 0.05, 15000) });
      if (income > 600000) slabData.push({ slab: '₹6L-₹9L @ 10%', tax: Math.min((income - 600000) * 0.10, 30000) });
      if (income > 900000) slabData.push({ slab: '₹9L-₹12L @ 15%', tax: Math.min((income - 900000) * 0.15, 45000) });
      if (income > 1200000) slabData.push({ slab: '₹12L-₹15L @ 20%', tax: Math.min((income - 1200000) * 0.20, 60000) });
      if (income > 1500000) slabData.push({ slab: 'Above ₹15L @ 30%', tax: (income - 1500000) * 0.30 });
    } else {
      if (taxableIncome > 250000) slabData.push({ slab: '₹2.5L-₹5L @ 5%', tax: Math.min((taxableIncome - 250000) * 0.05, 12500) });
      if (taxableIncome > 500000) slabData.push({ slab: '₹5L-₹10L @ 20%', tax: Math.min((taxableIncome - 500000) * 0.20, 100000) });
      if (taxableIncome > 1000000) slabData.push({ slab: 'Above ₹10L @ 30%', tax: (taxableIncome - 1000000) * 0.30 });
    }

    setResult({
      grossIncome: income,
      taxableIncome,
      totalDeductions: income - taxableIncome,
      tax: Math.round(tax),
      cess: Math.round(cess),
      totalTax: Math.round(totalTax),
      netIncome: Math.round(netIncome),
      effectiveRate: ((totalTax / income) * 100).toFixed(2),
      slabData,
    });
  };

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-600" />
              Income Tax Calculator (FY 2023-24)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Regime Selection */}
            <div className="space-y-2">
              <Label>Tax Regime</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRegime('new')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    regime === 'new'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">New Regime</div>
                  <div className="text-xs text-gray-600">No deductions</div>
                </button>
                <button
                  onClick={() => setRegime('old')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    regime === 'old'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Old Regime</div>
                  <div className="text-xs text-gray-600">With deductions</div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Annual Gross Income (₹)</Label>
              <Input
                id="income"
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                className="text-lg"
              />
            </div>

            {regime === 'old' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm">Deductions</h4>
                
                <div className="space-y-2">
                  <Label className="text-sm">Section 80C (Max ₹1.5L)</Label>
                  <Input
                    type="number"
                    value={deductions.section80C}
                    onChange={(e) => setDeductions({ ...deductions, section80C: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Section 80D - Health Insurance (Max ₹25K)</Label>
                  <Input
                    type="number"
                    value={deductions.section80D}
                    onChange={(e) => setDeductions({ ...deductions, section80D: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Home Loan Interest (Max ₹2L)</Label>
                  <Input
                    type="number"
                    value={deductions.homeLoanInterest}
                    onChange={(e) => setDeductions({ ...deductions, homeLoanInterest: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">NPS - Section 80CCD(1B) (Max ₹50K)</Label>
                  <Input
                    type="number"
                    value={deductions.nps}
                    onChange={(e) => setDeductions({ ...deductions, nps: e.target.value })}
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={calculateTax}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              size="lg"
            >
              Calculate Tax
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        {result && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tax Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <DollarSign className="h-4 w-4" />
                    Gross Income
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{result.grossIncome.toLocaleString()}
                  </div>
                </div>

                {result.totalDeductions > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <TrendingDown className="h-4 w-4" />
                      Total Deductions
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{result.totalDeductions.toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Receipt className="h-4 w-4" />
                    Taxable Income
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{result.taxableIncome.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg">
                  <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
                    <Percent className="h-4 w-4" />
                    Total Tax Payable
                  </div>
                  <div className="text-3xl font-bold">
                    ₹{result.totalTax.toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    Effective Rate: {result.effectiveRate}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="text-xs text-gray-600">Income Tax</div>
                    <div className="text-lg font-semibold">₹{result.tax.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="text-xs text-gray-600">Cess (4%)</div>
                    <div className="text-lg font-semibold">₹{result.cess.toLocaleString()}</div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Net Income (After Tax)</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{result.netIncome.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tax Breakdown */}
      {result && result.slabData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tax Slab Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.slabData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="slab" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="tax" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
