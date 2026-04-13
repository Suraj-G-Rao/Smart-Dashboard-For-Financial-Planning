import { createServerClient } from './supabaseServer';
import { DateRange } from './period';

export interface DayData {
  day: string;
  income: number;
  expense: number;
  net: number;
}

export interface AggregatedData {
  days: string[];
  income: number[];
  expense: number[];
  dailyNet: number[];
  byCategory: Record<string, number>;
}

export async function getIncomeExpenseByDay(
  userId: string,
  from: string,
  to: string
): Promise<AggregatedData> {
  const supabase = createServerClient();
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('date, amount, category')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date');

  if (error) throw error;

  const dailyMap = new Map<string, { income: number; expense: number; byCategory: Record<string, number> }>();
  
  // Initialize all days in range with zeros
  const start = new Date(from);
  const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.toISOString().split('T')[0];
    dailyMap.set(day, { income: 0, expense: 0, byCategory: {} });
  }

  // Aggregate transactions
  (transactions || []).forEach(tx => {
    const day = tx.date;
    const amount = Number(tx.amount);
    const category = tx.category || 'Uncategorized';
    
    const current = dailyMap.get(day) || { income: 0, expense: 0, byCategory: {} };
    
    if (amount > 0) {
      current.income += amount;
    } else {
      current.expense += Math.abs(amount);
      current.byCategory[category] = (current.byCategory[category] || 0) + Math.abs(amount);
    }
    
    dailyMap.set(day, current);
  });

  // Convert to arrays
  const days: string[] = [];
  const income: number[] = [];
  const expense: number[] = [];
  const dailyNet: number[] = [];
  const byCategory: Record<string, number> = {};

  Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([day, data]) => {
      days.push(day);
      income.push(data.income);
      expense.push(data.expense);
      dailyNet.push(data.income - data.expense);
      
      // Aggregate categories
      Object.entries(data.byCategory).forEach(([cat, amount]) => {
        byCategory[cat] = (byCategory[cat] || 0) + amount;
      });
    });

  return { days, income, expense, dailyNet, byCategory };
}

export interface Anomaly {
  index: number;
  value: number;
  z: number;
}

export function zScoreAnomalies(dailyTotals: number[]): Anomaly[] {
  const n = dailyTotals.length;
  if (n === 0) return [];

  const mean = dailyTotals.reduce((sum, val) => sum + val, 0) / n;
  const variance = dailyTotals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  const anomalies: Anomaly[] = [];
  dailyTotals.forEach((value, index) => {
    const z = Math.abs((value - mean) / stdDev);
    if (z > 2.0) {
      anomalies.push({ index, value, z });
    }
  });

  return anomalies;
}
