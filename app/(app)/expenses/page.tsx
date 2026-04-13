'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, Plus, Calendar, PieChart as PieChartIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { createSupabaseClient } from '@/lib/supabase/client';
import { formatINR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

interface ExpenseEntry {
  id: string;
  date: string;
  amount: number;
  account_id: string;
  category: string;
  subcategory: string;
  description: string;
  notes: string;
}

interface ExpenseCategory {
  name: string;
  icon: string;
  color: string;
}

// Default categories as fallback
const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { name: 'Food & Dining', icon: '🍽️', color: '#ef4444' },
  { name: 'Transportation', icon: '🚗', color: '#f97316' },
  { name: 'Shopping', icon: '🛍️', color: '#eab308' },
  { name: 'Entertainment', icon: '🎬', color: '#22c55e' },
  { name: 'Bills & Utilities', icon: '💡', color: '#3b82f6' },
  { name: 'Healthcare', icon: '🏥', color: '#a855f7' },
  { name: 'Education', icon: '📚', color: '#06b6d4' },
  { name: 'Travel', icon: '✈️', color: '#f59e0b' },
  { name: 'Personal Care', icon: '💄', color: '#ec4899' },
  { name: 'Home & Garden', icon: '🏠', color: '#10b981' },
  { name: 'Insurance', icon: '🛡️', color: '#6366f1' },
  { name: 'Taxes', icon: '📊', color: '#8b5cf6' },
  { name: 'Investments', icon: '📈', color: '#059669' },
  { name: 'Gifts & Donations', icon: '🎁', color: '#dc2626' },
  { name: 'Other', icon: '📝', color: '#6b7280' }
];


const EXPENSE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#10b981',
  '#6366f1', '#8b5cf6', '#059669', '#dc2626', '#6b7280'
];

export default function ExpensesPage() {
  const supabase = createSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    thisMonth: 0,
    unpaidBills: 0,
    monthlySubs: 0,
    topCategory: 'None'
  });

  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    account_id: '',
    category: '',
    subcategory: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [accRes, expRes, catRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('expense_categories').select('*'),
      ]);

      if (accRes.data) setAccounts(accRes.data);
      if (expRes.data) {
        setExpenses(expRes.data);
        calculateStats(expRes.data);
      }
      if (catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
      } else {
        // Use default categories if database is empty
        console.log('Using default categories - database may be empty');
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error('Error loading expenses data:', error);
      // Use default categories if there's an error
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ExpenseEntry[]) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthExpenses = data.filter(e => e.date.startsWith(currentMonth));
    const thisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate category totals
    const categoryTotals: Record<string, number> = {};
    thisMonthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    setStats({
      thisMonth,
      unpaidBills: 0, // Will be calculated from bills table when implemented
      monthlySubs: 0, // Will be calculated from subscriptions table when implemented
      topCategory
    });
  };

  const handleAddExpense = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const amount = Number(form.amount);
      if (!amount || !form.account_id || !form.category || !form.description) {
        throw new Error('Amount, account, category, and description are required');
      }

      // Check account balance before adding expense
      const selectedAccount = accounts.find(acc => acc.id === form.account_id);
      if (!selectedAccount) {
        throw new Error('Selected account not found');
      }

      if (amount > selectedAccount.balance) {
        throw new Error(
          `Insufficient balance! Available: ₹${selectedAccount.balance.toFixed(2)}, Required: ₹${amount.toFixed(2)}`
        );
      }

      // Insert expense entry
      const { error } = await supabase.from('expenses').insert({
        user_id: user.id,
        account_id: form.account_id,
        amount,
        date: form.date,
        category: form.category,
        subcategory: form.subcategory,
        description: form.description,
        notes: form.notes,
      });

      if (error) throw error;

      // Update account balance (subtract expense)
      await supabase.rpc('update_account_balance', {
        p_account_id: form.account_id,
        p_amount: -amount,
      });

      setShowModal(false);
      setForm({
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        account_id: '',
        category: '',
        subcategory: '',
        description: '',
        notes: '',
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;

    try {
      const expense = expenses.find(e => e.id === id);
      if (!expense) return;

      await supabase.from('expenses').delete().eq('id', id);

      // Reverse balance change (add back the expense amount)
      await supabase.rpc('update_account_balance', {
        p_account_id: expense.account_id,
        p_amount: expense.amount,
      });

      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete expense');
    }
  };


  const getPieChartData = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));

    const categoryTotals: Record<string, number> = {};
    thisMonthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: EXPENSE_COLORS[index % EXPENSE_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const pieChartData = getPieChartData();

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses & Payments</h1>
          <p className="text-sm text-muted-foreground">Spending, bills, subscriptions + AI insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <SummaryCard
          title="This Month"
          value={formatINR(stats.thisMonth)}
          icon={Calendar}
          iconColor="text-red-500"
        />
        <SummaryCard
          title="Unpaid Bills"
          value={formatINR(stats.unpaidBills)}
          icon={Calendar}
          iconColor="text-orange-500"
        />
        <SummaryCard
          title="Monthly Subs"
          value={formatINR(stats.monthlySubs)}
          icon={PieChartIcon}
          iconColor="text-blue-500"
        />
        <SummaryCard
          title="Top Category"
          value={stats.topCategory}
          icon={TrendingDown}
          iconColor="text-purple-500"
        />
      </div>


      {/* Charts and Data */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatINR(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>No expenses this month</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pieChartData.slice(0, 8).map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatINR(category.value)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((category.value / stats.thisMonth) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No expenses yet.</p>
            ) : (
              expenses.slice(0, 10).map(expense => (
                <div key={expense.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.category} • {new Date(expense.date).toLocaleDateString()} •{' '}
                        {accounts.find(a => a.id === expense.account_id)?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-600">{formatINR(expense.amount)}</div>
                      {expense.subcategory && (
                        <div className="text-xs text-muted-foreground">{expense.subcategory}</div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDeleteExpense(expense.id)}
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

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Add Expense</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="1000"
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
                  <Label>Account</Label>
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
                  <Label>Category</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Subcategory (optional)</Label>
                  <Input
                    value={form.subcategory}
                    onChange={e => setForm({ ...form, subcategory: e.target.value })}
                    placeholder="e.g., Groceries, Gas, etc."
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="What was this expense for?"
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
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleAddExpense} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Add Expense'}
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
