import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const deleteSchema = z.object({
  id: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = deleteSchema.parse(body);

    // Get transaction to update account balance after deletion
    const { data: transaction } = await supabase
      .from('transactions')
      .select('account_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    // Update account balance if transaction had an account
    if (transaction?.account_id) {
      const { data: remaining } = await supabase
        .from('transactions')
        .select('amount')
        .eq('account_id', transaction.account_id)
        .eq('user_id', user.id);

      const balance = (remaining || []).reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

      await supabase
        .from('accounts')
        .update({ balance })
        .eq('id', transaction.account_id)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Transaction delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
