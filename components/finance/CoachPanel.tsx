'use client';

import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoachPanelProps {
  headline: string;
  tips: Array<{
    title: string;
    action: string;
    impactINR: number;
  }>;
  riskFlags?: string[];
  className?: string;
}

export function CoachPanel({ headline, tips, riskFlags, className }: CoachPanelProps) {
  return (
    <div className={cn('rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 shadow-sm', className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-blue-500 p-2">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold">AI Coach</h3>
      </div>

      <p className="mb-6 text-sm font-medium text-muted-foreground">{headline}</p>

      <div className="space-y-4">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="rounded-xl border bg-white dark:bg-gray-900 p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900 p-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{tip.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{tip.action}</p>
                <p className="mt-2 text-xs font-bold text-green-600">
                  Save ₹{tip.impactINR.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {riskFlags && riskFlags.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground">Risk Alerts</h4>
          {riskFlags.map((flag, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-xs"
            >
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
