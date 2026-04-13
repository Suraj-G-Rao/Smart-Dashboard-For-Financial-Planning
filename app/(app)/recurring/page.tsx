'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { supabase } from '@/lib/supabase/client';
import { formatINR } from '@/lib/format';

export default function RecurringPage() {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [billsData, subsData] = await Promise.all([
        supabase.from('bills').select('*').eq('user_id', user.id).order('due_date'),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).order('next_renew'),
      ]);

      setBills(billsData.data || []);
      setSubscriptions(subsData.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBillPaid = async (id: string, currentStatus: boolean) => {
    await supabase.from('bills').update({ is_paid: !currentStatus }).eq('id', id);
    fetchData();
  };

  const totalBills = bills.reduce((sum, b) => sum + (b.is_paid ? 0 : Number(b.amount)), 0);
  const totalSubs = subscriptions.reduce((sum, s) => sum + (s.cycle === 'monthly' ? Number(s.amount) : Number(s.amount) / 12), 0);

  const allItems = [
    ...bills.map(b => ({ ...b, type: 'bill', date: b.due_date })),
    ...subscriptions.map(s => ({ ...s, type: 'subscription', date: s.next_renew }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>;
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Recurring Payments</h1><p className="text-sm text-muted-foreground">Bills & subscriptions in one place</p></div>
        <Button><Plus className="mr-2 h-4 w-4" />Add Payment</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard title="Unpaid Bills" value={formatINR(totalBills)} icon={XCircle} iconColor="text-red-500" />
        <SummaryCard title="Monthly Subscriptions" value={formatINR(totalSubs)} icon={Calendar} iconColor="text-blue-500" />
        <SummaryCard title="Total Items" value={bills.length + subscriptions.length} icon={DollarSign} iconColor="text-purple-500" />
      </div>

      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bills">Bills ({bills.length})</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions ({subscriptions.length})</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-3 mt-6">
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bill.is_paid ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  {bill.is_paid ? <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" /> : <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />}
                </div>
                <div><h3 className="font-semibold">{bill.name}</h3><p className="text-sm text-muted-foreground">Due: {new Date(bill.due_date).toLocaleDateString()}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-bold">{formatINR(Number(bill.amount))}</p>
                <Button size="sm" onClick={() => toggleBillPaid(bill.id, bill.is_paid)}>{bill.is_paid ? 'Undo' : 'Mark Paid'}</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-3 mt-6">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-lg">{sub.service.substring(0, 1)}</div>
                <div><h3 className="font-semibold">{sub.service}</h3><p className="text-sm text-muted-foreground">Next: {new Date(sub.next_renew).toLocaleDateString()} • {sub.cycle}</p></div>
              </div>
              <p className="text-xl font-bold">{formatINR(Number(sub.amount))}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="space-y-2">
            {allItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.type === 'bill' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  <div><p className="font-medium">{item.name || item.service}</p><p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p></div>
                </div>
                <p className="font-bold">{formatINR(Number(item.amount))}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-500"></div><span className="text-sm">Bills</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500"></div><span className="text-sm">Subscriptions</span></div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
