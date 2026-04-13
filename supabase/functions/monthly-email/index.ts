import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, name')

    if (usersError) throw usersError

    const results = []

    for (const user of users || []) {
      try {
        // Get last month's date range
        const now = new Date()
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        const periodStart = lastMonth.toISOString().split('T')[0]
        const periodEnd = lastMonthEnd.toISOString().split('T')[0]

        // Fetch user's transactions for last month
        const { data: transactions, error: txnError } = await supabaseClient
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', periodStart)
          .lte('date', periodEnd)

        if (txnError) throw txnError

        // Calculate summary
        const income = transactions
          ?.filter((t) => t.direction === 'credit')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

        const expense = transactions
          ?.filter((t) => t.direction === 'debit')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0

        // Generate report (simplified - in production, create PDF)
        const reportContent = `
Monthly Financial Summary - ${lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}

Income: ₹${income.toLocaleString('en-IN')}
Expense: ₹${expense.toLocaleString('en-IN')}
Savings: ₹${(income - expense).toLocaleString('en-IN')}
Savings Rate: ${savingsRate.toFixed(1)}%

Total Transactions: ${transactions?.length || 0}
        `

        // Store report metadata
        const { data: report, error: reportError } = await supabaseClient
          .from('reports')
          .insert({
            user_id: user.id,
            type: 'monthly',
            period_start: periodStart,
            period_end: periodEnd,
            file_path: `/reports/${user.id}/monthly-${periodStart}.txt`,
          })
          .select()
          .single()

        if (reportError) throw reportError

        // In production: Send email via Supabase Auth or external service
        // For now, just log
        console.log(`Email sent to user ${user.id}:`, reportContent)

        results.push({
          userId: user.id,
          userName: user.name,
          reportId: report.id,
          summary: { income, expense, savingsRate },
        })
      } catch (err) {
        console.error('Error processing user:', user.id, err)
        results.push({ userId: user.id, error: err.message })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: users?.length || 0,
        results,
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
