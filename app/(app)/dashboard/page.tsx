'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/format';
import { TrendingUp, TrendingDown, CreditCard, MoreVertical, DollarSign, PiggyBank, Landmark, Search, Sparkles, ChevronDown, Target, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]); // other assets / SIPs
  const [investments, setInvestments] = useState<any[]>([]); // stock / investment holdings
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]); // from transactions table
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]); // from expenses table
  const [stats, setStats] = useState({ avgIncome: 0, avgExpense: 0, profit: 0 });
  const [loans, setLoans] = useState<any[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<any>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [healthMetrics, setHealthMetrics] = useState({
    savingsRate: 0,
    debtToAssetRatio: 0,
    emergencyFundCoverage: 0
  });
  const [timePeriod, setTimePeriod] = useState<'month' | 'year'>('month');
  const [hasData, setHasData] = useState(false);
  const initialRender = useRef(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      setUser(authUser);

      // Parallel fetch for better performance
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        { data: accountsData, error: accountsError },
        { data: cardsData, error: cardsError },
        { data: assetsData, error: assetsError },
        { data: investmentsData, error: investmentsError },
        { data: txData, error: txError },
        { data: expensesData, error: expensesError },
        { data: allTransactionsData, error: allTxError },
        { data: loansData, error: loansError },
        { data: profileData, error: profileError },
        { data: monthlyIncomeData, error: monthlyIncomeError },
        { data: monthlyExpensesData, error: monthlyExpensesError }
      ] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', authUser.id).order('created_at'),
        supabase.from('accounts').select('*').eq('user_id', authUser.id).eq('type', 'card').order('created_at'),
        supabase.from('assets').select('*').eq('user_id', authUser.id).order('created_at'),
        supabase.from('investments').select('*').eq('user_id', authUser.id).order('created_at'),
        supabase.from('transactions').select('*').eq('user_id', authUser.id).order('date', { ascending: false }).limit(10),
        supabase.from('expenses').select('*').eq('user_id', authUser.id).order('date', { ascending: false }).limit(10),
        supabase.from('transactions').select('*').eq('user_id', authUser.id).gte('date', yearStart),
        // Loans: use same schema as loans page, don't depend on exact case of status
        supabase.from('loans').select('*').eq('user_id', authUser.id),
        supabase.from('profiles').select('emergency_fund_account_id, emergency_fund_target_months').eq('id', authUser.id).maybeSingle(),
        // Monthly income for budget calculations
        supabase.from('income').select('*').eq('user_id', authUser.id).gte('date', monthStart),
        // Monthly expenses for budget calculations
        supabase.from('expenses').select('*').eq('user_id', authUser.id).gte('date', monthStart)
      ]);

      // Log any errors
      if (accountsError) console.error('Accounts error:', accountsError);
      if (cardsError) console.error('Cards error:', cardsError);
      if (assetsError) console.error('Assets error:', assetsError);
      if (investmentsError) console.error('Investments error:', investmentsError);
      if (txError) console.error('Transactions error:', txError);
      if (expensesError) console.error('Expenses error:', expensesError);
      if (allTxError) console.error('All transactions error:', allTxError);
      if (loansError) console.error('Loans error:', loansError);
      if (profileError) console.error('Profile error:', profileError);
      if (monthlyIncomeError) console.error('Monthly income error:', monthlyIncomeError);
      if (monthlyExpensesError) console.error('Monthly expenses error:', monthlyExpensesError);

      // Separate income and expenses from transactions (handle null/undefined data)
      const safeTransactionsData = allTransactionsData || [];
      const incomeTransactions = safeTransactionsData.filter((t: any) => t && Number(t.amount) > 0);
      const expenseTransactions = safeTransactionsData.filter((t: any) => t && Number(t.amount) < 0);

      // Check if we have any data
      const hasAnyData =
        (accountsData?.length || 0) > 0 ||
        (allTransactionsData?.length || 0) > 0 ||
        (assetsData?.length || 0) > 0 ||
        (investmentsData?.length || 0) > 0 ||
        (expensesData?.length || 0) > 0;
      setHasData(hasAnyData);

      // Initialize with empty arrays if no data
      setAccounts(hasAnyData ? (accountsData || []) : []);
      setAssets(hasAnyData ? (assetsData || []) : []);
      setInvestments(hasAnyData ? (investmentsData || []) : []);
      setRecentTransactions(hasAnyData ? (txData || []) : []);
      setRecentExpenses(hasAnyData ? (expensesData || []) : []);
      setLoans(hasAnyData ? (loansData || []) : []);
      setEmergencyFund(hasAnyData ? profileData : null);
      setMonthlyIncome(hasAnyData ? (monthlyIncomeData || []) : []);
      setMonthlyExpenses(hasAnyData ? (monthlyExpensesData || []) : []);

      if (!hasAnyData) {
        setStats({ avgIncome: 0, avgExpense: 0, profit: 0 });
        setHealthMetrics({
          savingsRate: 0,
          debtToAssetRatio: 0,
          emergencyFundCoverage: 0
        });
        setLoading(false);
        return;
      }

      // These are now set in the earlier block

      // Calculate spending this month for each card in parallel
      const cardsWithSpending = await Promise.all(
        (cardsData || []).map(async (card) => {
          const { data: spending } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', authUser.id)
            .eq('account_id', card.id)
            .lt('amount', 0)
            .gte('date', monthStart);

          const monthlySpending = Math.abs(
            (spending || []).reduce((sum, t) => sum + Number(t.amount), 0)
          );

          return { ...card, monthlySpending };
        })
      );

      setCreditCards(cardsWithSpending);

      // Calculate stats from transactions (income = positive amounts, expenses = negative amounts)
      const totalInc = incomeTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      const totalExp = Math.abs(expenseTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0));

      // For overview section, we need total amounts, not averages
      const avgInc = totalInc; // This should be total, not average
      const avgExp = totalExp; // This should be total, not average

      // No separate contributions table, so set to 0 for now
      const totalContributions = 0;

      const profitPercent = totalInc > 0 ? ((totalInc - totalExp - totalContributions) / totalInc) * 100 : 0;

      // Calculate health metrics
      const totalCashForHealth = (accountsData || []).reduce((sum, a) => sum + Number(a.balance || 0), 0);
      const totalInvestmentsForHealth =
        (assetsData || []).reduce((sum, asset) => sum + Number(asset.current_value || asset.purchase_price || 0), 0) +
        (investmentsData || []).reduce(
          (sum, inv: any) => sum + Number(inv.quantity || 0) * Number(inv.current_price || 0),
          0
        );
      const totalLoansDebt = (loansData || []).reduce((sum, loan: any) => {
        const isActive = (loan.status || '').toLowerCase() === 'active';
        const outstanding = Number(loan.outstanding_amount ?? loan.principal_amount ?? 0);
        return isActive ? sum + outstanding : sum;
      }, 0);
      const totalAssets = totalCashForHealth + totalInvestmentsForHealth;

      const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;
      const debtToAssetRatio = totalAssets > 0 ? (totalLoansDebt / totalAssets) * 100 : 0;
      const monthlyExpenses = Math.abs(totalExp / 30); // Approximate monthly expenses
      // Get emergency fund balance from linked account
      const emergencyFundBalance = profileData?.emergency_fund_account_id
        ? (accountsData || []).find(acc => acc.id === profileData.emergency_fund_account_id)?.balance || 0
        : 0;
      const emergencyFundCoverage = emergencyFundBalance && monthlyExpenses > 0
        ? emergencyFundBalance / monthlyExpenses
        : 0;

      setStats({ avgIncome: avgInc, avgExpense: avgExp, profit: profitPercent });
      setHealthMetrics({
        savingsRate: Math.max(0, savingsRate),
        debtToAssetRatio: Math.min(100, debtToAssetRatio),
        emergencyFundCoverage: emergencyFundCoverage
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debug function to create sample data
  const createSampleData = async () => {
    try {
      console.log('Creating sample data...');
      const response = await fetch('/api/debug/create-sample-data', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Sample data created:', result);

      // Refresh dashboard data
      await fetchDashboardData();

    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

  // Debug function to check existing data
  const checkData = async () => {
    try {
      console.log('Checking existing data...');
      const response = await fetch('/api/debug/check-data', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Data check result:', result);

    } catch (error) {
      console.error('Error checking data:', error);
    }
  };

  // Calculate financial metrics with proper null checks and accurate calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculate monthly income/expenses from recent transactions (memoized)
  const monthlyTransactions = useMemo(() => {
    if (!hasData) return [] as any[];
    return recentTransactions.filter(tx => {
      if (!tx || !tx.date) return false;
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });
  }, [hasData, recentTransactions, currentMonth, currentYear]);

  // Calculate total monthly income from income table
  const totalMonthlyIncome = useMemo(() => {
    if (!hasData) return 0;
    return monthlyIncome.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
  }, [hasData, monthlyIncome]);

  // Calculate total monthly expenses from expenses table
  const totalMonthlyExpenses = useMemo(() => {
    if (!hasData) return 0;
    return monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }, [hasData, monthlyExpenses]);

  // Bank-like account types (used for cash and bank balance)
  const bankAccountTypes = ['savings', 'current', 'salary', 'fixed_deposit'];

  // Calculate cash components (memoized)
  const totalBankCash = useMemo(() => {
    if (!hasData) return 0;
    return accounts.reduce((sum, account) => {
      const balance = Number(account.balance || 0);
      if (!bankAccountTypes.includes(account.type)) return sum;
      // For cash, include only positive balances as assets
      return balance > 0 ? sum + balance : sum;
    }, 0);
  }, [hasData, accounts, bankAccountTypes]);

  // Bank overdrafts (negative balances on bank-like accounts) count as debt
  const totalBankOverdraftDebt = useMemo(() => {
    if (!hasData) return 0;
    return accounts.reduce((sum, account) => {
      const balance = Number(account.balance || 0);
      if (!bankAccountTypes.includes(account.type)) return sum;
      return balance < 0 ? sum + Math.abs(balance) : sum;
    }, 0);
  }, [hasData, accounts, bankAccountTypes]);

  const totalInvestments = useMemo(() => {
    if (!hasData) return 0;
    // Match Investments page: totalValue = sum(quantity * current_price)
    return investments.reduce((sum, inv) => {
      const qty = Number(inv.quantity || 0);
      const price = Number(inv.current_price || 0);
      return sum + qty * price;
    }, 0);
  }, [hasData, investments]);

  // Calculate debt components (memoized)
  const totalLoanDebt = useMemo(() => {
    if (!hasData) return 0;
    // Match loans page: use outstanding_amount (or principal_amount) for active loans
    return loans.reduce((sum, loan: any) => {
      const isActive = (loan.status || '').toLowerCase() === 'active';
      const outstanding = Number(loan.outstanding_amount ?? loan.principal_amount ?? 0);
      return isActive ? sum + outstanding : sum;
    }, 0);
  }, [hasData, loans]);

  const totalCreditCardDebt = useMemo(() => {
    if (!hasData) return 0;
    return creditCards.reduce((sum, card) => {
      const balance = Number(card.balance || 0);
      return balance < 0 ? sum + Math.abs(balance) : sum;
    }, 0);
  }, [hasData, creditCards]);

  // Total debt includes loans, credit card balances, and bank overdrafts
  const totalDebt = useMemo(
    () => totalLoanDebt + totalCreditCardDebt + totalBankOverdraftDebt,
    [totalLoanDebt, totalCreditCardDebt, totalBankOverdraftDebt]
  );

  // Net worth = cash (positive bank balances) + investments - all liabilities
  const netWorth = useMemo(
    () => totalBankCash + totalInvestments - totalDebt,
    [totalBankCash, totalInvestments, totalDebt]
  );
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';

  // Calculate SIPs from investments (memoized)
  const activeSIPs = useMemo(() => {
    if (!hasData) return 0;
    return assets.filter(asset => asset.type === 'sip' && asset.status === 'active').length;
  }, [hasData, assets]);

  const totalSIPAmount = useMemo(() => {
    if (!hasData || activeSIPs <= 0) return 0;
    return assets
      .filter(asset => asset.type === 'sip' && asset.status === 'active')
      .reduce((sum, asset) => sum + Number(asset.monthly_investment || 0), 0);
  }, [hasData, activeSIPs, assets]);

  // Update stats with actual calculations (memoized)
  const yearlyIncome = useMemo(() => totalMonthlyIncome * 12, [totalMonthlyIncome]);
  const yearlyExpenses = useMemo(() => totalMonthlyExpenses * 12, [totalMonthlyExpenses]);
  const yearlySavings = useMemo(() => yearlyIncome - yearlyExpenses, [yearlyIncome, yearlyExpenses]);

  // Monthly budget metrics based on business logic
  const actualMonthlySpending = totalMonthlyExpenses;
  const monthlySavings = useMemo(
    () => Math.max(totalMonthlyIncome - actualMonthlySpending, 0),
    [totalMonthlyIncome, actualMonthlySpending]
  );

  // Update health metrics using the state setter in a useEffect
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const newSavingsRate = totalMonthlyIncome > 0 ?
      ((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome) * 100 : 0;

    const newDebtToAssetRatio = (totalBankCash + totalInvestments) > 0 ?
      (totalDebt / (totalBankCash + totalInvestments)) * 100 : 0;

    const newEmergencyFundCoverage = totalMonthlyExpenses > 0 ?
      (totalBankCash / totalMonthlyExpenses) : 0;

    // Only update if values have changed to prevent unnecessary re-renders
    if (
      healthMetrics.savingsRate !== newSavingsRate ||
      healthMetrics.debtToAssetRatio !== newDebtToAssetRatio ||
      healthMetrics.emergencyFundCoverage !== newEmergencyFundCoverage
    ) {
      setHealthMetrics({
        savingsRate: newSavingsRate,
        debtToAssetRatio: newDebtToAssetRatio,
        emergencyFundCoverage: newEmergencyFundCoverage
      });
    }
  }, [totalMonthlyIncome, totalMonthlyExpenses, totalBankCash, totalInvestments, totalDebt, healthMetrics]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // These are now calculated above with the other variables

  // Format current date
  const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 md:px-8 md:py-8">
      <section className="max-w-7xl mx-auto space-y-6">

        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Welcome back, <span className="font-semibold text-foreground">{userName}</span> 👋
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-card border shadow-sm">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-sm font-semibold">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* FIRST ROW: 4 Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Net Worth - Gradient Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <Link href="/accounts" className="text-xs text-white/80 hover:text-white transition-colors">
                  View →
                </Link>
              </div>
              <p className="text-xs uppercase tracking-wide text-white/80 font-medium mb-1">Net Worth</p>
              <p className="text-2xl md:text-3xl font-bold text-white">{formatINR(netWorth)}</p>
            </div>
          </div>

          {/* Total Bank Balance - Gradient Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Landmark className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs uppercase tracking-wide text-white/80 font-medium mb-1">Bank Balance</p>
              <p className="text-2xl md:text-3xl font-bold text-white mb-2">{formatINR(totalBankCash)}</p>
              <p className="text-xs text-white/70">
                {accounts.filter(a => bankAccountTypes.includes(a.type)).length} account
                {accounts.filter(a => bankAccountTypes.includes(a.type)).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Total Investments - Gradient Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <Link href="/investments" className="text-xs text-white/80 hover:text-white transition-colors">
                  View →
                </Link>
              </div>
              <p className="text-xs uppercase tracking-wide text-white/80 font-medium mb-1">Investments</p>
              <p className="text-2xl md:text-3xl font-bold text-white mb-2">{formatINR(totalInvestments)}</p>
              <p className="text-xs text-white/70">
                {assets.length} asset{assets.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Total Debt - Gradient Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs uppercase tracking-wide text-white/80 font-medium mb-1">Total Debt</p>
              <p className="text-2xl md:text-3xl font-bold text-white mb-2">{formatINR(totalDebt)}</p>
              <p className="text-xs text-white/70">
                {loans.length + creditCards.length} account{loans.length + creditCards.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* SECOND ROW: Financial Overview */}
        <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-6 md:p-8 shadow-lg border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-foreground">Financial Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">Your accounts and financial summary</p>
            </div>
            <Link
              href="/accounts"
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Accounts</p>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-300">{accounts.length + creditCards.length + loans.length}</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">Bank, Credit & Loans</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Investments</p>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-300">{investments.length}</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-2">Active Holdings</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Active Loans</p>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-amber-700 dark:text-amber-300">{loans.length}</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-2">Outstanding Debt</p>
            </div>
          </div>
        </div>

        {/* THIRD ROW: Monthly Budget + Financial Health + Upcoming Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          {/* Monthly Budget Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Monthly Budget Overview</CardTitle>
                <select className="text-xs border rounded-md px-2 py-1 bg-background">
                  <option>This month</option>
                  <option>Last month</option>
                  <option>This year</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Income</p>
                  <p className="text-lg font-semibold text-foreground">{formatINR(totalMonthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Planned Spending</p>
                  <p className="text-lg font-semibold text-foreground">{formatINR(actualMonthlySpending)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Actual Spending</p>
                  <p className="text-lg font-semibold text-primary">{formatINR(actualMonthlySpending)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Savings</p>
                  <p className="text-lg font-semibold text-success">{formatINR(monthlySavings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Health Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Financial Health Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative h-40 w-40">
                  <svg className="h-40 w-40 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-muted" strokeWidth="4" strokeDasharray="50, 100" strokeDashoffset="0" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-primary" strokeWidth="4" strokeDasharray="25, 100" strokeDashoffset="-50" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-success" strokeWidth="4" strokeDasharray="20, 100" strokeDashoffset="-75" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-destructive" strokeWidth="4" strokeDasharray="5, 100" strokeDashoffset="-95" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-foreground">
                      {hasData && totalMonthlyIncome > 0
                        ? ((monthlySavings / totalMonthlyIncome) * 100).toFixed(1) + '%'
                        : '0%'}
                    </p>
                    <p className="text-xs text-muted-foreground">Savings</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">Needs</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">50%</p>
                    <p className="text-xs text-muted-foreground">{formatINR(totalMonthlyIncome * 0.5)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                    <span className="text-sm text-foreground">Wants</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">25%</p>
                    <p className="text-xs text-muted-foreground">{formatINR(totalMonthlyIncome * 0.3)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-sm text-foreground">Savings</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">20%</p>
                    <p className="text-xs text-muted-foreground">{formatINR(totalMonthlyIncome * 0.2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <span className="text-sm text-foreground">Debt</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">5%</p>
                    <p className="text-xs text-muted-foreground">{formatINR(totalMonthlyIncome * 0.05)}</p>
                  </div>
                </div>
              </div>
              {hasData ? (
                <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-xs text-success-foreground font-medium mb-1">✓ Healthy Distribution</p>
                  <p className="text-xs text-success-foreground/80">You are close to the 50/30/20 rule. Keep it up!</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-muted/20">
                  <p className="text-xs text-muted-foreground font-medium mb-1">No financial data available</p>
                  <p className="text-xs text-muted-foreground/80">Add accounts, transactions, or create sample data to see your financial health.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/expenses" className="text-sm text-primary hover:text-primary/80">
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hasData && recentExpenses.length > 0 ? (
                <div className="space-y-3">
                  {recentExpenses.slice(0, 5).map((expense) => {
                    const amount = Number(expense.amount || 0);
                    const category = expense.category || 'Uncategorized';
                    const account = accounts.find(a => a.id === expense.account_id)?.name || 'Account';

                    return (
                      <div key={expense.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{expense.description || 'Expense'}</p>
                          <p className="text-xs text-muted-foreground">{category} • {account}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-500">
                            -{formatINR(amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No transactions yet</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Add your first expense to get started
                  </p>
                  <Button size="sm" className="mt-4" asChild>
                    <Link href="/expenses">Add Expense</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </section>
    </main>
  )
}



