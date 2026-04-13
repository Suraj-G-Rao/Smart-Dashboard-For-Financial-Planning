import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))

    const expenseDescription = (body.expenseDescription || '').toString().trim()
    const expenseAmount = body.expenseAmount ? Number(body.expenseAmount) : undefined
    const expenseCategory = (body.expenseCategory || '').toString()
    const incomeRange = (body.incomeRange || '').toString()
    const creditScore = (body.creditScore || '').toString()
    const preference = (body.preference || '').toString()

    if (!expenseDescription) {
      return NextResponse.json(
        { error: 'Expense description is required' },
        { status: 400 }
      )
    }

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      // Build the prompt
      const prompt = `You are a credit card expert for India.

Your task is to recommend the BEST credit card based on the user's spending need.

Rules:
- Always suggest cards available in India.
- Do NOT recommend the same card for all expenses.
- Optimize for MAXIMUM rewards, cashback, or benefits for the given expense type.
- Consider eligibility (income range, credit score).
- Prefer realistic, well-known cards from banks like HDFC, SBI, ICICI, Axis, Amex.
- Avoid suggesting premium cards if eligibility is low.
- Always explain WHY this card is best for this expense.
- If the expense is large (car, travel, electronics), prioritize milestone rewards, EMI offers, or accelerated points.
- Return output strictly in JSON.

User Input:
Expense Description: ${expenseDescription}
${expenseCategory ? `Expense Category: ${expenseCategory}` : ''}
${expenseAmount ? `Expense Amount: ₹${expenseAmount.toLocaleString('en-IN')}` : ''}
${incomeRange ? `Income Range: ${incomeRange}` : ''}
${creditScore ? `Credit Score: ${creditScore}` : ''}
${preference ? `Preference: ${preference}` : ''}

Output STRICT JSON ONLY with this exact shape:
{
  "recommended_card": {
    "name": "Card Name",
    "bank": "Bank Name",
    "best_for": "What this card is best for",
    "eligibility": "Income/credit requirements",
    "annual_fee": "Fee amount",
    "reward_structure": "How rewards work",
    "estimated_rewards": "Estimated value for this expense",
    "additional_benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
  },
  "why_this_card": [
    "Reason 1",
    "Reason 2",
    "Reason 3"
  ],
  "alternate_cards": [
    {
      "name": "Alternate Card 1",
      "bank": "Bank Name",
      "reason": "Why this is also good"
    },
    {
      "name": "Alternate Card 2",
      "bank": "Bank Name",
      "reason": "Why this is also good"
    }
  ],
  "warnings": [
    "Important note 1",
    "Important note 2"
  ]
}

Rules: no extra text, only valid JSON.`

      console.log('[API] Calling Gemini AI...')
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log('[API] Gemini response received, length:', text.length)

      // Clean up the response
      const cleaned = text
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim()

      console.log('[API] Cleaned response preview:', cleaned.substring(0, 200))

      const parsed = JSON.parse(cleaned)

      // Validate response structure
      if (!parsed.recommended_card || !parsed.why_this_card) {
        console.error('[API] Invalid response structure:', parsed)
        throw new Error('Invalid response structure from AI')
      }

      return NextResponse.json({
        success: true,
        recommendation: parsed,
      })
    } catch (err: any) {
      console.error('[API] Error occurred:', {
        message: err.message,
        name: err.name,
        stack: err.stack?.substring(0, 500)
      })
      return NextResponse.json(
        {
          error: 'Failed to generate recommendation. Please try again.',
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
