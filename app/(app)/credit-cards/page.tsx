'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CreditCard, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function CreditCardRecommendationPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<any>(null)

  const [form, setForm] = useState({
    expenseDescription: '',
    expenseAmount: '',
    expenseCategory: '',
    incomeRange: '',
    creditScore: '',
    preference: '',
  })

  const handleGetRecommendation = async () => {
    if (!form.expenseDescription.trim()) {
      setError('Please describe your expense')
      return
    }

    setLoading(true)
    setError(null)
    setRecommendation(null)

    try {
      const res = await fetch('/api/credit-cards/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseDescription: form.expenseDescription,
          expenseAmount: form.expenseAmount ? Number(form.expenseAmount) : undefined,
          expenseCategory: form.expenseCategory,
          incomeRange: form.incomeRange,
          creditScore: form.creditScore,
          preference: form.preference,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get recommendation')
      }

      setRecommendation(data.recommendation)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="h-10 w-10 text-purple-600" />
          Best Credit Card for Your Expense
        </h1>
        <p className="text-gray-600">
          Tell us what you plan to spend on. We'll suggest the most rewarding credit card for you.
        </p>
      </div>

      {/* Input Form */}
      <Card className="mb-8 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Describe Your Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Expense Description */}
          <div>
            <Label htmlFor="description">What do you want to spend on? *</Label>
            <Textarea
              id="description"
              placeholder="Examples:&#10;• I want to buy a car worth ₹25 lakh&#10;• Monthly groceries and food delivery around ₹15,000&#10;• International travel to Europe for 10 days&#10;• Fuel expenses of ₹6,000 per month&#10;• Online shopping and Amazon purchases"
              value={form.expenseDescription}
              onChange={(e) => setForm({ ...form, expenseDescription: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Expense Amount */}
            <div>
              <Label htmlFor="amount">Expense Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 50000"
                value={form.expenseAmount}
                onChange={(e) => setForm({ ...form, expenseAmount: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Optional but recommended</p>
            </div>

            {/* Expense Category */}
            <div>
              <Label htmlFor="category">Expense Category</Label>
              <select
                id="category"
                value={form.expenseCategory}
                onChange={(e) => setForm({ ...form, expenseCategory: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select category</option>
                <option value="Travel">Travel</option>
                <option value="Fuel">Fuel</option>
                <option value="Shopping (Online)">Shopping (Online)</option>
                <option value="Shopping (Offline)">Shopping (Offline)</option>
                <option value="Dining & Food">Dining & Food</option>
                <option value="Electronics">Electronics</option>
                <option value="Vehicle Purchase">Vehicle Purchase</option>
                <option value="Education">Education</option>
                <option value="Insurance Payments">Insurance Payments</option>
                <option value="Utilities & Bills">Utilities & Bills</option>
                <option value="Luxury / Lifestyle">Luxury / Lifestyle</option>
                <option value="International Spend">International Spend</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* User Profile */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3 text-sm">Your Profile (Optional)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Income Range */}
              <div>
                <Label htmlFor="income">Income Range</Label>
                <select
                  id="income"
                  value={form.incomeRange}
                  onChange={(e) => setForm({ ...form, incomeRange: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select range</option>
                  <option value="<5L">Less than ₹5L</option>
                  <option value="5–10L">₹5L – ₹10L</option>
                  <option value="10–20L">₹10L – ₹20L</option>
                  <option value="20L+">₹20L+</option>
                </select>
              </div>

              {/* Credit Score */}
              <div>
                <Label htmlFor="credit">Credit Score</Label>
                <select
                  id="credit"
                  value={form.creditScore}
                  onChange={(e) => setForm({ ...form, creditScore: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select range</option>
                  <option value="<700">Less than 700</option>
                  <option value="700–750">700 – 750</option>
                  <option value="750+">750+</option>
                </select>
              </div>

              {/* Preference */}
              <div>
                <Label htmlFor="preference">Preference</Label>
                <select
                  id="preference"
                  value={form.preference}
                  onChange={(e) => setForm({ ...form, preference: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select preference</option>
                  <option value="Cashback">Cashback</option>
                  <option value="Reward Points">Reward Points</option>
                  <option value="Travel Miles">Travel Miles</option>
                  <option value="Lounge Access">Lounge Access</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleGetRecommendation}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Analyzing best card for your expense...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Find Best Credit Card
              </>
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendation Results */}
      {recommendation && (
        <div className="space-y-6">
          {/* Main Recommendation */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-6 w-6" />
                Recommended Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-green-900">
                  {recommendation.recommended_card.name}
                </h2>
                <p className="text-green-700">{recommendation.recommended_card.bank}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Best For</p>
                  <p className="font-medium">{recommendation.recommended_card.best_for}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estimated Rewards</p>
                  <p className="font-medium text-green-700">
                    {recommendation.recommended_card.estimated_rewards}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Annual Fee</p>
                  <p className="font-medium">{recommendation.recommended_card.annual_fee}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Eligibility</p>
                  <p className="font-medium">{recommendation.recommended_card.eligibility}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Reward Structure</p>
                <p className="text-sm">{recommendation.recommended_card.reward_structure}</p>
              </div>

              {recommendation.recommended_card.additional_benefits && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Additional Benefits</p>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendation.recommended_card.additional_benefits.map((benefit: string, idx: number) => (
                      <li key={idx} className="text-sm">{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Why This Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Why This Card?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendation.why_this_card.map((reason: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Alternate Cards */}
          {recommendation.alternate_cards && recommendation.alternate_cards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Other Good Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendation.alternate_cards.map((card: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-400 pl-4 py-2">
                    <p className="font-semibold">{card.name}</p>
                    <p className="text-sm text-gray-600">{card.bank}</p>
                    <p className="text-sm mt-1">{card.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {recommendation.warnings && recommendation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Important Notes
              </h3>
              <ul className="space-y-1">
                {recommendation.warnings.map((warning: string, idx: number) => (
                  <li key={idx} className="text-sm text-yellow-800">• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Credit card suggestions are informational and based on publicly available reward structures.
          Please verify details with the respective bank before applying.
        </p>
      </div>
    </div>
  )
}
