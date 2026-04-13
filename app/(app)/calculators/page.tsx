'use client';

import { useState, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, CreditCard, TrendingUp, PiggyBank, Loader2 } from 'lucide-react';

// Dynamic imports for better performance
const EMICalculator = lazy(() => import('./emi/EMICalculator'));
const SIPCalculator = lazy(() => import('./sip/SIPCalculator'));
const TaxCalculator = lazy(() => import('./tax/TaxCalculator'));
const PPFCalculator = lazy(() => import('./ppf/PPFCalculator'));

// Loading component
const CalculatorLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState('emi');

  const tabs = [
    {
      id: 'emi',
      label: 'EMI',
      icon: Calculator,
      component: EMICalculator,
    },
    {
      id: 'sip',
      label: 'SIP',
      icon: TrendingUp,
      component: SIPCalculator,
    },
    {
      id: 'tax',
      label: 'Tax',
      icon: CreditCard,
      component: TaxCalculator,
    },
    {
      id: 'ppf',
      label: 'PPF',
      icon: PiggyBank,
      component: PPFCalculator,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Calculator className="h-10 w-10 text-blue-600" />
          Financial Calculators
        </h1>
        <p className="text-gray-600">
          Comprehensive tools to help you plan your finances and make informed decisions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-4 py-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <Suspense fallback={<CalculatorLoader />}>
              <tab.component />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
