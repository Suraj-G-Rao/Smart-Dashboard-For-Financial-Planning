'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, Calendar, TrendingDown, Trash2, CreditCard, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { createSupabaseClient } from '@/lib/supabase/client';
import { formatINR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Loan {
  id: string;
  loan_name: string;
  loan_type: string;
  principal_amount: number;
  outstanding_amount: number;
  interest_rate: number;
  monthly_emi: number;
  tenure_months: number;
  remaining_months: number;
  start_date: string;
  end_date: string;
  lender_name: string;
  account_id?: string;
  status: string;
  next_payment_date: string;
  excess_savings?: number;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

export default function LoansPage() {
  const supabase = createSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    monthlyEMI: 0,
    activeLoans: 0,
    contributionToSavings: 0,
    availableForExtraPayment: 0
  });

  const [form, setForm] = useState({
    loan_name: '',
    loan_type: 'personal',
    principal_amount: '',
    interest_rate: '',
    tenure_months: '',
    start_date: new Date().toISOString().slice(0, 10),
    lender_name: '',
    account_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [loansRes, accountsRes] = await Promise.all([
        supabase.from('loans').select('*, excess_savings').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('accounts').select('*').eq('user_id', user.id),
      ]);

      if (loansRes.data) {
        setLoans(loansRes.data);
        calculateStats(loansRes.data);
      }
      if (accountsRes.data) setAccounts(accountsRes.data);
    } catch (error) {
      console.error('Error loading loans data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Loan[]) => {
    const activeLoans = data.filter(loan => loan.status === 'active');
    const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.outstanding_amount, 0);
    const monthlyEMI = activeLoans.reduce((sum, loan) => sum + loan.monthly_emi, 0);

    // These would be calculated based on user's income/salary data
    const contributionToSavings = 0; // Placeholder
    const availableForExtraPayment = 0; // Placeholder

    setStats({
      totalOutstanding,
      monthlyEMI,
      activeLoans: activeLoans.length,
      contributionToSavings,
      availableForExtraPayment
    });
  };

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return principal / tenure;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);
  };

  const handleAddLoan = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const principal = Number(form.principal_amount);
      const rate = Number(form.interest_rate);
      const tenure = Number(form.tenure_months);

      if (!principal || !rate || !tenure || !form.loan_name || !form.lender_name) {
        throw new Error('All fields are required');
      }

      const monthlyEMI = calculateEMI(principal, rate, tenure);
      const startDate = new Date(form.start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + tenure);

      const nextPaymentDate = new Date(startDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const { error } = await supabase.from('loans').insert({
        user_id: user.id,
        loan_name: form.loan_name,
        loan_type: form.loan_type,
        principal_amount: principal,
        outstanding_amount: principal,
        interest_rate: rate,
        monthly_emi: Math.round(monthlyEMI),
        tenure_months: tenure,
        remaining_months: tenure,
        start_date: form.start_date,
        end_date: endDate.toISOString().slice(0, 10),
        lender_name: form.lender_name,
        account_id: form.account_id || null,
        status: 'active',
        next_payment_date: nextPaymentDate.toISOString().slice(0, 10),
      });

      if (error) throw error;

      setShowModal(false);
      setForm({
        loan_name: '',
        loan_type: 'personal',
        principal_amount: '',
        interest_rate: '',
        tenure_months: '',
        start_date: new Date().toISOString().slice(0, 10),
        lender_name: '',
        account_id: '',
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to add loan');
    } finally {
      setSaving(false);
    }
  };

  const handlePayEMI = async (loanId: string) => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;

      // Check account balance before processing payment
      if (loan.account_id) {
        const account = accounts.find(acc => acc.id === loan.account_id);
        if (!account) {
          alert('Linked account not found');
          return;
        }

        if (loan.monthly_emi > account.balance) {
          alert(
            `Insufficient balance! Available: ₹${account.balance.toFixed(2)}, EMI Amount: ₹${loan.monthly_emi.toFixed(2)}`
          );
          return;
        }
      }

      // Calculate principal and interest components
      const monthlyRate = loan.interest_rate / 12 / 100;
      const interestAmount = loan.outstanding_amount * monthlyRate;
      const principalAmount = loan.monthly_emi - interestAmount;

      // Insert payment record
      await supabase.from('loan_payments').insert({
        loan_id: loanId,
        payment_amount: loan.monthly_emi,
        principal_amount: Math.max(0, principalAmount),
        interest_amount: interestAmount,
        payment_date: new Date().toISOString().slice(0, 10),
        due_date: loan.next_payment_date,
        status: 'paid',
      });

      // Update account balance if linked
      if (loan.account_id) {
        await supabase.rpc('update_account_balance', {
          p_account_id: loan.account_id,
          p_amount: -loan.monthly_emi,
        });
      }

      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to process payment');
    }
  };

  const handlePayExtraEMI = async (loanId: string) => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan || (loan.excess_savings || 0) < loan.monthly_emi) return;

      // Calculate principal and interest components
      const monthlyRate = loan.interest_rate / 12 / 100;
      const interestAmount = loan.outstanding_amount * monthlyRate;
      const principalAmount = loan.monthly_emi - interestAmount;

      // Insert payment record
      await supabase.from('loan_payments').insert({
        loan_id: loanId,
        payment_amount: loan.monthly_emi,
        principal_amount: Math.max(0, principalAmount),
        interest_amount: interestAmount,
        payment_date: new Date().toISOString().slice(0, 10),
        due_date: loan.next_payment_date,
        status: 'paid',
      });

      // Deduct EMI amount from excess savings
      await supabase.from('loans').update({
        excess_savings: (loan.excess_savings || 0) - loan.monthly_emi
      }).eq('id', loanId);

      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to process extra EMI payment');
    }
  };

  const handleDeleteLoan = async (id: string) => {
    if (!confirm('Delete this loan? This action cannot be undone.')) return;

    try {
      await supabase.from('loans').delete().eq('id', id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete loan');
    }
  };

  const getProgressPercentage = (loan: Loan) => {
    return ((loan.tenure_months - loan.remaining_months) / loan.tenure_months) * 100;
  };

  const getLoanTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return '🏠';
      case 'car': return '🚗';
      case 'education': return '🎓';
      case 'business': return '💼';
      default: return '💰';
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
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-sm text-muted-foreground">Manage your debt</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          title="Total Outstanding"
          value={formatINR(stats.totalOutstanding)}
          icon={Wallet}
          iconColor="text-orange-500"
        />
        <SummaryCard
          title="Monthly EMI"
          value={formatINR(stats.monthlyEMI)}
          icon={Calendar}
          iconColor="text-red-500"
        />
        <SummaryCard
          title="Active Loans"
          value={stats.activeLoans.toString()}
          icon={TrendingDown}
          iconColor="text-purple-500"
        />
      </div>

      {/* Contribution Info */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Monthly Salary considered:</span>
              <span className="font-medium ml-2">{formatINR(0)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Contribution to savings:</span>
              <span className="font-medium ml-2">0%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Available for extra payment this cycle:</span>
              <span className="font-medium ml-2">{formatINR(stats.availableForExtraPayment)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loans List */}
      <div className="space-y-6">
        {loans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No loans yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first loan to track payments and progress.
              </p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          loans.map((loan) => {
            const progress = getProgressPercentage(loan);
            const isOverdue = new Date(loan.next_payment_date) < new Date();

            return (
              <Card key={loan.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-xl">
                        {getLoanTypeIcon(loan.loan_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{loan.loan_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {loan.lender_name} • {loan.loan_type.charAt(0).toUpperCase() + loan.loan_type.slice(1)} Loan
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Rate: {loan.interest_rate}%</span>
                          <span>Term: {loan.tenure_months} months</span>
                          <span>EMI: {formatINR(loan.monthly_emi)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatINR(loan.outstanding_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        of {formatINR(loan.principal_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Rate: {loan.interest_rate}% • Term: {loan.tenure_months}m</p>
                    <p className="text-xs text-muted-foreground">EMI: {formatINR(loan.monthly_emi)}/month</p>
                    <p className="text-xs text-muted-foreground">Next payment: {new Date(loan.next_payment_date).toLocaleDateString()}</p>
                    {(loan.excess_savings || 0) > 0 && (
                      <p className="text-xs text-green-600 font-medium">
                        Excess Savings: {formatINR(loan.excess_savings || 0)}
                        {(loan.excess_savings || 0) >= loan.monthly_emi && ' (Can pay extra EMI!)'}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Repayment Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}% completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{loan.tenure_months - loan.remaining_months} of {loan.tenure_months} payments made</span>
                      <span>{loan.remaining_months} payments remaining</span>
                    </div>
                  </div>

                  {/* Next Payment Info */}
                  <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Next Payment Due</p>
                      <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {new Date(loan.next_payment_date).toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold">{formatINR(loan.monthly_emi)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handlePayEMI(loan.id)}
                      className="flex-1"
                      variant={isOverdue ? "destructive" : "default"}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isOverdue ? 'Pay Overdue EMI' : 'Pay EMI'}
                    </Button>
                    {(loan.excess_savings || 0) >= loan.monthly_emi && (
                      <Button
                        onClick={() => handlePayExtraEMI(loan.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Pay Extra EMI ({formatINR(loan.monthly_emi)})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteLoan(loan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Add New Loan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Loan Name</Label>
                  <Input
                    value={form.loan_name}
                    onChange={e => setForm({ ...form, loan_name: e.target.value })}
                    placeholder="e.g., Home Loan, Car Loan"
                  />
                </div>
                <div>
                  <Label>Loan Type</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={form.loan_type}
                    onChange={e => setForm({ ...form, loan_type: e.target.value })}
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="car">Car Loan</option>
                    <option value="education">Education Loan</option>
                    <option value="business">Business Loan</option>
                  </select>
                </div>
                <div>
                  <Label>Principal Amount (₹)</Label>
                  <Input
                    type="number"
                    value={form.principal_amount}
                    onChange={e => setForm({ ...form, principal_amount: e.target.value })}
                    placeholder="500000"
                  />
                </div>
                <div>
                  <Label>Interest Rate (% per annum)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.interest_rate}
                    onChange={e => setForm({ ...form, interest_rate: e.target.value })}
                    placeholder="8.5"
                  />
                </div>
                <div>
                  <Label>Tenure (months)</Label>
                  <Input
                    type="number"
                    value={form.tenure_months}
                    onChange={e => setForm({ ...form, tenure_months: e.target.value })}
                    placeholder="240"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Lender Name</Label>
                  <Input
                    value={form.lender_name}
                    onChange={e => setForm({ ...form, lender_name: e.target.value })}
                    placeholder="e.g., SBI, HDFC Bank"
                  />
                </div>
                <div>
                  <Label>Linked Account (optional)</Label>
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
              </div>

              {/* EMI Preview */}
              {form.principal_amount && form.interest_rate && form.tenure_months && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">EMI Preview</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatINR(calculateEMI(
                      Number(form.principal_amount),
                      Number(form.interest_rate),
                      Number(form.tenure_months)
                    ))}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button onClick={handleAddLoan} disabled={saving} className="flex-1">
                  {saving ? 'Adding...' : 'Add Loan'}
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
