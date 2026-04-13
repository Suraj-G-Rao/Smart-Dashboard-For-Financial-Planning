'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/use-toast'
import { formatINR } from '@/lib/utils'
import { Target, TrendingUp, Calendar, Brain, Zap, Edit, Trash2, Home, Car, GraduationCap, Heart, Plane, Briefcase, Baby, Shield, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import CreateGoalDialog from '@/components/goals/CreateGoalDialog'
import AddFundsDialog from '@/components/goals/AddFundsDialog'
import GoalSuggestionsDialog from '@/components/goals/GoalSuggestionsDialog'
import SpendingPatterns from '@/components/goals/SpendingPatterns'

interface Goal {
  id: string
  name: string
  target_amount: number
  saved_amount: number
  target_date: string
  priority: number
  monthly_sip_required: number
  description?: string
  category: string
  status: string
  progress_percentage: number
  months_remaining: number
  calculated_monthly_sip: number
  goal_status: string
  created_at: string
  updated_at: string
}

interface GoalForecast {
  monthlyIncome: number
  monthlyExpense: number
  monthlySavings: number
  remaining: number
  etaMonths: number
}

interface BoostRecommendation {
  change: string
  estMonthlyImpact: number
  reason: string
}

// Category configuration
const categoryConfig: Record<string, { icon: any; gradient: string; color: string }> = {
  home: { icon: Home, gradient: 'from-blue-500 to-blue-700', color: 'text-blue-600' },
  car: { icon: Car, gradient: 'from-red-500 to-red-700', color: 'text-red-600' },
  education: { icon: GraduationCap, gradient: 'from-purple-500 to-purple-700', color: 'text-purple-600' },
  wedding: { icon: Heart, gradient: 'from-pink-500 to-pink-700', color: 'text-pink-600' },
  vacation: { icon: Plane, gradient: 'from-cyan-500 to-cyan-700', color: 'text-cyan-600' },
  business: { icon: Briefcase, gradient: 'from-orange-500 to-orange-700', color: 'text-orange-600' },
  child: { icon: Baby, gradient: 'from-green-500 to-green-700', color: 'text-green-600' },
  emergency: { icon: Shield, gradient: 'from-yellow-500 to-yellow-700', color: 'text-yellow-600' },
  other: { icon: Target, gradient: 'from-gray-500 to-gray-700', color: 'text-gray-600' },
}

export default function GoalsPage() {
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [forecasts, setForecasts] = useState<Record<string, GoalForecast>>({})
  const [extraMonthly, setExtraMonthly] = useState<Record<string, number>>({})
  const [boostPlans, setBoostPlans] = useState<Record<string, BoostRecommendation[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [suggestionData, setSuggestionData] = useState<any>(null)

  const fetchGoals = async () => {
    try {
      setGoalsLoading(true)
      const response = await fetch('/api/goals', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch goals')
      }

      const data = await response.json()
      setGoals(data.goals || [])
    } catch (error) {
      console.error('Fetch goals error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive',
      })
    } finally {
      setGoalsLoading(false)
    }
  }

  const fetchForecast = async (goalId: string, extraAmount: number = 0) => {
    try {
      setLoading(prev => ({ ...prev, [goalId]: true }))

      const response = await fetch('/api/goals/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ goalId, extraMonthly: extraAmount }),
      })

      if (!response.ok) throw new Error('Failed to fetch forecast')

      const data = await response.json()
      setForecasts(prev => ({ ...prev, [goalId]: data }))

      return data
    } catch (error) {
      console.error('Forecast error:', error)
      toast({
        title: 'Error',
        description: 'Failed to calculate goal forecast',
        variant: 'destructive',
      })
    } finally {
      setLoading(prev => ({ ...prev, [goalId]: false }))
    }
  }

  const fetchBoostPlan = async (goalId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return

      const forecast = forecasts[goalId]
      if (!forecast) return

      // Get top categories from recent transactions (mock data for now)
      const topCategories: [string, number][] = [
        ['Food', 12000],
        ['Travel', 4500],
        ['Shopping', 6000],
      ]

      const response = await fetch('/api/goals/boost-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          goal: goal.name,
          remaining: forecast.remaining,
          monthlySavings: forecast.monthlySavings,
          topCategories,
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch boost plan')

      const data = await response.json()
      setBoostPlans(prev => ({ ...prev, [goalId]: data.recommendations }))
    } catch (error) {
      console.error('Boost plan error:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate boost plan',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    console.log('Delete button clicked for goal:', goalId)

    if (!confirm('Are you sure you want to delete this goal?')) {
      console.log('Delete cancelled by user')
      return
    }

    console.log('Attempting to delete goal:', goalId)
    try {
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      console.log('Delete response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Delete failed:', errorData)
        throw new Error(errorData.error || 'Failed to delete goal')
      }

      const data = await response.json()
      console.log('Delete successful:', data)

      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      })

      fetchGoals()
    } catch (error: any) {
      console.error('Delete goal error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete goal',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  useEffect(() => {
    // Fetch initial forecasts for all goals
    goals.forEach(goal => {
      fetchForecast(goal.id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals])

  const handleExtraMonthlyChange = (goalId: string, value: number[]) => {
    const extraAmount = value[0]
    setExtraMonthly(prev => ({ ...prev, [goalId]: extraAmount }))
    fetchForecast(goalId, extraAmount)
  }

  const handleGoalSuggestionSelected = (suggestion: any) => {
    setSuggestionData(suggestion)
    setShowCreateDialog(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Target className="h-7 w-7 text-primary" />
            </div>
            Financial Goals
          </h1>
          <p className="text-muted-foreground">Track and achieve your financial milestones</p>
        </div>
        <CreateGoalDialog
          onGoalCreated={fetchGoals}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          suggestionData={suggestionData}
        />
      </div>

      {/* AI Spending Patterns */}
      <SpendingPatterns />

      {/* Loading State */}
      {goalsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first financial goal to get started!</p>
            <CreateGoalDialog onGoalCreated={fetchGoals} />
          </CardContent>
        </Card>
      ) : (
        /* Goals Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = goal.progress_percentage || 0
            const monthsLeft = goal.months_remaining || 0
            const category = goal.category?.toLowerCase() || 'other'
            const config = categoryConfig[category] || categoryConfig.other
            const CategoryIcon = config.icon

            return (
              <Card
                key={goal.id}
                className={`relative overflow-hidden glass-card border border-border/50 hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in ${goal.priority === 1 ? 'ring-2 ring-primary/20' : ''}`}
                style={{ animationDelay: `${goals.indexOf(goal) * 0.1}s` }}
              >
                {/* Category gradient background */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <CategoryIcon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">{goal.name}</CardTitle>
                    </div>
                    {goal.goal_status === 'On Track' || goal.goal_status === 'Completed' ? (
                      <span className="bg-success/10 text-success text-xs font-medium px-2.5 py-1 rounded-full border border-success/20">
                        {goal.goal_status}
                      </span>
                    ) : (
                      <span className="bg-warning/10 text-warning text-xs font-medium px-2.5 py-1 rounded-full border border-warning/20">
                        {goal.goal_status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {monthsLeft} months remaining
                  </div>
                  {/* ETA Chip */}
                  {forecasts[goal.id] && (
                    <div className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                        ETA: {forecasts[goal.id].etaMonths} months
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-muted-foreground font-medium">Progress</span>
                      <span className="font-bold text-primary">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={progress} className="h-2.5" />
                      {/* Milestone markers */}
                      <div className="absolute top-0 left-1/4 w-0.5 h-2.5 bg-white/50" />
                      <div className="absolute top-0 left-1/2 w-0.5 h-2.5 bg-white/50" />
                      <div className="absolute top-0 left-3/4 w-0.5 h-2.5 bg-white/50" />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      {[25, 50, 75, 100].map(milestone => (
                        <span key={milestone} className={progress >= milestone ? 'text-success font-medium' : ''}>
                          {milestone >= 100 ? '🎯' : progress >= milestone ? '✓' : milestone + '%'}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm mt-2 text-muted-foreground">
                      <span className="font-medium">{formatINR(goal.saved_amount)}</span>
                      <span className="font-medium">{formatINR(goal.target_amount)}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="font-semibold text-primary">Recommended SIP</span>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">
                      {formatINR(goal.monthly_sip_required || goal.calculated_monthly_sip)}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target: {formatINR(goal.target_amount)} by{' '}
                      {new Date(goal.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* What-if Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        What-if extra monthly
                      </label>
                      <span className="text-sm font-bold text-orange-600">
                        +{formatINR(extraMonthly[goal.id] || 0)}
                      </span>
                    </div>
                    <Slider
                      value={[extraMonthly[goal.id] || 0]}
                      onValueChange={(value) => handleExtraMonthlyChange(goal.id, value)}
                      max={10000}
                      step={500}
                      className="w-full"
                      disabled={loading[goal.id]}
                    />
                    {loading[goal.id] && (
                      <div className="text-xs text-muted-foreground">Calculating...</div>
                    )}
                  </div>

                  {/* Boost Plan Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 hover:bg-purple-50 hover:border-purple-200"
                    onClick={() => fetchBoostPlan(goal.id)}
                    disabled={loading[goal.id]}
                  >
                    <Brain className="h-4 w-4" />
                    Generate Boost Plan
                  </Button>

                  {/* Boost Plan Results */}
                  {boostPlans[goal.id] && (
                    <div className="space-y-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        AI Recommendations
                      </h4>
                      {boostPlans[goal.id].map((rec, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <p className="font-medium text-purple-700 dark:text-purple-300">
                            {rec.change}
                          </p>
                          <p className="text-muted-foreground">{rec.reason}</p>
                          <p className="text-green-600 font-medium">
                            +{formatINR(rec.estMonthlyImpact)}/month
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <AddFundsDialog
                      goalId={goal.id}
                      goalName={goal.name}
                      currentAmount={goal.saved_amount}
                      targetAmount={goal.target_amount}
                      onFundsAdded={fetchGoals}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary Card - Only show when there are goals */}
      {!goalsLoading && goals.length > 0 && (
        <Card className="glass-card border-2 border-success/20 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-4">Portfolio Summary</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Target</p>
                    <p className="text-lg font-bold">{formatINR(goals.reduce((sum, g) => sum + g.target_amount, 0))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Saved So Far</p>
                    <p className="text-lg font-bold text-success">{formatINR(goals.reduce((sum, g) => sum + g.saved_amount, 0))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Goals on Track</p>
                    <p className="text-lg font-bold">{goals.filter(g => g.goal_status === 'On Track' || g.goal_status === 'Completed').length}/{goals.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monthly SIP Required</p>
                    <p className="text-lg font-bold text-primary">{formatINR(goals.reduce((sum, g) => sum + (g.monthly_sip_required || g.calculated_monthly_sip), 0))}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
