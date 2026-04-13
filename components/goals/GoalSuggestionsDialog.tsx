'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, TrendingUp, Calendar, Target } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface GoalSuggestion {
    name: string
    category: string
    targetAmount: number
    priority: string
    duration: number
    reason: string
    monthlyContribution: number
}

interface GoalSuggestionsDialogProps {
    onGoalSelected: (suggestion: GoalSuggestion) => void
}

const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
}

export default function GoalSuggestionsDialog({ onGoalSelected }: GoalSuggestionsDialogProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([])

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/goals/suggest', {
                method: 'POST',
                credentials: 'include',
            })

            if (!res.ok) throw new Error('Failed to fetch suggestions')

            const data = await res.json()
            setSuggestions(data.suggestions || [])
        } catch (error) {
            console.error('Fetch suggestions error:', error)
            toast({
                title: 'Error',
                description: 'Failed to generate goal suggestions',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen && suggestions.length === 0) {
            fetchSuggestions()
        }
    }

    const handleSelectGoal = (suggestion: GoalSuggestion) => {
        onGoalSelected(suggestion)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get AI Goal Suggestions
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                        AI-Powered Goal Suggestions
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Based on your financial profile, here are personalized goals to help you achieve financial success
                    </p>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-4">
                                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="text-center py-8">
                        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No suggestions available</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {suggestions.map((suggestion, idx) => (
                            <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectGoal(suggestion)}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{suggestion.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[suggestion.priority as keyof typeof priorityColors] || priorityColors.low}`}>
                                                {suggestion.priority.toUpperCase()} Priority
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">{formatINR(suggestion.targetAmount)}</div>
                                            <div className="text-xs text-muted-foreground">Target Amount</div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-3">{suggestion.reason}</p>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <div>
                                                <div className="font-medium">{formatINR(suggestion.monthlyContribution)}/month</div>
                                                <div className="text-xs text-muted-foreground">Recommended SIP</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <div className="font-medium">{suggestion.duration} months</div>
                                                <div className="text-xs text-muted-foreground">Duration</div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-4" size="sm">
                                        <Target className="h-4 w-4 mr-2" />
                                        Create This Goal
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
