'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import BudgetInputs from '@/components/budget/BudgetInputs';
import BudgetResults from '@/components/budget/BudgetResults';
import PresetPicker from '@/components/budget/PresetPicker';
import { calculateBudget, type BudgetInputs as BudgetInputsType, type BudgetResult } from '@/lib/budget/engine';
import { EF_TARGET_MONTHS_DEFAULT, INVESTING_FLOOR_DEFAULT } from '@/lib/budget/constants';

export default function BudgetCalculator() {
  const [inputs, setInputs] = useState<BudgetInputsType>({
    salary: 50000,
    cityTier: 'tier-2',
    dependents: 0,
    fixedCommitments: {
      rent: 15000,
      emis: 0,
      insurance: 2000,
      subscriptions: 500,
    },
    hasHighInterestDebt: false,
    goalPriorities: {
      emergencyFund: 25,
      debtPrepayment: 15,
      investing: 35,
      lifestyle: 25,
    },
    emergencyFundTargetMonths: EF_TARGET_MONTHS_DEFAULT,
    investingFloor: INVESTING_FLOOR_DEFAULT,
    roundingStep: 100,
  });

  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const budgetResult = calculateBudget(inputs);
      
      // Get AI insights
      try {
        const response = await fetch('/api/budget/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: budgetResult.summary,
            allocations: budgetResult.allocations,
            badges: budgetResult.badges,
          }),
        });
        
        if (response.ok) {
          const { insights } = await response.json();
          budgetResult.notes = [...budgetResult.notes, ...insights];
        }
      } catch (aiError) {
        console.warn('AI insights unavailable:', aiError);
      }
      
      setResult(budgetResult);
    } catch (error) {
      console.error('Budget calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!result) return;
    
    try {
      const response = await fetch('/api/budget/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, format }),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleSavePreset = async () => {
    if (!result) return;
    
    const presetName = prompt('Enter a name for this preset:');
    if (!presetName) return;
    
    try {
      const response = await fetch('/api/budget/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: presetName, inputs }),
      });
      
      if (response.ok) {
        alert('Preset saved successfully!');
      }
    } catch (error) {
      console.error('Save preset error:', error);
    }
  };

  const handleCopyResults = () => {
    if (!result) return;
    
    const text = `Budget Allocation Summary\n\n` +
      `Total Allocated: ₹${result.summary.totalAllocated.toLocaleString('en-IN')}\n` +
      `Essentials: ${result.summary.essentialsPercentage.toFixed(1)}%\n` +
      `Investing: ${result.summary.investingPercentage.toFixed(1)}%\n` +
      `Lifestyle: ${result.summary.lifestylePercentage.toFixed(1)}%\n\n` +
      `Category Breakdown:\n` +
      result.allocations
        .filter(a => a.amount > 0)
        .map(a => `${a.name}: ₹${a.amount.toLocaleString('en-IN')} (${a.percentage.toFixed(1)}%)`)
        .join('\n');
    
    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Wallet className="h-8 w-8 text-blue-600" />
          Smart Budget Calculator
        </h2>
        <p className="text-gray-600">
          Get an optimized budget allocation based on your income, expenses, and financial goals
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <PresetPicker
            currentInputs={inputs}
            onLoadPreset={setInputs}
          />
          <BudgetInputs
            inputs={inputs}
            onInputsChange={setInputs}
            onCalculate={handleCalculate}
            loading={loading}
          />
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-80 bg-gray-200 rounded"></div>
                <div className="h-80 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : result ? (
            <BudgetResults
              result={result}
              onExport={handleExport}
              onSavePreset={handleSavePreset}
              onCopyResults={handleCopyResults}
              loading={loading}
            />
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <div className="text-center">
                <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to optimize your budget?
                </h3>
                <p className="text-gray-500 mb-4">
                  Enter your financial details and click "Calculate Budget" to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
