import { NextRequest, NextResponse } from 'next/server'
import { askGemini, askGroq } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { purpose, context, useGroq = false } = await req.json()

    if (!purpose || !context) {
      return NextResponse.json({ error: 'Missing purpose or context' }, { status: 400 })
    }

    const systemPrompt = `You are a financial assistant providing educational insights. ${
      purpose === 'explain' ? 'Explain concepts clearly.' : 'Provide quick, actionable information.'
    }`

    const response = useGroq ? await askGroq(systemPrompt, context) : await askGemini(systemPrompt, context)

    return NextResponse.json({ response })
  } catch (error: unknown) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI service unavailable' },
      { status: 500 }
    )
  }
}
