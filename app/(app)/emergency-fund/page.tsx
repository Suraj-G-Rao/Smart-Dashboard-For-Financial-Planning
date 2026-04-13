'use client';

import { useState, useEffect } from 'react';
import { Shield, TrendingUp, Target, DollarSign, Plus, Minus, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { createSupabaseClient } from '@/lib/supabase/client';
import { formatINR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmergencyFund {
  id: string;
  target_amount: number;
  current_balance: number;
  monthly_target: number;
  months_covered: number;
  goal_description: string;
  is_linked: boolean;
  account_id?: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal';
  date: string;
  description: string;
  source: string;
}

export default function EmergencyFundPage() {
  const supabase = createSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [setupForm, setSetupForm] = useState({
    target_amount: '',
    monthly_target: '',
    goal_description: '',
    account_id: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    transaction_type: 'deposit' as 'deposit' | 'withdrawal',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [fundRes, accountsRes, transactionsRes] = await Promise.all([
        supabase.from('emergency_fund').select('*').eq('user_id', user.id).single(),
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('emergency_fund_transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(10),
      ]);

      if (fundRes.data) {
        setEmergencyFund(fundRes.data);
      }
      if (accountsRes.data) setAccounts(accountsRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error loading emergency fund data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupFund = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const targetAmount = Number(setupForm.target_amount);
      const monthlyTarget = Number(setupForm.monthly_target);
      
      if (!targetAmount || !monthlyTarget) {
        throw new Error('Target amount and monthly target are required');
      }

      const { error } = await supabase.from('emergency_fund').insert({
        user_id: user.id,
        target_amount: targetAmount,
        monthly_target: monthlyTarget,
        goal_description: setupForm.goal_description,
        account_id: setupForm.account_id || null,
        is_linked: !!setupForm.account_id,
        current_balance: 0,
        months_covered: 0,
      });

      if (error) throw error;

      setShowSetupModal(false);
      setSetupForm({
        target_amount: '',
        monthly_target: '',
        goal_description: '',
        account_id: '',
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to setup emergency fund');
    } finally {
      setSaving(false);
    }
  };

  const handleTransaction = async () => {
    if (!emergencyFund) return;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const amount = Number(transactionForm.amount);
      if (!amount || !transactionForm.description) {
        throw new Error('Amount and description are required');
      }

      // Check if withdrawal doesn't exceed current balance
      if (transactionForm.transaction_type === 'withdrawal' && amount > emergencyFund.current_balance) {
        throw new Error('Withdrawal amount cannot exceed current balance');
      }

      const { error } = await supabase.from('emergency_fund_transactions').insert({
        user_id: user.id,
        emergency_fund_id: emergencyFund.id,
        amount,
        transaction_type: transactionForm.transaction_type,
        description: transactionForm.description,
        source: 'manual',
      });

      if (error) throw error;

      setShowTransactionModal(false);
      setTransactionForm({
        amount: '',
        transaction_type: 'deposit',
        description: '',
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to process transaction');
    } finally {
      setSaving(false);
    }
  };

  const linkAccount = async (accountId: string) => {
    if (!emergencyFund) return;

    try {
      const { error } = await supabase
        .from('emergency_fund')
        .update({ 
          account_id: accountId,
          is_linked: true 
        })
        .eq('id', emergencyFund.id);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to link account');
    }
  };

  const unlinkAccount = async () => {
    if (!emergencyFund) return;

    try {
      const { error } = await supabase
        .from('emergency_fund')
        .update({ 
          account_id: null,
          is_linked: false 
        })
        .eq('id', emergencyFund.id);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to unlink account');
    }
  };

  const getProgressPercentage = () => {
    if (!emergencyFund || emergencyFund.target_amount === 0) return 0;
    return Math.min((emergencyFund.current_balance / emergencyFund.target_amount) * 100, 100);
  };

  const getLinkedAccount = () => {
    if (!emergencyFund?.account_id) return null;
    return accounts.find(acc => acc.id === emergencyFund.account_id);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!emergencyFund) {
    return (
      <div className="container mx-auto space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Emergency Fund</h1>
          <p className="text-muted-foreground mb-8">
            Build financial resilience with a dedicated emergency fund
          </p>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Emergency Fund Set Up</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Start building your financial safety net today. Experts recommend saving 3-6 months of expenses.
              </p>
              <Button onClick={() => setShowSetupModal(true)}>
                <Shield className="mr-2 h-4 w-4" />
                Setup Emergency Fund
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Setup Modal */}
        {showSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Setup Emergency Fund</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Target Amount (₹)</Label>
                    <Input
                      type="number"
                      value={setupForm.target_amount}
                      onChange={e => setSetupForm({ ...setupForm, target_amount: e.target.value })}
                      placeholder="300000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 3-6 months of your monthly expenses
                    </p>
                  </div>
                  <div>
                    <Label>Monthly Savings Target (₹)</Label>
                    <Input
                      type="number"
                      value={setupForm.monthly_target}
                      onChange={e => setSetupForm({ ...setupForm, monthly_target: e.target.value })}
                      placeholder="25000"
                    />
                  </div>
                  <div>
                    <Label>Goal Description (optional)</Label>
                    <Input
                      value={setupForm.goal_description}
                      onChange={e => setSetupForm({ ...setupForm, goal_description: e.target.value })}
                      placeholder="6 months of expenses for financial security"
                    />
                  </div>
                  <div>
                    <Label>Link to Account (optional)</Label>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2"
                      value={setupForm.account_id}
                      onChange={e => setSetupForm({ ...setupForm, account_id: e.target.value })}
                    >
                      <option value="">Keep as virtual fund</option>
                      {accounts.filter(acc => acc.type !== 'credit_card').map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} • {formatINR(acc.balance)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={handleSetupFund} disabled={saving} className="flex-1">
                    {saving ? 'Setting up...' : 'Setup Fund'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowSetupModal(false)} className="flex-1">
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

  const progressPercentage = getProgressPercentage();
  const linkedAccount = getLinkedAccount();
  const remainingAmount = Math.max(0, emergencyFund.target_amount - emergencyFund.current_balance);

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emergency Fund</h1>
          <p className="text-sm text-muted-foreground">
            {emergencyFund.goal_description || 'Your financial safety net'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowTransactionModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Account Linking */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Linked Account</h3>
                <p className="text-sm text-muted-foreground">
                  {linkedAccount ? linkedAccount.name : 'Not Linked'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!emergencyFund.is_linked ? (
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  onChange={(e) => e.target.value && linkAccount(e.target.value)}
                  defaultValue=""
                >
                  <option value="">Select Account</option>
                  {accounts.filter(acc => acc.type !== 'credit_card').map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Button variant="outline" size="sm" onClick={unlinkAccount}>
                  Unlink
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <SummaryCard
          title="Current Balance"
          value={formatINR(emergencyFund.current_balance)}
          icon={DollarSign}
          iconColor="text-blue-500"
        />
        <SummaryCard
          title="Target Amount"
          value={formatINR(emergencyFund.target_amount)}
          icon={Target}
          iconColor="text-purple-500"
        />
        <SummaryCard
          title="Months Covered"
          value={emergencyFund.months_covered.toFixed(1)}
          icon={Shield}
          iconColor="text-green-500"
        />
        <SummaryCard
          title="Monthly Target"
          value={formatINR(emergencyFund.monthly_target)}
          icon={TrendingUp}
          iconColor="text-orange-500"
        />
      </div>

      {/* Progress Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress Visualization */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-0">
          <CardContent className="p-8 text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="relative h-40 w-40">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  {/* Progress circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="3"
                    strokeDasharray={`${progressPercentage}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              progressPercentage >= 100 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                : progressPercentage >= 50
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {progressPercentage >= 100 ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  Goal Achieved!
                </>
              ) : progressPercentage >= 50 ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  On Track
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  Getting Started
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fund Status */}
        <Card>
          <CardHeader>
            <CardTitle>Fund Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {remainingAmount > 0 ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Remaining to Target</p>
                  <p className="text-2xl font-bold">{formatINR(remainingAmount)}</p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    🎉 Goal Achieved!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    You've successfully built your emergency fund!
                  </p>
                </div>
              )}

              {remainingAmount > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">To reach your target:</p>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Save{' '}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formatINR(emergencyFund.monthly_target)}/month
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll reach your goal in approximately{' '}
                      <span className="font-semibold">
                        {Math.ceil(remainingAmount / emergencyFund.monthly_target)} months
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  💡 Quick Tips
                </p>
                <ul className="space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
                  <li>• Keep funds in a high-yield savings account</li>
                  <li>• Automate monthly contributions</li>
                  <li>• Use windfalls to boost your fund</li>
                  <li>• Only use for true emergencies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
            ) : (
              transactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      transaction.transaction_type === 'deposit' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-br from-red-500 to-orange-500'
                    } text-white`}>
                      {transaction.transaction_type === 'deposit' ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.source}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${
                    transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatINR(transaction.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Add Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Transaction Type</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={transactionForm.transaction_type}
                    onChange={e => setTransactionForm({ 
                      ...transactionForm, 
                      transaction_type: e.target.value as 'deposit' | 'withdrawal' 
                    })}
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={transactionForm.amount}
                    onChange={e => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={transactionForm.description}
                    onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    placeholder="Monthly contribution / Emergency expense"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleTransaction} disabled={saving} className="flex-1">
                  {saving ? 'Processing...' : 'Add Transaction'}
                </Button>
                <Button variant="outline" onClick={() => setShowTransactionModal(false)} className="flex-1">
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
