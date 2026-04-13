import { NextRequest, NextResponse } from 'next/server'
import { calculateEMIWithSavings, type EMIInput, type SavingsInput } from '@/lib/emi'
import { askGemini } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { principal, rateApr, tenureYears, savings } = body

    if (!principal || !rateApr || !tenureYears) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emiInput: EMIInput = {
      principal: parseFloat(principal),
      rateApr: parseFloat(rateApr),
      tenureYears: parseFloat(tenureYears),
    }

    const savingsInput: SavingsInput | undefined = savings
      ? {
          extraEmisPerYear: parseInt(savings.extraEmisPerYear) || 0,
          emiIncreasePercent: parseFloat(savings.emiIncreasePercent) || 0,
          oneTimePrepayment: parseFloat(savings.oneTimePrepayment) || 0,
          prepayMonth: parseInt(savings.prepayMonth) || 0,
          startMonth: parseInt(savings.startMonth) || 1,
        }
      : undefined

    const result = calculateEMIWithSavings(emiInput, savingsInput)

    // Generate AI explanation if savings were applied
    let aiExplanation = null
    if (result.savingsDelta) {
      const prompt = `Loan: ₹${principal} at ${rateApr}% for ${tenureYears} years.
Strategies applied: ${savings.extraEmisPerYear} extra EMIs/year, ${savings.emiIncreasePercent}% annual step-up, ₹${savings.oneTimePrepayment} one-time prepayment.
Result: Saves ₹${result.savingsDelta.interestSaved.toFixed(0)} in interest and closes ${result.savingsDelta.monthsSaved} months earlier.

Provide a concise 2-sentence non-advisory takeaway about the impact.`

      try {
        aiExplanation = await askGemini(
          'You are a financial calculator explainer. Be concise and factual.',
          prompt
        )
      } catch (error) {
        console.error('AI explanation error:', error)
      }
    }

    return NextResponse.json({
      ...result,
      aiExplanation,
    })
  } catch (error) {
    console.error('EMI calculation error:', error)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}
