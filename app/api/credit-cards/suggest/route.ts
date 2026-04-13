import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const amount = parseFloat(searchParams.get('amount') || '0')
    const merchant = searchParams.get('merchant') || ''
    const category = searchParams.get('category') || ''

    // Mock credit cards with reward rules
    // In production, fetch from Supabase and join with reward_rules
    const cards = [
      {
        id: '1',
        cardName: 'HDFC Regalia Gold',
        issuer: 'HDFC Bank',
        rewardProgram: { baseRate: 0.04, categories: { dining: 0.05, shopping: 0.05 } },
        rules: [
          { merchantRegex: 'swiggy|zomato', multiplier: 5, capPerCycle: 1000 },
          { merchantRegex: 'amazon|flipkart', multiplier: 5, capPerCycle: 1500 },
        ],
      },
      {
        id: '2',
        cardName: 'ICICI Amazon Pay',
        issuer: 'ICICI Bank',
        rewardProgram: { baseRate: 0.01, categories: { online: 0.05 } },
        rules: [
          { merchantRegex: 'amazon', multiplier: 5, capPerCycle: 2000 },
          { merchantRegex: '.*', multiplier: 1, capPerCycle: null },
        ],
      },
      {
        id: '3',
        cardName: 'Axis Flipkart',
        issuer: 'Axis Bank',
        rewardProgram: { baseRate: 0.015, categories: { ecommerce: 0.04 } },
        rules: [
          { merchantRegex: 'flipkart|myntra', multiplier: 4, capPerCycle: 1500 },
        ],
      },
    ]

    // Calculate estimated savings for each card
    const suggestions = cards.map((card) => {
      let multiplier = 1
      let matchedRule = null

      // Find matching rule
      for (const rule of card.rules) {
        const regex = new RegExp(rule.merchantRegex, 'i')
        if (regex.test(merchant) || regex.test(category)) {
          multiplier = rule.multiplier
          matchedRule = rule
          break
        }
      }

      const baseReward = amount * (card.rewardProgram.baseRate || 0.01)
      const enhancedReward = baseReward * multiplier
      const estimatedSavings = Math.round(enhancedReward)

      // Check cap usage
      let capUsage = 0
      if (matchedRule?.capPerCycle) {
        capUsage = (estimatedSavings / matchedRule.capPerCycle) * 100
      }

      return {
        cardId: card.id,
        cardName: card.cardName,
        issuer: card.issuer,
        estimatedSavings,
        rewardRate: `${(multiplier * card.rewardProgram.baseRate * 100).toFixed(1)}%`,
        multiplier,
        capUsage: matchedRule?.capPerCycle ? `${Math.min(capUsage, 100).toFixed(0)}%` : 'No cap',
        reason: multiplier > 1 ? 'Best for this category' : 'Standard rewards',
      }
    })

    // Sort by estimated savings
    suggestions.sort((a, b) => b.estimatedSavings - a.estimatedSavings)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Card suggestion error:', error)
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 })
  }
}
