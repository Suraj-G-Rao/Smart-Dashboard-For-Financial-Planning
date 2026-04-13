import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            )
        }

        const supabase = createRouteHandlerClient({ cookies })
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get last 90 days of expenses
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: true })

        if (error) throw error

        if (!expenses || expenses.length === 0) {
            return NextResponse.json({
                patterns: [],
                message: 'Not enough expense data to analyze patterns'
            })
        }

        // Prepare expense data for analysis
        const expensesByDay: Record<string, any[]> = {}
        const expensesByCategory: Record<string, any[]> = {}

        expenses.forEach((exp: any) => {
            const date = new Date(exp.date)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })

            if (!expensesByDay[dayName]) expensesByDay[dayName] = []
            expensesByDay[dayName].push(exp)

            if (!expensesByCategory[exp.category]) expensesByCategory[exp.category] = []
            expensesByCategory[exp.category].push(exp)
        })

        // Analyze patterns with AI
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

            const prompt = `You are an expert financial behavioral analyst for India.

Analyze this user's spending data and identify SPECIFIC, ACTIONABLE patterns.

Expense Data (Last 90 days):
- Total expenses: ${expenses.length} transactions
- Total amount: ₹${expenses.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString('en-IN')}

By Day of Week:
${Object.entries(expensesByDay).map(([day, exps]) =>
                `${day}: ${exps.length} transactions, ₹${exps.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString('en-IN')}`
            ).join('\n')}

By Category:
${Object.entries(expensesByCategory).map(([cat, exps]) =>
                `${cat}: ${exps.length} transactions, ₹${exps.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString('en-IN')}`
            ).join('\n')}

CRITICAL RULES:
1. Find SPECIFIC patterns (e.g., "Food delivery every Friday evening", not "You spend on food")
2. Identify behavioral triggers (stress, celebration, boredom, routine)
3. Provide ACTIONABLE suggestions with realistic alternatives
4. Calculate realistic savings (don't promise 100% reduction)
5. Focus on patterns that happen regularly (weekly/monthly)

Return ONLY valid JSON:
{
  "patterns": [
    {
      "type": "time_based|day_based|emotional|category_cluster",
      "description": "Specific pattern description",
      "frequency": "X times per week/month",
      "avgCost": number,
      "monthlyCost": number,
      "suggestion": "Specific actionable alternative",
      "potentialSavings": number,
      "trigger": "Optional: what triggers this spending"
    }
  ]
}

Provide 2-4 most impactful patterns only.`

            console.log('[Pattern Analysis] Calling Gemini...')
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            const cleaned = text
                .replace(/```json\n?/gi, '')
                .replace(/```\n?/g, '')
                .trim()

            const parsed = JSON.parse(cleaned)

            if (!parsed.patterns || !Array.isArray(parsed.patterns)) {
                throw new Error('Invalid response structure from AI')
            }

            return NextResponse.json({
                success: true,
                patterns: parsed.patterns,
                dataPoints: expenses.length
            })
        } catch (err: any) {
            console.error('[Pattern Analysis] AI error:', err)

            // Fallback: Simple pattern detection
            const patterns: SpendingPattern[] = []

            // Pattern 1: Highest spending day
            const dayTotals = Object.entries(expensesByDay).map(([day, exps]) => ({
                day,
                count: exps.length,
                total: exps.reduce((sum: number, e: any) => sum + e.amount, 0)
            })).sort((a, b) => b.total - a.total)

            if (dayTotals.length > 0) {
                const topDay = dayTotals[0]
                const avgPerDay = topDay.total / 12 // ~12 weeks in 90 days

                patterns.push({
                    type: 'day_based',
                    description: `High spending on ${topDay.day}s`,
                    frequency: `${topDay.count} transactions over 90 days`,
                    avgCost: Math.round(topDay.total / topDay.count),
                    monthlyCost: Math.round(avgPerDay * 4),
                    suggestion: `Plan ${topDay.day} activities in advance to avoid impulse spending`,
                    potentialSavings: Math.round(avgPerDay * 4 * 0.3) // 30% reduction
                })
            }

            // Pattern 2: Top category
            const categoryTotals = Object.entries(expensesByCategory).map(([cat, exps]) => ({
                category: cat,
                count: exps.length,
                total: exps.reduce((sum: number, e: any) => sum + e.amount, 0)
            })).sort((a, b) => b.total - a.total)

            if (categoryTotals.length > 0) {
                const topCat = categoryTotals[0]
                const monthlyAvg = Math.round(topCat.total / 3)

                patterns.push({
                    type: 'category_cluster',
                    description: `Frequent ${topCat.category} expenses`,
                    frequency: `${topCat.count} times in 90 days`,
                    avgCost: Math.round(topCat.total / topCat.count),
                    monthlyCost: monthlyAvg,
                    suggestion: `Look for bulk buying or subscription options for ${topCat.category}`,
                    potentialSavings: Math.round(monthlyAvg * 0.2) // 20% reduction
                })
            }

            return NextResponse.json({
                success: true,
                patterns: patterns.slice(0, 3),
                dataPoints: expenses.length,
                fallback: true
            })
        }
    } catch (e: any) {
        console.error('[Pattern Analysis] Error:', e)
        return NextResponse.json(
            { error: e.message || 'Server error' },
            { status: 500 }
        )
    }
}
