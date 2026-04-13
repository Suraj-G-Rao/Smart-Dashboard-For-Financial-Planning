'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Landmark, TrendingUp, TrendingDown, Edit, Trash2, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createSupabaseClient } from '@/lib/supabase/client';
import { formatINR } from '@/lib/format';

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const ACCOUNT_TYPES = [
    { label: 'Savings', value: 'savings' },
    { label: 'Current', value: 'current' },
    { label: 'Salary', value: 'salary' },
    { label: 'Fixed Deposit', value: 'fixed_deposit' },
    { label: 'Card', value: 'card' },
  ];
  const [newAccount, setNewAccount] = useState<{ name: string; type: string; balance: string }>({ name: '', type: 'savings', balance: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAccount, setEditAccount] = useState<{ id: string | null; balance: number }>({ id: null, balance: 0 });
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [accountsRes, emergencyRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('emergency_fund').select('*').eq('user_id', user.id).single(),
      ]);

      if (accountsRes.error) {
        console.error('Fetch accounts error:', accountsRes.error);
        return;
      }
      console.log('Fetched accounts count:', accountsRes.data?.length ?? 0);
      setAccounts(accountsRes.data || []);

      if (emergencyRes.data) {
        setEmergencyFund(emergencyRes.data);
        console.log('Emergency fund balance:', emergencyRes.data.current_balance);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found while adding account');
        return;
      }

      const payload = {
        name: newAccount.name.trim(),
        type: newAccount.type, // lower_snake_case values to satisfy CHECK constraint
        balance: Number(newAccount.balance || 0) || 0,
      };

      const { data, error } = await supabase
        .from('accounts')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        console.error('Insert account error:', error);
        alert(`Failed to add account: ${error.message}`);
        return;
      }

      // If RLS prevents returning row, fallback to refetch
      if (data) {
        console.log('Inserted account:', data);
        setAccounts((prev) => [data, ...prev]);
      } else {
        await fetchAccounts();
      }
      setNewAccount({ name: '', type: 'savings', balance: '' });
      setShowAddModal(false);
      setLoading(false);
      alert('Account added successfully');
    } catch (error: any) {
      console.error('Failed to add account:', error);
      alert(`Failed to add account`);
    }
  };

  const openEdit = (account: any) => {
    setEditAccount({ id: account.id, balance: Number(account.balance) || 0 });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editAccount.id) return;
    try {
      await supabase
        .from('accounts')
        .update({ balance: editAccount.balance })
        .eq('id', editAccount.id);
      setShowEditModal(false);
      setEditAccount({ id: null, balance: 0 });
      fetchAccounts();
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Delete this account? This action cannot be undone.')) return;

    await supabase.from('accounts').delete().eq('id', id);
    fetchAccounts();
  };

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
    [accounts]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 px-4 py-6 md:px-8 md:py-8">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bank Accounts
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage your accounts and track your balances
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        {/* Enhanced Total Balance Card */}
        <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white shadow-2xl border-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

          <CardContent className="relative z-10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-white/80 font-medium uppercase tracking-wide">Total Balance</p>
            </div>

            <p className="text-4xl md:text-5xl font-bold mb-6">{formatINR(totalBalance)}</p>

            <div className="grid md:grid-cols-3 gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-orange-300" />
                  <span className="text-xs text-white/70">Emergency Fund</span>
                </div>
                <p className="text-lg font-bold">{formatINR(emergencyFund?.current_balance || 0)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-emerald-300" />
                  <span className="text-xs text-white/70">Available to Spend</span>
                </div>
                <p className="text-lg font-bold text-emerald-200">{formatINR(totalBalance - (emergencyFund?.current_balance || 0))}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Landmark className="h-4 w-4 text-blue-300" />
                  <span className="text-xs text-white/70">Total Accounts</span>
                </div>
                <p className="text-lg font-bold">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Accounts Grid */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const accountType = ACCOUNT_TYPES.find(t => t.value === account.type);
            const isEmergencyAccount = emergencyFund && emergencyFund.account_id === account.id;
            const lockedAmount = isEmergencyAccount ? emergencyFund.current_balance : 0;
            const availableBalance = Number(account.balance) - lockedAmount;

            return (
              <Card
                key={account.id}
                className="group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  {/* Header with Icon and Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
                        <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{account.name}</h3>
                        <p className="text-xs text-muted-foreground">{accountType?.label || account.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(account)}
                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => deleteAccount(account.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="mb-4">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatINR(Number(account.balance))}
                    </p>
                  </div>

                  {/* Emergency Fund Alert */}
                  {isEmergencyAccount && lockedAmount > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Emergency Fund</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-orange-600/80 dark:text-orange-400/80">Locked:</span>
                          <span className="font-semibold text-orange-700 dark:text-orange-300">{formatINR(lockedAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-600/80 dark:text-emerald-400/80">Available:</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{formatINR(availableBalance)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(account)}
                    className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit Balance
                  </Button>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {new Date(account.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {accounts.length === 0 && !showAddModal && (
          <Card className="p-12 text-center rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
            <Landmark className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No accounts yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your first bank account to start tracking transactions
            </p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </Card>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Add New Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Name</label>
                  <input
                    type="text"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full rounded-lg border bg-background px-4 py-2"
                    placeholder="e.g., HDFC Savings"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account Type</label>
                  <select
                    value={newAccount.type}
                    onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                    className="w-full rounded-lg border bg-background px-4 py-2"
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Initial Balance (₹)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                    className="w-full rounded-lg border bg-background px-4 py-2"
                    placeholder=""
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={addAccount} className="flex-1">Add Account</Button>
                  <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Balance Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Edit Balance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Balance (₹)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editAccount.balance}
                    onChange={(e) => setEditAccount({ ...editAccount, balance: Number(e.target.value || 0) })}
                    className="w-full rounded-lg border bg-background px-4 py-2"
                    placeholder=""
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={saveEdit} className="flex-1">Save</Button>
                  <Button onClick={() => { setShowEditModal(false); setEditAccount({ id: null, balance: 0 }); }} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
