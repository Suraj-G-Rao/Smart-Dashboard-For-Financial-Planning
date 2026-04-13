'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calculator } from 'lucide-react';
import { formatINR } from '@/lib/format';

export default function SIPCalculatorPage() {
    const [monthlyInvestment, setMonthlyInvestment] = useState('5000');
    const [expectedReturn, setExpectedReturn] = useState('12');
    const [timePeriod, setTimePeriod] = useState('10');
    const [result, setResult] = useState<{ invested: number; returns: number; total: number } | null>(null);

    const calculateSIP = () => {
        const P = Number(monthlyInvestment);
        const r = Number(expectedReturn) / 100 / 12; // Monthly rate
        const n = Number(timePeriod) * 12; // Total months

        // SIP Future Value Formula: FV = P × ((1 + r)^n - 1) / r × (1 + r)
        const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
        const totalInvested = P * n;
        const totalReturns = futureValue - totalInvested;

        setResult({
            invested: totalInvested,
            returns: totalReturns,
            total: futureValue,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 md:px-8 md:py-8">
            <div className="container mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                        SIP Calculator
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Calculate returns on your Systematic Investment Plan
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input Card */}
                    <Card className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-emerald-600" />
                                Investment Details
                            </CardTitle>
                            <CardDescription>Enter your SIP investment parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="monthly">Monthly Investment (₹)</Label>
                                <Input
                                    id="monthly"
                                    type="number"
                                    value={monthlyInvestment}
                                    onChange={(e) => setMonthlyInvestment(e.target.value)}
                                    placeholder="5000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="return">Expected Return Rate (% per annum)</Label>
                                <Input
                                    id="return"
                                    type="number"
                                    value={expectedReturn}
                                    onChange={(e) => setExpectedReturn(e.target.value)}
                                    placeholder="12"
                                    step="0.1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="period">Time Period (Years)</Label>
                                <Input
                                    id="period"
                                    type="number"
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value)}
                                    placeholder="10"
                                />
                            </div>
                            <Button onClick={calculateSIP} className="w-full bg-gradient-to-r from-emerald-600 to-green-600">
                                Calculate
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Result Card */}
                    <Card className="rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white shadow-2xl border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <TrendingUp className="h-5 w-5" />
                                Investment Summary
                            </CardTitle>
                            <CardDescription className="text-white/80">Your SIP returns breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result ? (
                                <>
                                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <p className="text-sm text-white/70 mb-1">Total Investment</p>
                                        <p className="text-2xl font-bold">{formatINR(result.invested)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <p className="text-sm text-white/70 mb-1">Estimated Returns</p>
                                        <p className="text-2xl font-bold text-emerald-200">{formatINR(result.returns)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                                        <p className="text-sm text-white/70 mb-1">Maturity Value</p>
                                        <p className="text-3xl font-bold">{formatINR(result.total)}</p>
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
