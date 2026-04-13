import { createServerClient } from '@/lib/supabaseServer';
import { getPeriodRange, getCurrentMonthRange } from '@/lib/period';
import { z } from 'zod';

const kpiSchema = z.object({
  period: z.enum(['7d', '30d', '90d']),
});

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = kpiSchema.parse(body);
    
    // Get current month range for MTD calculations
    const currentMonth = getCurrentMonthRange();
    
    // Fetch transactions for current month
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', user.id)
      .gte('date', currentMonth.from)
      .lte('date', currentMonth.to);

    if (error) throw error;

    // Calculate MTD metrics
    let incomeMTD = 0;
    let expensesMTD = 0;
    
    (transactions || []).forEach(tx => {
      const amount = Number(tx.amount);
      if (amount > 0) {
        incomeMTD += amount;
      } else {
        expensesMTD += Math.abs(amount);
      }
    });

    const savings = incomeMTD - expensesMTD;
    const burnRate = expensesMTD / 30; // Daily burn rate approximation
    const netChange = savings;

    return Response.json({
      incomeMTD,
      expensesMTD,
      savings,
      burnRate,
      netChange,
    });

  } catch (error: any) {
    console.error('KPI calculation error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
