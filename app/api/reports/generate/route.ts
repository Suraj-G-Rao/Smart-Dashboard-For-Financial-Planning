import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { SimpleReportGenerator } from '@/lib/services/simple-report-generator';

export async function POST(request: NextRequest) {
  try {
    const { type, startDate, endDate } = await request.json();
    
    // Validate report type
    if (!['monthly', 'tax', 'custom'].includes(type)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
    
    // Validate custom report dates
    if (type === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
      }
      if (end > new Date()) {
        return NextResponse.json({ error: 'End date cannot be in the future' }, { status: 400 });
      }
    }
    
    // Create Supabase client and get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine period based on type
    const now = new Date();
    let periodStart: string;
    let periodEnd: string;
    let period: string;

    if (type === 'monthly') {
      // Last month
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      periodStart = lastMonth.toISOString().split('T')[0];
      periodEnd = lastMonthEnd.toISOString().split('T')[0];
      period = lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (type === 'tax') {
      // Current financial year (Apr-Mar)
      const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      periodStart = `${currentYear}-04-01`;
      periodEnd = `${currentYear + 1}-03-31`;
      period = `FY ${currentYear}-${(currentYear + 1).toString().slice(2)}`;
    } else {
      // Custom - use provided dates or default to last 30 days
      if (startDate && endDate) {
        periodStart = startDate;
        periodEnd = endDate;
        period = `Custom ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
      } else {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodStart = thirtyDaysAgo.toISOString().split('T')[0];
        periodEnd = now.toISOString().split('T')[0];
        period = `Custom ${thirtyDaysAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      }
    }

    // Fetch financial data for the period using correct table structure
    const [transactionsRes, assetsRes, accountsRes, loansRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', periodStart)
        .lte('date', periodEnd)
        .order('date', { ascending: false }),
      supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'Active'),
    ]);

    // Separate income and expenses from transactions
    const allTransactions = transactionsRes.data || [];
    const incomeTransactions = allTransactions.filter((t: any) => Number(t.amount) > 0);
    const expenseTransactions = allTransactions.filter((t: any) => Number(t.amount) < 0);

    // Group expenses by category
    const expensesByCategory = expenseTransactions.reduce((acc: any, expense: any) => {
      const category = expense.category || 'Other';
      if (!acc[category]) {
        acc[category] = { total: 0, transactions: [] };
      }
      acc[category].total += Math.abs(Number(expense.amount));
      acc[category].transactions.push(expense);
      return acc;
    }, {});

    // Group income by category/source
    const incomeBySource = incomeTransactions.reduce((acc: any, income: any) => {
      const source = income.category || income.merchant || 'Other';
      if (!acc[source]) {
        acc[source] = { total: 0, transactions: [] };
      }
      acc[source].total += Number(income.amount);
      acc[source].transactions.push(income);
      return acc;
    }, {});

    // Calculate totals using the correct data
    const totalIncome = incomeTransactions.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalExpenses = Math.abs(expenseTransactions.reduce((sum: number, item: any) => sum + Number(item.amount), 0));
    const totalInvestments = (assetsRes.data || []).reduce((sum: number, item: any) => sum + Number(item.current_value || item.purchase_price || 0), 0);
    const totalBalance = (accountsRes.data || []).reduce((sum: number, item: any) => sum + Number(item.balance || 0), 0);
    const totalDebt = (loansRes.data || []).reduce((sum: number, loan: any) => sum + Number(loan.principal || 0) - Number(loan.extra_paid || 0), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

    console.log('Report calculations:', {
      totalIncome,
      totalExpenses,
      totalInvestments,
      totalBalance,
      totalDebt,
      netSavings,
      savingsRate,
      transactionsCount: allTransactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length
    });

    // Generate PDF using the SimpleReportGenerator
    const reportGenerator = new SimpleReportGenerator();
    const pdfBuffer = await reportGenerator.generateReport(
      {
        totalIncome,
        totalExpenses,
        totalInvestments,
        totalBalance,
        savingsRate,
        netSavings,
        totalDebt,
        incomeData: incomeTransactions,
        expensesData: expenseTransactions,
        investmentsData: assetsRes.data || [],
        accountsData: accountsRes.data || [],
        loansData: loansRes.data || [],
        expensesByCategory,
        incomeBySource,
      },
      {
        type: type as 'monthly' | 'tax' | 'custom',
        period,
        periodStart,
        periodEnd,
        userId: user.id,
      }
    );
    const fileName = `${user.id}/${type}-${Date.now()}.pdf`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('financial-reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload report');
    }

    // Save report metadata to database
    const { data: reportData, error: reportError } = await supabase
      .from('financial_reports')
      .insert({
        user_id: user.id,
        type,
        period,
        period_start: periodStart,
        period_end: periodEnd,
        file_path: fileName,
      })
      .select()
      .single();

    if (reportError) throw reportError;

    return NextResponse.json({
      success: true,
      report: reportData,
      period,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}

