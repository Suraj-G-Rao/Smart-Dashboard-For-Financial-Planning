import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const transactionSchema = z.object({
  id: z.string().optional(),
  amount: z.number(),
  category: z.string(),
  date: z.string(),
  account_id: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = transactionSchema.parse(body);

    if (input.id) {
      // Update
      const { data, error } = await supabase
        .from('transactions')
        .update({
          amount: input.amount,
          category: input.category,
          date: input.date,
          account_id: input.account_id,
          description: input.description,
        })
        .eq('id', input.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update account balance if account_id changed or amount changed
      if (input.account_id) {
        await updateAccountBalance(supabase, input.account_id, user.id);
      }

      return NextResponse.json({ success: true, data });
    } else {
      // Create
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: input.amount,
          category: input.category,
          date: input.date,
          account_id: input.account_id,
          description: input.description,
        })
        .select()
        .single();

      if (error) throw error;

      // Update account balance
      if (input.account_id) {
        await updateAccountBalance(supabase, input.account_id, user.id);
      }

      return NextResponse.json({ success: true, data });
    }
  } catch (error: any) {
    console.error('Transaction upsert error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save transaction' },
      { status: 500 }
    );
  }
}

async function updateAccountBalance(supabase: any, accountId: string, userId: string) {
  // Calculate total balance from all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('account_id', accountId)
    .eq('user_id', userId);

  const balance = (transactions || []).reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

  await supabase
    .from('accounts')
    .update({ balance })
    .eq('id', accountId)
    .eq('user_id', userId);
}
