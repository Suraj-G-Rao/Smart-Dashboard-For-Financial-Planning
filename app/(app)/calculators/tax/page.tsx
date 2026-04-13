'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Calculator } from 'lucide-react';
import { formatINR } from '@/lib/format';

export default function TaxCalculatorPage() {
    const [income, setIncome] = useState('1000000');
    const [regime, setRegime] = useState<'old' | 'new'>('new');
    const [deductions, setDeductions] = useState('50000');
    const [result, setResult] = useState<{ taxable: number; tax: number; netIncome: number } | null>(null);

    const calculateTax = () => {
        const grossIncome = Number(income);
        const totalDeductions = regime === 'old' ? Number(deductions) : 0;
        const taxableIncome = grossIncome - totalDeductions;
        let tax = 0;

        if (regime === 'new') {
            // New Tax Regime (FY 2023-24)
            if (taxableIncome <= 300000) tax = 0;
            else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
            else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10;
            else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
            else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.20;
            else tax = 150000 + (taxableIncome - 1500000) * 0.30;
        } else {
            // Old Tax Regime
            if (taxableIncome <= 250000) tax = 0;
            else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
            else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
            else tax = 112500 + (taxableIncome - 1000000) * 0.30;
        }

        // Add 4% cess
        tax = tax * 1.04;

        setResult({
            taxable: taxableIncome,
            tax: tax,
            netIncome: grossIncome - tax,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 md:px-8 md:py-8">
            <div className="container mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                        Tax Calculator
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Calculate your income tax liability for FY 2023-24
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input Card */}
                    <Card className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-rose-600" />
                                Income Details
                            </CardTitle>
                            <CardDescription>Enter your income and tax regime</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="income">Annual Income (₹)</Label>
                                <Input
                                    id="income"
                                    type="number"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                    placeholder="1000000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="regime">Tax Regime</Label>
                                <Select value={regime} onValueChange={(value: 'old' | 'new') => setRegime(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New Tax Regime (Default)</SelectItem>
                                        <SelectItem value="old">Old Tax Regime</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {regime === 'old' && (
                                <div className="space-y-2">
                                    <Label htmlFor="deductions">Deductions (₹)</Label>
                                    <Input
                                        id="deductions"
                                        type="number"
                                        value={deductions}
                                        onChange={(e) => setDeductions(e.target.value)}
                                        placeholder="50000"
                                    />
                                    <p className="text-xs text-muted-foreground">80C, 80D, HRA, etc.</p>
                                </div>
                            )}
                            <Button onClick={calculateTax} className="w-full bg-gradient-to-r from-rose-600 to-pink-600">
                                Calculate Tax
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Result Card */}
                    <Card className="rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-pink-700 text-white shadow-2xl border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Receipt className="h-5 w-5" />
                                Tax Summary
                            </CardTitle>
                            <CardDescription className="text-white/80">Your tax liability breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result ? (
                                <>
                                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <p className="text-sm text-white/70 mb-1">Taxable Income</p>
                                        <p className="text-2xl font-bold">{formatINR(result.taxable)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <p className="text-sm text-white/70 mb-1">Total Tax (incl. cess)</p>
                                        <p className="text-2xl font-bold text-rose-200">{formatINR(result.tax)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                                        <p className="text-sm text-white/70 mb-1">Net Income (After Tax)</p>
                                        <p className="text-3xl font-bold">{formatINR(result.netIncome)}</p>
                                    </div>
                                    <div className="mt-4 p-3 rounded-lg bg-white/10 border border-white/20">
                                        <p className="text-xs text-white/70">
                                            💡 Using {regime === 'new' ? 'New' : 'Old'} Tax Regime
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <Calculator className="h-16 w-16 mx-auto text-white/50 mb-4" />
                                    <p className="text-white/70">Enter values and click Calculate to see results</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
