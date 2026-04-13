import { NextRequest, NextResponse } from 'next/server'
import { calculateXIRR } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    // In production, fetch from Supabase:
    // - holdings (current positions)
    // - trades (historical buy/sell)
    // - nav_history (current prices)
    // Calculate P/L and XIRR

    // Mock data for demonstration
    const holdings = [
      {
        symbol: 'RELIANCE',
        quantity: 50,
        avgPrice: 2400,
        currentPrice: 2650,
      },
      {
        symbol: 'HDFCBANK',
        quantity: 100,
        avgPrice: 1580,
        currentPrice: 1620,
      },
    ]

    // Calculate P/L for each holding
    const holdingsWithPL = holdings.map((holding) => {
      const invested = holding.quantity * holding.avgPrice
      const currentValue = holding.quantity * holding.currentPrice
      const unrealizedPL = currentValue - invested
      const unrealizedPLPercent = (unrealizedPL / invested) * 100

      return {
        ...holding,
        invested,
        currentValue,
        unrealizedPL,
        unrealizedPLPercent,
      }
    })

    // Calculate portfolio totals
    const totalInvested = holdingsWithPL.reduce((sum, h) => sum + h.invested, 0)
    const totalCurrentValue = holdingsWithPL.reduce((sum, h) => sum + h.currentValue, 0)
    const totalUnrealizedPL = totalCurrentValue - totalInvested
    const totalUnrealizedPLPercent = (totalUnrealizedPL / totalInvested) * 100

    // Calculate XIRR (mock cashflows)
    const cashflows = [
      { date: new Date('2023-01-01'), amount: -200000 }, // Initial investment
      { date: new Date('2023-06-01'), amount: -100000 }, // Additional investment
      { date: new Date(), amount: totalCurrentValue }, // Current value
    ]

    const xirr = calculateXIRR(cashflows)

    return NextResponse.json({
      holdings: holdingsWithPL,
      portfolio: {
        totalInvested,
        totalCurrentValue,
        totalUnrealizedPL,
        totalUnrealizedPLPercent,
        xirr,
      },
    })
  } catch (error) {
    console.error('P/L calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate P/L' }, { status: 500 })
  }
}
