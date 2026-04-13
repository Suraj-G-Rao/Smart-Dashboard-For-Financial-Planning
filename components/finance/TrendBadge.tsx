'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendBadgeProps {
  value: number;
  label?: string;
  className?: string;
}

export function TrendBadge({ value, label, className }: TrendBadgeProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const color = isNeutral
    ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    : isPositive
    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', color, className)}>
      <Icon className="h-3 w-3" />
      <span>
        {isPositive && '+'}
        {value.toFixed(1)}%
      </span>
      {label && <span className="ml-1 opacity-70">{label}</span>}
    </div>
  );
}
