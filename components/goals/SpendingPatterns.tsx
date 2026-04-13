'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, TrendingDown, Calendar, AlertCircle, Lightbulb, Loader2 } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface SpendingPattern {
    type: 'time_based' | 'day_based' | 'emotional' | 'category_cluster'
    description: string
    frequency: string
    avgCost: number
    monthlyCost: number
    suggestion: string
    potentialSavings: number
    trigger?: string
}

const patternIcons = {
    time_based: Calendar,
    day_based: Calendar,
    emotional: AlertCircle,
    category_cluster: TrendingDown,
}

const patternColors = {
    time_based: 'from-blue-500 to-blue-700',
    day_based: 'from-purple-500 to-purple-700',
    emotional: 'from-red-500 to-red-700',
    category_cluster: 'from-green-500 to-green-700',
}

export default function SpendingPatterns() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [patterns, setPatterns] = useState<SpendingPattern[]>([])
    const [analyzed, setAnalyzed] = useState(false)

    const analyzePatterns = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/goals/analyze-patterns', {
                method: 'POST',
                credentials: 'include',
            })

            if (!res.ok) throw new Error('Failed to analyze patterns')

            const data = await res.json()
            setPatterns(data.patterns || [])
            setAnalyzed(true)

            if (data.patterns && data.patterns.length > 0) {
                toast({
                    title: 'Analysis Complete!',
                    description: `Found ${data.patterns.length} spending patterns`,
                })
            } else {
                toast({
                    title: 'No Patterns Found',
                    description: 'Add more expenses to get personalized insights',
                })
            }
        } catch (error) {
            console.error('Pattern analysis error:', error)
            toast({
                title: 'Error',
                description: 'Failed to analyze spending patterns',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="glass-card border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">AI Spending Detective</CardTitle>
                            <p className="text-sm text-muted-foreground">Discover hidden patterns in your spending</p>
                        </div>
                    </div>
                    {!analyzed && (
                        <Button
                            onClick={analyzePatterns}
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:opacity-90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Analyze My Spending
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>

            {analyzed && patterns.length > 0 && (
                <CardContent className="space-y-4">
                    {patterns.map((pattern, idx) => {
                        const Icon = patternIcons[pattern.type]
                        const gradient = patternColors[pattern.type]

                        return (
                            <Card key={idx} className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg mb-1">{pattern.description}</h4>
                                            <p className="text-sm text-muted-foreground mb-3">{pattern.frequency}</p>

                                            {pattern.trigger && (
                                                <div className="flex items-center gap-2 mb-3 text-sm text-orange-600 dark:text-orange-400">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>Trigger: {pattern.trigger}</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Monthly Cost</p>
                                                    <p className="text-lg font-bold text-red-600">{formatINR(pattern.monthlyCost)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Potential Savings</p>
                                                    <p className="text-lg font-bold text-green-600">{formatINR(pattern.potentialSavings)}</p>
                                                </div>
                                            </div>

                                            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                                <div className="flex items-start gap-2">
                                                    <Lightbulb className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Smart Suggestion</p>
                                                        <p className="text-sm text-green-700 dark:text-green-300">{pattern.suggestion}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    <div className="flex justify-center pt-2">
                        <Button variant="outline" onClick={analyzePatterns} disabled={loading}>
                            <Brain className="h-4 w-4 mr-2" />
                            Re-analyze Patterns
                        </Button>
                    </div>
                </CardContent>
            )}

            {analyzed && patterns.length === 0 && (
                <CardContent>
                    <div className="text-center py-8">
                        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Patterns Found</h3>
                        <p className="text-muted-foreground mb-4">
                            Add more expenses over the next few weeks to get personalized insights
                        </p>
                        <Button variant="outline" onClick={analyzePatterns} disabled={loading}>
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
