import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RecurringTransaction {
  id: string
  user_id: string
  date: string
  amount: number
  currency: string
  direction: string
  merchant: string | null
  raw_desc: string | null
  category_id: string | null
  subcategory_id: string | null
  recurring_rule: string
  account_id: string | null
  tags: any
  notes: string | null
}

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all recurring transactions
    const { data: recurringTxns, error: fetchError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('is_recurring', true)
      .not('recurring_rule', 'is', null)

    if (fetchError) throw fetchError

    const today = new Date()
    const expandedCount = { total: 0, created: 0, skipped: 0 }

    for (const txn of recurringTxns as RecurringTransaction[]) {
      try {
        // Parse recurring rule (e.g., "monthly:5" = 5th of every month)
        const [frequency, day] = txn.recurring_rule.split(':')
        
        if (frequency === 'monthly' && day) {
          const nextDate = new Date(today.getFullYear(), today.getMonth(), parseInt(day))
          
          // Check if this date transaction already exists (fuzzy match)
          const { data: existing } = await supabaseClient
            .from('transactions')
            .select('id')
            .eq('user_id', txn.user_id)
            .eq('date', nextDate.toISOString().split('T')[0])
            .eq('amount', txn.amount)
            .eq('merchant', txn.merchant)
            .limit(1)

          if (existing && existing.length > 0) {
            expandedCount.skipped++
            continue
          }

          // Create synthetic transaction
          const { error: insertError } = await supabaseClient
            .from('transactions')
            .insert({
              user_id: txn.user_id,
              account_id: txn.account_id,
              date: nextDate.toISOString().split('T')[0],
              amount: txn.amount,
              currency: txn.currency,
              direction: txn.direction,
              merchant: txn.merchant,
              raw_desc: txn.raw_desc,
              category_id: txn.category_id,
              subcategory_id: txn.subcategory_id,
              is_recurring: false,
              source: 'system',
              tags: txn.tags,
              notes: `Auto-generated from recurring rule: ${txn.recurring_rule}`,
            })

          if (insertError) {
            console.error('Insert error:', insertError)
            continue
          }

          expandedCount.created++
        }

        expandedCount.total++
      } catch (err) {
        console.error('Error processing recurring transaction:', txn.id, err)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: expandedCount.total,
        created: expandedCount.created,
        skipped: expandedCount.skipped,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
