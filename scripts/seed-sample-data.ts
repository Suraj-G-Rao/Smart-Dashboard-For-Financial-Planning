// Script to create sample data for testing dashboard
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSampleData(userId: string) {
  console.log('Creating sample data for user:', userId);
  
  try {
    // Create sample accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .insert([
        {
          user_id: userId,
          name: 'Primary Savings',
          type: 'bank',
          balance: 50000
        },
        {
          user_id: userId,
          name: 'Credit Card',
          type: 'card',
          balance: -5000
        }
      ])
      .select();
    
    if (accountsError) {
      console.error('Accounts error:', accountsError);
    } else {
      console.log('✅ Created accounts:', accounts?.length);
    }

    // Create sample transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          account_id: accounts?.[0]?.id,
          date: new Date().toISOString().split('T')[0],
          amount: 25000,
          category: 'Salary',
          description: 'Monthly salary'
        },
        {
          user_id: userId,
          account_id: accounts?.[0]?.id,
          date: new Date().toISOString().split('T')[0],
          amount: -2000,
          category: 'Food',
          description: 'Groceries'
        },
        {
          user_id: userId,
          account_id: accounts?.[0]?.id,
          date: new Date().toISOString().split('T')[0],
          amount: -1500,
          category: 'Transport',
          description: 'Fuel'
        }
      ])
      .select();

    if (txError) {
      console.error('Transactions error:', txError);
    } else {
      console.log('✅ Created transactions:', transactions?.length);
    }

    // Create sample assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .insert([
        {
          user_id: userId,
          type: 'stock',
          name: 'Mutual Fund Portfolio',
          description: 'Diversified equity fund',
          purchase_price: 100000,
          current_value: 120000,
          purchase_date: '2024-01-01'
        }
      ])
      .select();

    if (assetsError) {
      console.error('Assets error:', assetsError);
    } else {
      console.log('✅ Created assets:', assets?.length);
    }

    console.log('Sample data creation completed!');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Usage: node -r ts-node/register scripts/seed-sample-data.ts
// You'll need to provide a user ID
const userId = process.argv[2];
if (userId) {
  seedSampleData(userId);
} else {
  console.log('Usage: provide user ID as argument');
}
