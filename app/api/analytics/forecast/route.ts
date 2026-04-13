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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30', 10), 90);

    // Get last 90 days for baseline
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysISO = ninetyDaysAgo.toISOString().split('T')[0];

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', ninetyDaysISO)
      .eq('user_id', user.id);

    const txs = transactions || [];

    // Calculate averages
    const avgDailyIncome =
      txs.filter((t) => t.amount > 0).reduce((sum, t) => sum + Number(t.amount), 0) / 90;

    const avgDailyExpense = Math.abs(
      txs
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0) / 90
    );

    // Get upcoming bills
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateISO = futureDate.toISOString().split('T')[0];

    const { data: upcomingBills } = await supabase
      .from('bills')
      .select('*')
      .gte('due_date', today)
      .lte('due_date', futureDateISO)
      .eq('user_id', user.id)
      .eq('is_paid', false);

    const totalUpcomingBills = (upcomingBills || []).reduce(
      (sum, b) => sum + Number(b.amount),
      0
    );

    // Get upcoming subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .gte('next_renew', today)
      .lte('next_renew', futureDateISO)
      .eq('user_id', user.id);

    const totalSubscriptions = (subscriptions || []).reduce(
      (sum, s) => sum + Number(s.amount),
      0
    );

    // Get upcoming loan payments
    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'Active')
      .gte('next_payment_on', today)
      .lte('next_payment_on', futureDateISO);

    const totalLoanPayments = (loans || []).reduce((sum, loan) => {
      const emi =
        (Number(loan.principal) * (Number(loan.interest_rate) / 1200)) /
        (1 - Math.pow(1 + Number(loan.interest_rate) / 1200, -loan.term_months));
      return sum + (isNaN(emi) ? 0 : emi);
    }, 0);

    // Forecast
    const forecastIncome = avgDailyIncome * days;
    const forecastExpenses = avgDailyExpense * days;
    const scheduledPayments = totalUpcomingBills + totalSubscriptions + totalLoanPayments;
    const totalForecastExpenses = forecastExpenses + scheduledPayments;
    const netCashflow = forecastIncome - totalForecastExpenses;

    // Daily forecast breakdown
    const dailyForecast = [];
    let runningBalance = 0;
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayIncome = avgDailyIncome;
      const dayExpense = avgDailyExpense;
      runningBalance += dayIncome - dayExpense;

      dailyForecast.push({
        date: dateStr,
        income: Math.round(dayIncome),
        expense: Math.round(dayExpense),
        balance: Math.round(runningBalance),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        period: `${days} days`,
        forecast: {
          income: Math.round(forecastIncome),
          expenses: Math.round(forecastExpenses),
          scheduledPayments: Math.round(scheduledPayments),
          totalExpenses: Math.round(totalForecastExpenses),
          netCashflow: Math.round(netCashflow),
        },
        upcoming: {
          bills: upcomingBills || [],
          subscriptions: subscriptions || [],
          loans: loans || [],
        },
        dailyForecast: dailyForecast.slice(0, 30),
      },
    });
  } catch (error) {
    console.error('Analytics forecast error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}
