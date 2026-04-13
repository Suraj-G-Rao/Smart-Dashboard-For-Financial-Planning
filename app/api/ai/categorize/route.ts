import { NextRequest, NextResponse } from 'next/server'
import { categorizeTransaction } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { merchant, amount, description } = await req.json()

    if (!merchant && !description) {
      return NextResponse.json({ error: 'Missing transaction details' }, { status: 400 })
    }

    const result = await categorizeTransaction(
      merchant || 'Unknown',
      amount || 0,
      description || ''
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Categorization error:', error)
    return NextResponse.json({ error: 'Categorization failed' }, { status: 500 })
  }
}
