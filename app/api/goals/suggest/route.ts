import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            )
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's financial profile
        const [accountsRes, expensesRes, goalsRes] = await Promise.all([
            supabase.from('accounts').select('*').eq('user_id', user.id),
            supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
            supabase.from('goals').select('*').eq('user_id', user.id),
        ])

        const totalBalance = accountsRes.data?.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0) || 0
        const monthlyExpenses = (expensesRes.data?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0) / 3
        const existingGoals = goalsRes.data?.map((g: any) => g.name) || []

        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

            const prompt = `You are a financial advisor for India.

Analyze the user's financial profile and suggest 3-5 personalized financial goals.

User Profile:
- Total Balance: ₹${totalBalance.toLocaleString('en-IN')}
- Monthly Expenses: ₹${monthlyExpenses.toLocaleString('en-IN')}
- Existing Goals: ${existingGoals.length > 0 ? existingGoals.join(', ') : 'None'}

Rules:
- Suggest realistic, achievable goals for Indian context
- Consider user's current financial situation
- Don't suggest goals they already have
- Include mix of short-term (6-12 months) and long-term (2-5 years) goals
- Prioritize essential goals (Emergency Fund) if missing
- Use Indian currency (₹) and realistic amounts

Output STRICT JSON ONLY with this exact shape:
{
  "suggestions": [
    {
      "name": "Goal Name",
      "category": "emergency|home|car|education|wedding|vacation|business|child|other",
      "targetAmount": number,
      "priority": "high|medium|low",
      "duration": number (months),
      "reason": "Why this goal is important for the user",
      "monthlyContribution": number
    }
  ]
}

Rules: no extra text, only valid JSON.`

            console.log('[API] Calling Gemini for goal suggestions...')
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            const cleaned = text
                .replace(/```json\n?/gi, '')
                .replace(/```\n?/g, '')
                .trim()

            const parsed = JSON.parse(cleaned)

            if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
                throw new Error('Invalid response structure from AI')
            }

            return NextResponse.json({
                success: true,
                suggestions: parsed.suggestions,
            })
        } catch (err: any) {
            console.error('[API] Goal suggestions error:', err)
            return NextResponse.json(
                {
                    error: 'Failed to generate goal suggestions',
                    debug: process.env.NODE_ENV === 'development' ? err.message : undefined
                },
                { status: 500 }
            )
        }
    } catch (e: any) {
        console.error('[API] Outer error:', e)
        return NextResponse.json(
            { error: e.message || 'Server error' },
            { status: 500 }
        )
    }
}
