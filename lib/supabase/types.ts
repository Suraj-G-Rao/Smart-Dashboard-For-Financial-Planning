export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          created_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          type: 'bank' | 'card' | 'brokerage' | 'wallet' | 'loan'
          name: string
          institution: string | null
          currency: string
          balance: number
          last_sync_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'bank' | 'card' | 'brokerage' | 'wallet' | 'loan'
          name: string
          institution?: string | null
          currency?: string
          balance?: number
          last_sync_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'bank' | 'card' | 'brokerage' | 'wallet' | 'loan'
          name?: string
          institution?: string | null
          currency?: string
          balance?: number
          last_sync_at?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          type: 'expense' | 'income'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          type: 'expense' | 'income'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          type?: 'expense' | 'income'
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          date: string
          amount: number
          currency: string
          direction: 'debit' | 'credit'
          merchant: string | null
          raw_desc: string | null
          category_id: string | null
          subcategory_id: string | null
          is_recurring: boolean
          recurring_rule: string | null
          source: 'ocr' | 'csv' | 'manual' | 'api' | 'system'
          receipt_id: string | null
          notes: string | null
          tags: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          date: string
          amount: number
          currency?: string
          direction: 'debit' | 'credit'
          merchant?: string | null
          raw_desc?: string | null
          category_id?: string | null
          subcategory_id?: string | null
          is_recurring?: boolean
          recurring_rule?: string | null
          source: 'ocr' | 'csv' | 'manual' | 'api' | 'system'
          receipt_id?: string | null
          notes?: string | null
          tags?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          date?: string
          amount?: number
          currency?: string
          direction?: 'debit' | 'credit'
          merchant?: string | null
          raw_desc?: string | null
          category_id?: string | null
          subcategory_id?: string | null
          is_recurring?: boolean
          recurring_rule?: string | null
          source?: 'ocr' | 'csv' | 'manual' | 'api' | 'system'
          receipt_id?: string | null
          notes?: string | null
          tags?: Json | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number
          target_date: string
          current_amount: number
          risk_profile: string | null
          priority: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount: number
          target_date: string
          current_amount?: number
          risk_profile?: string | null
          priority?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number
          target_date?: string
          current_amount?: number
          risk_profile?: string | null
          priority?: number
          notes?: string | null
          created_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          user_id: string
          lender: string
          principal: number
          rate_apr: number
          start_date: string
          term_months: number
          payment_amount: number
          next_due_date: string
          type: 'home' | 'auto' | 'personal' | 'edu'
          extra_plan: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lender: string
          principal: number
          rate_apr: number
          start_date: string
          term_months: number
          payment_amount: number
          next_due_date: string
          type: 'home' | 'auto' | 'personal' | 'edu'
          extra_plan?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lender?: string
          principal?: number
          rate_apr?: number
          start_date?: string
          term_months?: number
          payment_amount?: number
          next_due_date?: string
          type?: 'home' | 'auto' | 'personal' | 'edu'
          extra_plan?: Json | null
          created_at?: string
        }
      }
      securities: {
        Row: {
          id: string
          symbol: string
          name: string
          type: 'stock' | 'mf' | 'etf' | 'bond'
          exchange: string | null
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          symbol: string
          name: string
          type: 'stock' | 'mf' | 'etf' | 'bond'
          exchange?: string | null
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          type?: 'stock' | 'mf' | 'etf' | 'bond'
          exchange?: string | null
          currency?: string
          created_at?: string
        }
      }
      holdings: {
        Row: {
          id: string
          user_id: string
          security_id: string
          quantity: number
          avg_price: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          security_id: string
          quantity: number
          avg_price: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          security_id?: string
          quantity?: number
          avg_price?: number
          created_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          security_id: string
          side: 'buy' | 'sell'
          quantity: number
          price: number
          fee: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          security_id: string
          side: 'buy' | 'sell'
          quantity: number
          price: number
          fee?: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          security_id?: string
          side?: 'buy' | 'sell'
          quantity?: number
          price?: number
          fee?: number
          date?: string
          created_at?: string
        }
      }
      nav_history: {
        Row: {
          id: string
          security_id: string
          date: string
          nav_or_price: number
          created_at: string
        }
        Insert: {
          id?: string
          security_id: string
          date: string
          nav_or_price: number
          created_at?: string
        }
        Update: {
          id?: string
          security_id?: string
          date?: string
          nav_or_price?: number
          created_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          issuer: string
          card_name: string
          network: string
          bill_cycle_day: number
          due_day: number
          credit_limit: number
          reward_program: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          issuer: string
          card_name: string
          network: string
          bill_cycle_day: number
          due_day: number
          credit_limit: number
          reward_program?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          issuer?: string
          card_name?: string
          network?: string
          bill_cycle_day?: number
          due_day?: number
          credit_limit?: number
          reward_program?: Json | null
          created_at?: string
        }
      }
      reward_rules: {
        Row: {
          id: string
          credit_card_id: string
          merchant_regex: string | null
          category_id: string | null
          multiplier: number
          cap_per_cycle: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          credit_card_id: string
          merchant_regex?: string | null
          category_id?: string | null
          multiplier: number
          cap_per_cycle?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          credit_card_id?: string
          merchant_regex?: string | null
          category_id?: string | null
          multiplier?: number
          cap_per_cycle?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      card_bills: {
        Row: {
          id: string
          credit_card_id: string
          cycle_start: string
          cycle_end: string
          due_date: string
          statement_balance: number
          min_due: number
          created_at: string
        }
        Insert: {
          id?: string
          credit_card_id: string
          cycle_start: string
          cycle_end: string
          due_date: string
          statement_balance: number
          min_due: number
          created_at?: string
        }
        Update: {
          id?: string
          credit_card_id?: string
          cycle_start?: string
          cycle_end?: string
          due_date?: string
          statement_balance?: number
          min_due?: number
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          file_path: string
          ocr_text: string | null
          parsed_amount: number | null
          parsed_date: string | null
          merchant: string | null
          status: 'pending' | 'parsed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          ocr_text?: string | null
          parsed_amount?: number | null
          parsed_date?: string | null
          merchant?: string | null
          status?: 'pending' | 'parsed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          ocr_text?: string | null
          parsed_amount?: number | null
          parsed_date?: string | null
          merchant?: string | null
          status?: 'pending' | 'parsed' | 'failed'
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          type: 'monthly' | 'tax' | 'custom'
          period_start: string
          period_end: string
          file_path: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'monthly' | 'tax' | 'custom'
          period_start: string
          period_end: string
          file_path: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'monthly' | 'tax' | 'custom'
          period_start?: string
          period_end?: string
          file_path?: string
          created_at?: string
        }
      }
      event_log: {
        Row: {
          id: string
          user_id: string
          type: string
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          data?: Json | null
          created_at?: string
        }
      }
    }
  }
}
