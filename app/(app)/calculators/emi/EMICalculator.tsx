'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatINR, formatNumber } from '@/lib/utils'
import { Calculator, Download, HelpCircle, TrendingDown, Sparkles } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface EMIFormData {
  principal: string
  rateApr: string
  tenureYears: string
}

interface SavingsFormData {
  extraEmisPerYear: string
  emiIncreasePercent: string
  oneTimePrepayment: string
  prepayMonth: string
  startMonth: string
}

export default function EMICalculator() {
  const [loanType, setLoanType] = useState<'home' | 'other'>('home')
  const [formData, setFormData] = useState<EMIFormData>({
    principal: '5000000',
    rateApr: '8.5',
    tenureYears: '20',
  })
  const [savingsData, setSavingsData] = useState<SavingsFormData>({
    extraEmisPerYear: '1',
    emiIncreasePercent: '5',
    oneTimePrepayment: '0',
    prepayMonth: '12',
    startMonth: '1',
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showSavings, setShowSavings] = useState(false)

  const handleCalculate = async (withSavings = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/calc/emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          savings: withSavings ? savingsData : null,
        }),
      })
      const data = await response.json()
      setResult(data)
      setShowSavings(withSavings)
    } catch (error) {
      console.error('Calculation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportSchedule = (format: 'csv' | 'xlsx') => {
    const schedule = result?.savingsSchedule || result?.baseSchedule
    if (!schedule) return

    const csv = [
      ['Month', 'EMI', 'Principal', 'Interest', 'Prepayment', 'Balance'],
      ...schedule.map((row: any) => [
        row.month,
        row.emi.toFixed(2),
        row.principal.toFixed(2),
        row.interest.toFixed(2),
        row.prepayment.toFixed(2),
        row.balance.toFixed(2),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emi-schedule-${loanType}.csv`
    a.click()
  }

  const getDefaultHints = () => {
    if (loanType === 'home') {
      return {
        extraEmis: '1-2 extra EMIs per year can reduce tenure significantly',
        stepUp: '5-10% annual step-up aligns with salary increments',
        prepay: 'Consider bonuses or tax refunds for lump-sum prepayments',
      }
    }
    return {
      extraEmis: '2-4 extra EMIs per year for faster debt clearance',
      stepUp: '10-15% annual step-up for aggressive repayment',
      prepay: 'Use windfalls to make large one-time prepayments',
    }
  }

  const hints = getDefaultHints()

  const chartData = result?.baseSchedule
    ?.filter((_: any, idx: number) => idx % 12 === 0)
    .map((row: any) => ({
      month: Math.floor(row.month / 12),
      Principal: row.principal,
      Interest: row.interest,
      Balance: row.balance,
    }))

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          EMI Calculator + Savings Planner
        </h2>
        <p className="text-gray-600">
          Calculate your loan EMI and discover how to save lakhs in interest with smart prepayment strategies
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
            <CardDescription>Enter your loan information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="principal">Loan Amount (₹)</Label>
              <Input
                id="principal"
                type="number"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="rate">Interest Rate (% p.a.)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={formData.rateApr}
                onChange={(e) => setFormData({ ...formData, rateApr: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tenure">Loan Tenure (Years)</Label>
              <Input
                id="tenure"
                type="number"
                value={formData.tenureYears}
                onChange={(e) => setFormData({ ...formData, tenureYears: e.target.value })}
              />
            </div>
            <Button onClick={() => handleCalculate(false)} className="w-full" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate EMI'}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-6">
          {result && (
            <>
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-600 mb-1">Monthly EMI</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatINR(result.summaryBefore.emi)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-600 mb-1">Total Interest</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatINR(
                        showSavings && result.summaryAfter
                          ? result.summaryAfter.totalInterest
                          : result.summaryBefore.totalInterest
                      )}
                    </div>
                    {showSavings && result.savingsDelta && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        ↓ Saved {formatINR(result.savingsDelta.interestSaved)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-600 mb-1">Total Payment</div>
                    <div className="text-2xl font-bold">
                      {formatINR(
                        showSavings && result.summaryAfter
                          ? result.summaryAfter.totalPayment
                          : result.summaryBefore.totalPayment
                      )}
                    </div>
                    {showSavings && result.savingsDelta && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        {result.savingsDelta.monthsSaved} months earlier
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              {chartData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Breakdown Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatINR(value)} />
                        <Legend />
                        <Area type="monotone" dataKey="Principal" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                        <Area type="monotone" dataKey="Interest" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Savings Planner */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-6 w-6 text-green-600" />
                    How to Save Money?
                  </CardTitle>
                  <CardDescription>
                    Explore prepayment strategies to reduce interest and close your loan faster
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={loanType} onValueChange={(v) => setLoanType(v as 'home' | 'other')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="home">Home Loan</TabsTrigger>
                      <TabsTrigger value="other">Other Loans</TabsTrigger>
                    </TabsList>
                    <TabsContent value={loanType} className="space-y-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="extraEmis" className="flex items-center gap-2">
                            Extra EMIs per Year
                            <button className="text-gray-400 hover:text-gray-600" title={hints.extraEmis}>
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </Label>
                          <Input
                            id="extraEmis"
                            type="number"
                            value={savingsData.extraEmisPerYear}
                            onChange={(e) =>
                              setSavingsData({ ...savingsData, extraEmisPerYear: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="stepUp" className="flex items-center gap-2">
                            EMI Increase Each Year (%)
                            <button className="text-gray-400 hover:text-gray-600" title={hints.stepUp}>
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </Label>
                          <Input
                            id="stepUp"
                            type="number"
                            step="0.1"
                            value={savingsData.emiIncreasePercent}
                            onChange={(e) =>
                              setSavingsData({ ...savingsData, emiIncreasePercent: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="prepay" className="flex items-center gap-2">
                            One-time Prepayment (₹)
                            <button className="text-gray-400 hover:text-gray-600" title={hints.prepay}>
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </Label>
                          <Input
                            id="prepay"
                            type="number"
                            value={savingsData.oneTimePrepayment}
                            onChange={(e) =>
                              setSavingsData({ ...savingsData, oneTimePrepayment: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="prepayMonth">Prepay at Month</Label>
                          <Input
                            id="prepayMonth"
                            type="number"
                            value={savingsData.prepayMonth}
                            onChange={(e) =>
                              setSavingsData({ ...savingsData, prepayMonth: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCalculate(true)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Recalculate with Savings
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* AI Explanation */}
              {result.aiExplanation && (
                <Card className="border-2 border-purple-200 bg-purple-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-purple-900 mb-2">AI Insight</div>
                        <p className="text-gray-700">{result.aiExplanation}</p>
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Educational only, not financial advice.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Export */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => exportSchedule('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
