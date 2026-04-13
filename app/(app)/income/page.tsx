'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Calendar, Trash2, TrendingUp, PiggyBank, Shield, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { createSupabaseClient } from '@/lib/supabase/client';
import { formatINR } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

interface IncomeEntry {
  id: string;
  date: string;
  amount: number;
  account_id: string;
  type: string;
  source: string;
  notes: string;
  emergency_fund_contribution: number;
  credit_card_contribution: number;
  loan_contribution: number;
}


interface EmergencyFund {
  id: string;
  target_amount: number;
  current_balance: number;
  monthly_target: number;
}

interface Loan {
  id: string;
  loan_name: string;
  outstanding_amount: number;
  monthly_emi: number;
  interest_rate: number;
  next_payment_date: string;
  excess_savings?: number;
}

export default function IncomePage() {
  const supabase = createSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ 
    totalIncome: 0, 
    emergencyContrib: 0, 
    loanContrib: 0,
    netIncome: 0 
  });
  
  const [form, setForm] = useState({
    amount: '',
    account_id: '',
    type: 'Salary',
    source: '',
    notes: '',
    emergency_fund_contribution: '',
    loan_contribution: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [accRes, incomeRes, loansRes, emergencyRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('income').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('loans').select('id, loan_name, outstanding_amount, monthly_emi, interest_rate, next_payment_date, excess_savings').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('emergency_fund').select('*').eq('user_id', user.id).single(),
      ]);

      if (accRes.data) setAccounts(accRes.data);
      if (incomeRes.data) {
        setEntries(incomeRes.data);
        calculateStats(incomeRes.data);
      }
      if (loansRes.data) setLoans(loansRes.data);
      if (emergencyRes.data) setEmergencyFund(emergencyRes.data);
    } catch (error) {
      console.error('Error loading income data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: IncomeEntry[]) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const thisMonthEntries = data.filter(e => e.date.startsWith(currentMonth));
    
    const totalIncome = thisMonthEntries.reduce((sum, e) => sum + e.amount, 0);
    const emergencyContrib = thisMonthEntries.reduce((sum, e) => sum + (e.emergency_fund_contribution || 0), 0);
    const loanContrib = thisMonthEntries.reduce((sum, e) => sum + (e.loan_contribution || 0), 0);
    const netIncome = totalIncome - emergencyContrib - loanContrib;

    setStats({ totalIncome, emergencyContrib, loanContrib, netIncome });
  };

  const handleAddIncome = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const amount = Number(form.amount);
      const emergencyContrib = Number(form.emergency_fund_contribution) || 0;
      const loanContrib = Number(form.loan_contribution) || 0;
      
      if (!amount || !form.account_id || !form.source) {
        throw new Error('Amount, account, and source are required');
      }

      if (emergencyContrib + loanContrib > amount) {
        throw new Error('Total contributions cannot exceed income amount');
      }

      // Insert income entry
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .insert({
          user_id: user.id,
          account_id: form.account_id,
          amount,
          date: form.date,
          type: form.type,
          source: form.source,
          notes: form.notes,
          emergency_fund_contribution: emergencyContrib,
          credit_card_contribution: 0,
          loan_contribution: loanContrib,
        })
        .select()
        .single();

      if (incomeError) throw incomeError;

      // Process contributions
      if (incomeData) {
        // Process emergency fund and loan contributions
        await supabase.rpc('process_income_contributions', {
          p_income_id: incomeData.id
        });
      }

      // Update account balance with net amount
      const netAmount = amount - emergencyContrib - loanContrib;
      await supabase.rpc('update_account_balance', {
        p_account_id: form.account_id,
        p_amount: netAmount,
      });

      setShowModal(false);
      setForm({
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        account_id: '',
        type: 'Salary',
        source: '',
        notes: '',
        emergency_fund_contribution: '',
        credit_card_contribution: '',
        selected_credit_card_id: '',
        loan_contribution: '',
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to add income');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Delete this income entry?')) return;

    try {
      const entry = entries.find(e => e.id === id);
      if (!entry) return;

      await supabase.from('income').delete().eq('id', id);

      // Reverse balance changes
      const netAmount = entry.amount - entry.emergency_fund_contribution - entry.credit_card_contribution - (entry.loan_contribution || 0);
      await supabase.rpc('update_account_balance', {
        p_account_id: entry.account_id,
        p_amount: -netAmount,
      });

      // Reverse emergency fund contribution
      if (entry.emergency_fund_contribution > 0 && emergencyFund) {
        await supabase.from('emergency_fund_transactions').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          emergency_fund_id: emergencyFund.id,
          amount: entry.emergency_fund_contribution,
          transaction_type: 'withdrawal',
          description: 'Reversal of income contribution',
          source: 'reversal'
        });
      }

      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete entry');
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }


  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Income</h1>
          <p className="text-sm text-muted-foreground">Track your earnings and smart allocations</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <SummaryCard
          title="Total Income"
          value={formatINR(stats.totalIncome)}
          icon={Calendar}
          iconColor="text-green-600"
        />
        <SummaryCard
          title="Net Income"
          value={formatINR(stats.netIncome)}
          icon={DollarSign}
          iconColor="text-blue-500"
        />
        <SummaryCard
          title="Emergency Fund Contribution"
          value={formatINR(stats.emergencyContrib)}
          icon={Shield}
          iconColor="text-purple-500"
        />
        <SummaryCard
          title="Loan Contribution"
          value={formatINR(stats.loanContrib)}
          icon={Wallet}
          iconColor="text-red-500"
        />
      </div>

      {/* Smart Allocation Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Emergency Fund Status</h3>
            </div>
            {emergencyFund ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Balance:</span>
                  <span className="font-medium">{formatINR(emergencyFund.current_balance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Target Amount:</span>
                  <span className="font-medium">{formatINR(emergencyFund.target_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly Target:</span>
                  <span className="font-medium">{formatINR(emergencyFund.monthly_target)}</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-3">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (emergencyFund.current_balance / emergencyFund.target_amount) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No emergency fund set up yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Loan Status Card */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold">Loan Status</h3>
            </div>
            {loans.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Loans:</span>
                  <span className="font-medium">{loans.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Outstanding:</span>
                  <span className="font-medium">{formatINR(loans.reduce((sum, loan) => sum + loan.outstanding_amount, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly EMI:</span>
                  <span className="font-medium">{formatINR(loans.reduce((sum, loan) => sum + loan.monthly_emi, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Excess Savings:</span>
                  <span className="font-medium text-green-600">{formatINR(loans.reduce((sum, loan) => sum + (loan.excess_savings || 0), 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Highest Interest:</span>
                  <span className="font-medium">{Math.max(...loans.map(loan => loan.interest_rate)).toFixed(1)}%</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active loans.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income Entries */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Income Entries</h2>
          <div className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No income entries yet.</p>
            ) : (
              entries.slice(0, 10).map(entry => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{entry.type} - {entry.source}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()} •{' '}
                        {accounts.find(a => a.id === entry.account_id)?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{formatINR(entry.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        Emergency: {formatINR(entry.emergency_fund_contribution)} • 
                        Credit: {formatINR(entry.credit_card_contribution)} • 
                        Loan: {formatINR(entry.loan_contribution || 0)}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Income Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Add Income</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Source Account</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={form.account_id}
                    onChange={e => setForm({ ...form, account_id: e.target.value })}
                  >
                    <option value="">Select account</option>
                    {accounts.filter(acc => acc.type !== 'credit_card').map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} • {formatINR(acc.balance)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    <option>Salary</option>
                    <option>Freelance</option>
                    <option>Bonus</option>
                    <option>Investment Returns</option>
                    <option>Rental Income</option>
                    <option>Business Income</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Source</Label>
                  <Input
                    value={form.source}
                    onChange={e => setForm({ ...form, source: e.target.value })}
                    placeholder="e.g., Company Name, Client Name, etc."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Input
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional details"
                  />
                </div>
                <div>
                  <Label>Emergency Fund Contribution (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.emergency_fund_contribution}
                    onChange={e => setForm({ ...form, emergency_fund_contribution: e.target.value })}
                    placeholder="0"
                    disabled={!emergencyFund}
                  />
                  {emergencyFund ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      Suggested: {formatINR(emergencyFund.monthly_target)}
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 mt-1">No emergency fund set up</p>
                  )}
                </div>
                <div>
                  <Label>Loan Contribution (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.loan_contribution}
                    onChange={e => setForm({ ...form, loan_contribution: e.target.value })}
                    placeholder="0"
                    disabled={loans.length === 0}
                  />
                  {loans.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Highest interest: {Math.max(...loans.map(loan => loan.interest_rate)).toFixed(1)}% - Next EMI: {formatINR(Math.min(...loans.map(loan => loan.monthly_emi)))}
                      </p>
                      {form.loan_contribution && Number(form.loan_contribution) > 0 && (
                        <p className="text-xs text-blue-600">
                          {Number(form.loan_contribution) >= Math.min(...loans.map(loan => loan.monthly_emi)) ? 
                            `✓ Will pay EMI + save excess: ${formatINR(Number(form.loan_contribution) - Math.min(...loans.map(loan => loan.monthly_emi)))}` :
                            'Partial EMI payment'
                          }
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-500 mt-1">No active loans</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleAddIncome} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Add Income'}
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
