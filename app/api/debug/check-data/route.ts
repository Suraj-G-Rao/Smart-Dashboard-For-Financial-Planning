import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Checking data for user:', user.id);

    // Check all tables
    const [
      { data: accounts, error: accountsError },
      { data: transactions, error: transactionsError },
      { data: assets, error: assetsError },
      { data: loans, error: loansError },
      { data: profiles, error: profilesError }
    ] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*').eq('user_id', user.id),
      supabase.from('assets').select('*').eq('user_id', user.id),
      supabase.from('loans').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id)
    ]);

    const result = {
      user_id: user.id,
      user_email: user.email,
      data_summary: {
        accounts: accounts?.length || 0,
        transactions: transactions?.length || 0,
        assets: assets?.length || 0,
        loans: loans?.length || 0,
        profiles: profiles?.length || 0
      },
      errors: {
        accounts: accountsError?.message || null,
        transactions: transactionsError?.message || null,
        assets: assetsError?.message || null,
        loans: loansError?.message || null,
        profiles: profilesError?.message || null
      },
      sample_data: {
        accounts: accounts?.slice(0, 2) || [],
        transactions: transactions?.slice(0, 3) || [],
        assets: assets?.slice(0, 2) || [],
        loans: loans?.slice(0, 2) || [],
        profiles: profiles || []
      },
      calculations: {
        total_income: transactions?.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        total_expenses: Math.abs(transactions?.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Number(t.amount), 0) || 0),
        total_investments: assets?.reduce((sum, asset) => sum + Number(asset.current_value || asset.purchase_price || 0), 0) || 0,
        total_debt: loans?.reduce((sum, loan) => sum + Number(loan.principal || 0) - Number(loan.extra_paid || 0), 0) || 0,
        total_balance: accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0
      }
    };

    console.log('Data check result:', result);
    return Response.json(result);

  } catch (error: any) {
    console.error('Data check error:', error);
    return Response.json({
      error: 'Failed to check data',
      message: error.message
    }, { status: 500 });
  }
}
