'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { supabase } from '@/lib/supabase/client';
import { formatINR } from '@/lib/format';

interface Bill {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  is_paid: boolean;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (!error && data) {
        setBills(data);
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePaid = async (billId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('bills')
      .update({ is_paid: !currentStatus })
      .eq('id', billId);

    if (!error) {
      fetchBills();
    }
  };

  const formatCurrency = (amount: number) => {
    return formatINR(amount);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil(
      (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'text-red-600' };
    if (days === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (days <= 7) return { text: `Due in ${days} days`, color: 'text-yellow-600' };
    return { text: `Due in ${days} days`, color: 'text-muted-foreground' };
  };

  const totalBills = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const unpaidBills = bills.filter((b) => !b.is_paid);
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const paidCount = bills.filter((b) => b.is_paid).length;

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
          <h1 className="text-3xl font-bold">Bills & Payments</h1>
          <p className="text-sm text-muted-foreground">Track upcoming payments and due dates</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <SummaryCard
          title="Total Bills"
          value={bills.length}
          icon={Calendar}
          iconColor="text-blue-500"
        />
        <SummaryCard
          title="Monthly Total"
          value={formatCurrency(totalBills)}
          icon={DollarSign}
          iconColor="text-purple-500"
        />
        <SummaryCard
          title="Unpaid"
          value={formatCurrency(totalUnpaid)}
          icon={XCircle}
          iconColor="text-red-500"
        />
        <SummaryCard
          title="Paid This Month"
          value={paidCount}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No bills yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Start tracking your recurring bills</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unpaid Bills */}
          {unpaidBills.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                Unpaid Bills ({unpaidBills.length})
              </h2>
              <div className="space-y-3">
                {unpaidBills.map((bill) => {
                  const dueStatus = getDaysUntilDue(bill.due_date);
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-lg font-bold text-white">
                          {bill.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{bill.name}</h3>
                          <p className="text-sm text-muted-foreground">{bill.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-xl font-bold">{formatCurrency(Number(bill.amount))}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium">
                            {new Date(bill.due_date).toLocaleDateString()}
                          </p>
                          <p className={`text-xs font-medium ${dueStatus.color}`}>
                            {dueStatus.text}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => togglePaid(bill.id, bill.is_paid)}
                        >
                          Mark Paid
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paid Bills */}
          {paidCount > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                Paid Bills ({paidCount})
              </h2>
              <div className="space-y-3">
                {bills
                  .filter((b) => b.is_paid)
                  .map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between rounded-2xl border bg-card p-6 opacity-60 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-lg font-bold text-white">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{bill.name}</h3>
                          <p className="text-sm text-muted-foreground">{bill.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(Number(bill.amount))}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePaid(bill.id, bill.is_paid)}
                        >
                          Undo
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
