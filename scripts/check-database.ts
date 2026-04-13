// Simple script to check if database tables exist
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking database tables...');
  
  const tables = ['accounts', 'transactions', 'assets', 'loans', 'profiles', 'goals'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' error:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' failed:`, err);
    }
  }
}

checkTables().catch(console.error);
