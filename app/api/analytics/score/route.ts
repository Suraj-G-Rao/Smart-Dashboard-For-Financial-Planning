import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 90 days data
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysISO = ninetyDaysAgo.toISOString().split('T')[0];

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', ninetyDaysISO)
      .eq('user_id', user.id);

    const txs = transactions || [];

    // Calculate metrics
    const income = txs
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = Math.abs(
      txs
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0)
    );

    // Get bills
    const { data: bills } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id);

    // Get loans
    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'Active');

    const totalBills = (bills || []).length;
    const paidBills = (bills || []).filter((b) => b.is_paid).length;
    const onTimeRate = totalBills > 0 ? (paidBills / totalBills) * 100 : 100;

    // Calculate monthly averages
    const monthlyIncome = income / 3;
    const monthlyExpenses = expenses / 3;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    // Emergency fund (assuming 6 months target)
    const { data: accounts } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', user.id);

    const totalBalance = (accounts || []).reduce(
      (sum, a) => sum + Number(a.balance),
      0
    );
    const emergencyMonths = monthlyExpenses > 0 ? totalBalance / monthlyExpenses : 0;

    // Debt ratio (EMI as % of income)
    const monthlyEMI = (loans || []).reduce((sum, loan) => {
      const emi =
        (Number(loan.principal) * (Number(loan.interest_rate) / 1200)) /
        (1 - Math.pow(1 + Number(loan.interest_rate) / 1200, -loan.term_months));
      return sum + (isNaN(emi) ? 0 : emi);
    }, 0);

    const debtRatio = monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 0;

    // Calculate Financial Health Score (0-100)
    let score = 0;

    // Savings Rate (30 points)
    if (savingsRate < 5) score += 0;
    else if (savingsRate < 10) score += 10;
    else if (savingsRate < 15) score += 20;
    else if (savingsRate < 20) score += 25;
    else if (savingsRate < 25) score += 28;
    else score += 30;

    // Emergency Fund Coverage (25 points)
    if (emergencyMonths < 1) score += 0;
    else if (emergencyMonths < 2) score += 8;
    else if (emergencyMonths < 3) score += 15;
    else if (emergencyMonths < 6) score += 20;
    else score += 25;

    // Calculate EMI burden (Debt Ratio score: 25%)
    const totalEMI = (loans || []).reduce((sum, l) => sum + Number(l.emi || 0), 0);
    const emiRatio = monthlyIncome > 0 ? (totalEMI / monthlyIncome) * 100 : 0;

    let debtScore = 0;
    if (emiRatio >= 45) debtScore = 0;
    else if (emiRatio < 15) debtScore = 25;
    else {
      // Linear scale between 15% and 45%
      debtScore = 25 * (1 - ((emiRatio - 15) / 30));
    }

    score += debtScore;

    // On-time Payments (20 points)
    if (onTimeRate < 50) score += 0;
    else if (onTimeRate < 70) score += 10;
    else if (onTimeRate < 90) score += 15;
    else score += 20;

    return NextResponse.json({
      success: true,
      data: {
        score: Math.round(score),
        breakdown: {
          savingsRate: {
            value: savingsRate.toFixed(1),
            score: Math.round((score / 100) * 30),
            maxScore: 30,
          },
          emergencyFund: {
            months: emergencyMonths.toFixed(1),
            score: Math.round((score / 100) * 25),
            maxScore: 25,
          },
          debtRatio: {
            value: debtRatio.toFixed(1),
            score: Math.round((score / 100) * 25),
            maxScore: 25,
          },
          onTimePayments: {
            value: onTimeRate.toFixed(1),
            score: Math.round((score / 100) * 20),
            maxScore: 20,
          },
        },
        metrics: {
          monthlyIncome,
          monthlyExpenses,
          monthlyEMI,
          totalBalance,
        },
      },
    });
  } catch (error) {
    console.error('Analytics score error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
