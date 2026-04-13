'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Landmark, Calculator } from 'lucide-react';
import { formatINR } from '@/lib/format';

export default function PPFCalculatorPage() {
    const [yearlyInvestment, setYearlyInvestment] = useState('150000');
    const [timePeriod, setTimePeriod] = useState('15');
    const interestRate = 7.1; // Current PPF rate
    const [result, setResult] = useState<{ invested: number; interest: number; total: number } | null>(null);

    const calculatePPF = () => {
        const P = Number(yearlyInvestment);
        const r = interestRate / 100;
        const n = Number(timePeriod);

        // PPF Future Value Formula: FV = P × [((1 + r)^n - 1) / r]
        const futureValue = P * (((Math.pow(1 + r, n) - 1) / r));
        const totalInvested = P * n;
        const totalInterest = futureValue - totalInvested;

        setResult({
            invested: totalInvested,
            interest: totalInterest,
            total: futureValue,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 md:px-8 md:py-8">
            <div className="container mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                        PPF Calculator
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Calculate returns on Public Provident Fund
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input Card */}
                    <Card className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-amber-600" />
                                Investment Details
                            </CardTitle>
                            <CardDescription>Enter your PPF investment parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="yearly">Yearly Investment (₹)</Label>
                                <Input
                                    id="yearly"
                                    type="number"
                                    value={yearlyInvestment}
                                    onChange={(e) => setYearlyInvestment(e.target.value)}
                                    placeholder="150000"
                                />
                                <p className="text-xs text-muted-foreground">Maximum: ₹1,50,000 per year</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate">Interest Rate (% per annum)</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    value={interestRate}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Current government rate</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="period">Time Period (Years)</Label>
                                <Input
                                    id="period"
                                    type="number"
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value)}
                                    placeholder="15"
                                />
                                <p className="text-xs text-muted-foreground">Minimum: 15 years</p>
                            </div>
                            <Button onClick={calculatePPF} className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
                                Calculate
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Result Card */}
                    <Card className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-700 text-white shadow-2xl border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Landmark className="h-5 w-5" />
                                Maturity Summary
                            </CardTitle>
                            <CardDescription className="text-white/80">Your PPF returns breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result ? (
                                <>
                                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <p className="text-sm text-white/70 mb-1">Total Investment</p>
                                        <p className="text-2xl font-bold">{formatINR(result.invested)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <p className="text-sm text-white/70 mb-1">Total Interest</p>
                                        <p className="text-2xl font-bold text-amber-200">{formatINR(result.interest)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                                        <p className="text-sm text-white/70 mb-1">Maturity Value</p>
                                        <p className="text-3xl font-bold">{formatINR(result.total)}</p>
                                    </div>
                                    <div className="mt-4 p-3 rounded-lg bg-white/10 border border-white/20">
                                        <p className="text-xs text-white/70">
                                            💡 PPF is tax-free under EEE (Exempt-Exempt-Exempt) category
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
