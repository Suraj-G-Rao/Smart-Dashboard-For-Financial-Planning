'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { formatINR } from '@/lib/format';

interface Subscription {
  id: string;
  service: string;
  amount: number;
  cycle: string;
  next_renew: string;
  category: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_renew', { ascending: true });

      if (!error && data) {
        setSubscriptions(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    const amount = Number(sub.amount);
    return sum + (sub.cycle === 'monthly' ? amount : amount / 12);
  }, 0);

  const yearlyTotal = subscriptions.reduce((sum, sub) => {
    const amount = Number(sub.amount);
    return sum + (sub.cycle === 'yearly' ? amount : amount * 12);
  }, 0);

  const formatCurrency = (amount: number) => {
    return formatINR(amount);
  };

  const getNextRenewalStatus = (nextRenew: string) => {
    const days = Math.ceil(
      (new Date(nextRenew).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (days <= 7) return { text: `In ${days} days`, color: 'text-orange-600' };
    return { text: formatDistanceToNow(new Date(nextRenew)), color: 'text-muted-foreground' };
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
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Track and manage your subscriptions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          title="Active Subscriptions"
          value={subscriptions.length}
          icon={Calendar}
          iconColor="text-blue-500"
        />
        <SummaryCard
          title="Monthly Total"
          value={formatCurrency(monthlyTotal)}
          icon={DollarSign}
          iconColor="text-green-500"
        />
        <SummaryCard
          title="Yearly Total"
          value={formatCurrency(yearlyTotal)}
          icon={DollarSign}
          iconColor="text-purple-500"
        />
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No subscriptions yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start tracking your recurring payments
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const renewal = getNextRenewalStatus(sub.next_renew);
            return (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                    {sub.service.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{sub.service}</h3>
                    <p className="text-sm text-muted-foreground">{sub.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">
                      {formatCurrency(Number(sub.amount))}/{sub.cycle === 'monthly' ? 'mo' : 'yr'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Next Renewal</p>
                    <p className={`font-medium ${renewal.color}`}>
                      {new Date(sub.next_renew).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{renewal.text}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
