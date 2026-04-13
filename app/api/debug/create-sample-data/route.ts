import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Creating sample data for user:', user.id);

    // Delete existing data first to avoid conflicts
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', user.id),
      supabase.from('accounts').delete().eq('user_id', user.id),
      supabase.from('assets').delete().eq('user_id', user.id),
      supabase.from('loans').delete().eq('user_id', user.id)
    ]);

    // Create sample accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .insert([
        {
          user_id: user.id,
          name: 'Primary Savings Account',
          type: 'bank',
          balance: 295000
        },
        {
          user_id: user.id,
          name: 'Current Account',
          type: 'bank',
          balance: 50000
        },
        {
          user_id: user.id,
          name: 'Credit Card',
          type: 'card',
          balance: -15000
        }
      ])
      .select();

    // Create sample transactions for the last 3 months
    let transactionData: any[] = [];
    const accountId = accounts?.[0]?.id;
    const currentAccountId = accounts?.[1]?.id;
    if (accountId && currentAccountId) {
      const now = new Date();
      const transactions = [];
      
      // Create transactions for last 3 months
      for (let month = 0; month < 3; month++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 15);
        const dateStr = monthDate.toISOString().split('T')[0];
        
        // Income transactions
        transactions.push(
          {
            user_id: user.id,
            account_id: accountId,
            date: dateStr,
            amount: 75000,
            category: 'Salary',
            description: 'Monthly salary',
            merchant: 'Tech Company Ltd'
          },
          {
            user_id: user.id,
            account_id: currentAccountId,
            date: dateStr,
            amount: 15000,
            category: 'Freelance',
            description: 'Freelance project payment',
            merchant: 'Client XYZ'
          }
        );
        
        // Expense transactions
        transactions.push(
          {
            user_id: user.id,
            account_id: accountId,
            date: dateStr,
            amount: -25000,
            category: 'Rent',
            description: 'Monthly rent payment',
            merchant: 'Property Owner'
          },
          {
            user_id: user.id,
            account_id: accountId,
            date: dateStr,
            amount: -12000,
            category: 'Food',
            description: 'Groceries and dining',
            merchant: 'Supermarket & Restaurants'
          },
          {
            user_id: user.id,
            account_id: currentAccountId,
            date: dateStr,
            amount: -8000,
            category: 'Transport',
            description: 'Fuel and public transport',
            merchant: 'Various'
          },
          {
            user_id: user.id,
            account_id: accountId,
            date: dateStr,
            amount: -5000,
            category: 'Utilities',
            description: 'Electricity and internet bills',
            merchant: 'Utility Companies'
          },
          {
            user_id: user.id,
            account_id: currentAccountId,
            date: dateStr,
            amount: -3000,
            category: 'Entertainment',
            description: 'Movies and subscriptions',
            merchant: 'Various'
          },
          {
            user_id: user.id,
            account_id: accountId,
            date: dateStr,
            amount: -2000,
            category: 'Shopping',
            description: 'Clothing and accessories',
            merchant: 'Retail Stores'
          }
        );
      }

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert(transactions)
        .select();

      if (txError) {
        console.error('Transactions error:', txError);
      } else {
        transactionData = txData || [];
        console.log('Created transactions:', transactionData.length);
      }
    }

    // Create sample assets (investments)
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .insert([
        {
          user_id: user.id,
          type: 'stock',
          name: 'Equity Mutual Fund Portfolio',
          description: 'Diversified large cap equity fund',
          purchase_price: 150000,
          current_value: 185000,
          purchase_date: '2023-06-01',
          quantity: 15000,
          location: 'Online'
        },
        {
          user_id: user.id,
          type: 'gold',
          name: 'Digital Gold Investment',
          description: 'Gold ETF investment',
          purchase_price: 75000,
          current_value: 82000,
          purchase_date: '2024-01-15',
          quantity: 150,
          location: 'Digital'
        },
        {
          user_id: user.id,
          type: 'stock',
          name: 'ELSS Tax Saver Fund',
          description: 'Tax saving mutual fund',
          purchase_price: 50000,
          current_value: 58000,
          purchase_date: '2024-03-01',
          quantity: 5000,
          location: 'Online'
        }
      ])
      .select();

    // Create sample loans
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .insert([
        {
          user_id: user.id,
          name: 'Home Loan',
          principal: 2500000,
          interest_rate: 8.75,
          start_date: '2022-06-01',
          term_months: 240,
          status: 'Active',
          extra_paid: 125000
        },
        {
          user_id: user.id,
          name: 'Car Loan',
          principal: 800000,
          interest_rate: 9.25,
          start_date: '2023-09-01',
          term_months: 84,
          status: 'Active',
          extra_paid: 25000
        }
      ])
      .select();

    // Log any errors
    if (accountsError) console.error('Accounts error:', accountsError);
    if (assetsError) console.error('Assets error:', assetsError);
    if (loansError) console.error('Loans error:', loansError);

    const result = {
      success: true,
      message: 'Sample data created successfully',
      data: {
        accounts: accounts?.length || 0,
        transactions: transactionData?.length || 0,
        assets: assets?.length || 0,
        loans: loans?.length || 0
      }
    };

    console.log('Sample data creation result:', result);
    return Response.json(result);

  } catch (error: any) {
    console.error('Sample data creation error:', error);
    return Response.json({
      error: 'Failed to create sample data',
      message: error.message
    }, { status: 500 });
  }
}
