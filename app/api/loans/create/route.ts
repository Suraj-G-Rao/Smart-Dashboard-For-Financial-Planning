import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabaseServer'

const schema = z.object({
  name: z.string().min(1),
  principal: z.number().positive(),
  annual_rate: z.number().nonnegative(),
  term_months: z.number().int().positive(),
  start_date: z.string(), // yyyy-mm-dd
})

function addMonths(date: Date, m: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + m)
  return d
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await req.json()
    const input = schema.parse(json)

    const P = input.principal
    const r = input.annual_rate / 12 / 100
    const n = input.term_months
    const start = new Date(input.start_date)

    const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

    // Build schedule
    let balance = P
    const schedule: any[] = []
    let totalInterest = 0
    for (let i = 0; i < n; i++) {
      const interest = balance * r
      const principalComp = emi - interest
      balance = Math.max(0, balance - principalComp)
      const due_date = addMonths(start, i + 1).toISOString().slice(0, 10)
      totalInterest += interest
      schedule.push({
        index: i,
        due_date,
        emi: Number(emi.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        principal: Number(principalComp.toFixed(2)),
        balance_after: Number(balance.toFixed(2)),
        paid_on: null,
      })
    }

    const next_payment_on = schedule[0]?.due_date || input.start_date

    const { data, error } = await supabase
      .from('loans')
      .insert({
        user_id: user.id,
        name: input.name,
        principal: P,
        annual_rate: input.annual_rate,
        term_months: n,
        start_date: input.start_date,
        emi: Number(emi.toFixed(2)),
        total_interest: Number(totalInterest.toFixed(2)),
        schedule,
        next_payment_on,
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error('loan create error', e)
    return NextResponse.json({ success: false, error: e.message || 'Failed' }, { status: 500 })
  }
}
