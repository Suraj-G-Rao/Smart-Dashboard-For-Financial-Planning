import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Seed sample securities
    const securities = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', type: 'stock', exchange: 'NSE' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', type: 'stock', exchange: 'NSE' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', type: 'stock', exchange: 'NSE' },
      { symbol: 'INFY', name: 'Infosys', type: 'stock', exchange: 'NSE' },
      { symbol: 'NIFTY50', name: 'Nifty 50 Index Fund', type: 'mf', exchange: null },
    ]

    const { data: secData, error: secError } = await supabase
      .from('securities')
      .upsert(securities, { onConflict: 'symbol' })

    if (secError) {
      console.error('Error seeding securities:', secError)
    } else {
      console.log('✅ Seeded securities')
    }

    // Add sample NAV history (last 30 days for one security)
    const reliance = await supabase
      .from('securities')
      .select('id')
      .eq('symbol', 'RELIANCE')
      .single()

    if (reliance.data) {
      const navHistory = []
      const today = new Date()
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        navHistory.push({
          security_id: reliance.data.id,
          date: date.toISOString().split('T')[0],
          nav_or_price: 2400 + Math.random() * 200,
        })
      }

      const { error: navError } = await supabase
        .from('nav_history')
        .upsert(navHistory, { onConflict: 'security_id,date' })

      if (navError) {
        console.error('Error seeding NAV history:', navError)
      } else {
        console.log('✅ Seeded NAV history')
      }
    }

    console.log('✅ Database seeding complete!')
  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  }
}

seed()
