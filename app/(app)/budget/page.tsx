'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatINR } from '@/lib/format'
import { calculateBudget, type BudgetInputs, type BudgetResult } from '@/lib/budget/engine'
import { CITY_TIERS, ROUNDING_OPTIONS, SCENARIO_PRESETS, EF_TARGET_MONTHS_DEFAULT, INVESTING_FLOOR_DEFAULT } from '@/lib/budget/constants'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Sparkles, Download, Save, RotateCcw, AlertTriangle, TrendingUp, Shield, Wallet, Copy, Loader2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#06b6d4', '#a855f7', '#22c55e', '#f43f5e', '#6b7280'
]

export default function SmartBudgetPage() {
  const supabase = createSupabaseClient()
  
  // Form state
  const [salary, setSalary] = useState(100000)
  const [cityTier, setCityTier] = useState<keyof typeof CITY_TIERS>('tier-2')
  const [dependents, setDependents] = useState(0)
  const [rent, setRent] = useState(0)
  const [emis, setEmis] = useState(0)
  const [insurance, setInsurance] = useState(0)
  const [subscriptions, setSubscriptions] = useState(0)
  const [hasHighInterestDebt, setHasHighInterestDebt] = useState(false)
  const [debtApr, setDebtApr] = useState(0)
  
  // Goal priorities (0-100)
  const [efPriority, setEfPriority] = useState(25)
  const [debtPriority, setDebtPriority] = useState(25)
  const [investingPriority, setInvestingPriority] = useState(25)
  const [lifestylePriority, setLifestylePriority] = useState(25)
  
  // Settings
  const [efTargetMonths, setEfTargetMonths] = useState(EF_TARGET_MONTHS_DEFAULT)
  const [investingFloor, setInvestingFloor] = useState(INVESTING_FLOOR_DEFAULT * 100)
  const [roundingStep, setRoundingStep] = useState(100)
  
  // Result state
  const [result, setResult] = useState<BudgetResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [presets, setPresets] = useState<any[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [presetName, setPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)

  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('budget_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPresets(data)
      }
    } catch (error) {
      console.error('Error loading presets:', error)
    }
  }

  const handleGenerate = () => {
    setLoading(true)
    try {
      const inputs: BudgetInputs = {
        salary,
        cityTier,
        dependents,
        fixedCommitments: {
          rent,
          emis,
          insurance,
          subscriptions,
        },
        hasHighInterestDebt,
        debtApr: hasHighInterestDebt ? debtApr : undefined,
        goalPriorities: {
          emergencyFund: efPriority,
          debtPrepayment: debtPriority,
          investing: investingPriority,
          lifestyle: lifestylePriority,
        },
        emergencyFundTargetMonths: efTargetMonths,
        investingFloor: investingFloor / 100,
        roundingStep,
      }

      const budgetResult = calculateBudget(inputs)
      setResult(budgetResult)
    } catch (error) {
      console.error('Error generating budget:', error)
      alert('Failed to generate budget')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (!preset) return

    const inputs = preset.inputs
    setSalary(inputs.salary)
    setCityTier(inputs.cityTier)
    setDependents(inputs.dependents)
    setRent(inputs.fixedCommitments.rent)
    setEmis(inputs.fixedCommitments.emis)
    setInsurance(inputs.fixedCommitments.insurance)
    setSubscriptions(inputs.fixedCommitments.subscriptions)
    setHasHighInterestDebt(inputs.hasHighInterestDebt)
    setDebtApr(inputs.debtApr || 0)
    setEfPriority(inputs.goalPriorities.emergencyFund)
    setDebtPriority(inputs.goalPriorities.debtPrepayment)
    setInvestingPriority(inputs.goalPriorities.investing)
    setLifestylePriority(inputs.goalPriorities.lifestyle)
    setEfTargetMonths(inputs.emergencyFundTargetMonths)
    setInvestingFloor(inputs.investingFloor * 100)
    setRoundingStep(inputs.roundingStep)
  }

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please log in to save presets')
        return
      }

      const inputs: BudgetInputs = {
        salary,
        cityTier,
        dependents,
        fixedCommitments: { rent, emis, insurance, subscriptions },
        hasHighInterestDebt,
        debtApr: hasHighInterestDebt ? debtApr : undefined,
        goalPriorities: {
          emergencyFund: efPriority,
          debtPrepayment: debtPriority,
          investing: investingPriority,
          lifestyle: lifestylePriority,
        },
        emergencyFundTargetMonths: efTargetMonths,
        investingFloor: investingFloor / 100,
        roundingStep,
      }

      const { error } = await supabase
        .from('budget_presets')
        .insert({
          user_id: user.id,
          name: presetName,
          inputs,
        })

      if (error) throw error

      alert('Preset saved successfully!')
      setPresetName('')
      setShowSavePreset(false)
      await loadPresets()
    } catch (error) {
      console.error('Error saving preset:', error)
      alert('Failed to save preset')
    }
  }

  const handleClear = () => {
    setSalary(100000)
    setCityTier('tier-2')
    setDependents(0)
    setRent(0)
    setEmis(0)
    setInsurance(0)
    setSubscriptions(0)
    setHasHighInterestDebt(false)
    setDebtApr(0)
    setEfPriority(25)
    setDebtPriority(25)
    setInvestingPriority(25)
    setLifestylePriority(25)
    setEfTargetMonths(EF_TARGET_MONTHS_DEFAULT)
    setInvestingFloor(INVESTING_FLOOR_DEFAULT * 100)
    setRoundingStep(100)
    setResult(null)
  }

  const handleCopyNumbers = () => {
    if (!result) return
    
    const text = result.allocations
      .filter(a => a.amount > 0)
      .map(a => `${a.name}: ${formatINR(a.amount)} (${a.percentage.toFixed(1)}%)`)
      .join('\n')
    
    navigator.clipboard.writeText(text)
    alert('Budget copied to clipboard!')
  }

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!result) return
    
    try {
      const response = await fetch('/api/budget/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, format }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `budget-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Failed to export budget')
    }
  }

  const chartData = result?.allocations
    .filter(a => a.amount > 0)
    .map((a, i) => ({
      name: a.name,
      value: a.amount,
      percentage: a.percentage,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })) || []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Wallet className="h-10 w-10 text-blue-600" />
          Smart Budget Planner
        </h1>
        <p className="text-muted-foreground">AI-powered monthly budgeting based on your goals & lifestyle</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Inputs */}
        <div className="space-y-6">
          {/* Main Input */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly In-hand Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Salary (₹)</Label>
                  <Input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    placeholder="100000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context */}
          <Card>
            <CardHeader>
              <CardTitle>Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>City Tier</Label>
                <Select value={cityTier} onValueChange={(v: any) => setCityTier(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CITY_TIERS).map(([key, tier]) => (
                      <SelectItem key={key} value={key}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dependents</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={dependents}
                  onChange={(e) => setDependents(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Existing Commitments */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Commitments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rent (₹)</Label>
                <Input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Total EMIs (₹)</Label>
                <Input
                  type="number"
                  value={emis}
                  onChange={(e) => setEmis(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Insurance Premiums (₹)</Label>
                <Input
                  type="number"
                  value={insurance}
                  onChange={(e) => setInsurance(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Subscriptions (₹)</Label>
                <Input
                  type="number"
                  value={subscriptions}
                  onChange={(e) => setSubscriptions(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasHighInterestDebt}
                  onChange={(e) => setHasHighInterestDebt(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label>High-interest debt?</Label>
              </div>
              {hasHighInterestDebt && (
                <div>
                  <Label>APR (%)</Label>
                  <Input
                    type="number"
                    value={debtApr}
                    onChange={(e) => setDebtApr(Number(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goal Priorities */}
          <Card>
            <CardHeader>
              <CardTitle>Goal Priority Sliders (0-100)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Emergency Fund: {efPriority}</Label>
                <Slider
                  value={[efPriority]}
                  onValueChange={(v) => setEfPriority(v[0])}
                  max={100}
                  step={5}
                />
              </div>
              <div>
                <Label>Debt Prepayment: {debtPriority}</Label>
                <Slider
                  value={[debtPriority]}
                  onValueChange={(v) => setDebtPriority(v[0])}
                  max={100}
                  step={5}
                />
              </div>
              <div>
                <Label>Investing: {investingPriority}</Label>
                <Slider
                  value={[investingPriority]}
                  onValueChange={(v) => setInvestingPriority(v[0])}
                  max={100}
                  step={5}
                />
              </div>
              <div>
                <Label>Lifestyle: {lifestylePriority}</Label>
                <Slider
                  value={[lifestylePriority]}
                  onValueChange={(v) => setLifestylePriority(v[0])}
                  max={100}
                  step={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Emergency Fund Target Months: {efTargetMonths}</Label>
                <Slider
                  value={[efTargetMonths]}
                  onValueChange={(v) => setEfTargetMonths(v[0])}
                  min={3}
                  max={12}
                  step={1}
                />
              </div>
              <div>
                <Label>Minimum Investing Floor (%): {investingFloor}</Label>
                <Slider
                  value={[investingFloor]}
                  onValueChange={(v) => setInvestingFloor(v[0])}
                  min={5}
                  max={30}
                  step={5}
                />
              </div>
              <div>
                <Label>Round to nearest</Label>
                <Select value={String(roundingStep)} onValueChange={(v) => setRoundingStep(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROUNDING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleGenerate} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Budget
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                {presets.length > 0 && (
                  <Select value={selectedPreset} onValueChange={handleLoadPreset}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Load Preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" onClick={() => setShowSavePreset(!showSavePreset)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
              {showSavePreset && (
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Preset name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                  <Button onClick={handleSavePreset}>Save</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Essentials</div>
                      <div className="text-2xl font-bold">{result.summary.essentialsPercentage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Investing</div>
                      <div className="text-2xl font-bold text-green-600">{result.summary.investingPercentage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Lifestyle</div>
                      <div className="text-2xl font-bold">{result.summary.lifestylePercentage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">EF Target</div>
                      <div className="text-2xl font-bold">{result.summary.monthsToEfTarget} mo</div>
                    </div>
                  </div>
                  {result.badges.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.badges.map((badge, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatINR(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.allocations
                      .filter(a => a.amount > 0)
                      .map((allocation, i) => (
                        <div key={allocation.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{allocation.icon}</span>
                            <div>
                              <div className="font-medium">{allocation.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">{allocation.type}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatINR(allocation.amount)}</div>
                            <div className="text-xs text-muted-foreground">{allocation.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Warnings */}
              {result.notes.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="h-5 w-5" />
                      Insights & Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.notes.map((note, i) => (
                        <li key={i} className="text-sm text-orange-700">• {note}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={handleCopyNumbers}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Numbers
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground">Generate your budget to see results</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
