'use client';

import { cn } from '@/lib/utils';

interface HeatmapProps {
  data: Array<{ date: string; amount: number }>;
  className?: string;
}

export function Heatmap({ data, className }: HeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('rounded-xl border bg-card p-6', className)}>
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  const getColor = (amount: number) => {
    const intensity = amount / maxAmount;
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 0.2) return 'bg-green-100 dark:bg-green-900';
    if (intensity < 0.4) return 'bg-green-300 dark:bg-green-700';
    if (intensity < 0.6) return 'bg-yellow-300 dark:bg-yellow-700';
    if (intensity < 0.8) return 'bg-orange-400 dark:bg-orange-600';
    return 'bg-red-500 dark:bg-red-600';
  };

  // Group by week
  const weeks: Array<Array<{ date: string; amount: number }>> = [];
  let currentWeek: Array<{ date: string; amount: number }> = [];

  data.forEach((item, idx) => {
    const date = new Date(item.date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(item);
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      <h3 className="mb-4 text-sm font-semibold">Spending Heatmap</h3>
      <div className="flex gap-1 overflow-x-auto">
        {weeks.slice(0, 12).map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={cn('h-3 w-3 rounded-sm', getColor(day.amount))}
                title={`${day.date}: ₹${day.amount.toLocaleString('en-IN')}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="h-3 w-3 rounded-sm bg-green-100 dark:bg-green-900" />
          <div className="h-3 w-3 rounded-sm bg-yellow-300 dark:bg-yellow-700" />
          <div className="h-3 w-3 rounded-sm bg-orange-400 dark:bg-orange-600" />
          <div className="h-3 w-3 rounded-sm bg-red-500 dark:bg-red-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
