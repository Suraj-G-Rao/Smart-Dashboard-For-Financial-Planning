'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function SummaryCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-500',
  trend = 'neutral',
  className,
}: SummaryCardProps) {
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-2xl font-bold">{value}</h3>
          {change !== undefined && (
            <p className={cn('mt-1 text-xs font-medium', trendColor)}>
              {change > 0 ? '+' : ''}
              {change}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('rounded-xl bg-muted p-3', iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
