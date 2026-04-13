'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calculator, Wallet, Users, Home, CreditCard } from 'lucide-react';
import { CITY_TIERS, ROUNDING_OPTIONS, SCENARIO_PRESETS, type CityTier } from '@/lib/budget/constants';
import { formatINR } from '@/lib/utils';
import type { BudgetInputs } from '@/lib/budget/engine';

interface BudgetInputsProps {
  inputs: BudgetInputs;
  onInputsChange: (inputs: BudgetInputs) => void;
  onCalculate: () => void;
  loading: boolean;
}

export default function BudgetInputsComponent({ inputs, onInputsChange, onCalculate, loading }: BudgetInputsProps) {
  const [activeScenario, setActiveScenario] = useState<keyof typeof SCENARIO_PRESETS | null>(null);

  const updateInputs = (updates: Partial<BudgetInputs>) => {
    onInputsChange({ ...inputs, ...updates });
  };

  const updateFixedCommitments = (field: keyof BudgetInputs['fixedCommitments'], value: number) => {
    updateInputs({
      fixedCommitments: {
        ...inputs.fixedCommitments,
        [field]: value,
      },
    });
  };

  const updateGoalPriorities = (field: keyof BudgetInputs['goalPriorities'], value: number) => {
    updateInputs({
      goalPriorities: {
        ...inputs.goalPriorities,
        [field]: value,
      },
    });
  };

  const applyScenario = (scenario: keyof typeof SCENARIO_PRESETS) => {
    setActiveScenario(scenario);
    updateInputs({
      goalPriorities: SCENARIO_PRESETS[scenario],
    });
  };

  const totalPriorities = Object.values(inputs.goalPriorities).reduce((sum, val) => sum + val, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          Smart Budget Calculator
        </CardTitle>
        <CardDescription>
          Enter your financial details to get an optimized budget allocation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Monthly In-hand Salary (₹)
            </Label>
            <Input
              id="salary"
              type="number"
              value={inputs.salary}
              onChange={(e) => updateInputs({ salary: Number(e.target.value) })}
              placeholder="50000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cityTier">City Tier</Label>
            <Select 
              value={inputs.cityTier} 
              onValueChange={(value: string) => updateInputs({ cityTier: value as CityTier })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CITY_TIERS).map(([key, tier]) => (
                  <SelectItem key={key} value={key}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Context Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dependents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Number of Dependents
            </Label>
            <Select 
              value={inputs.dependents.toString()} 
              onValueChange={(value: string) => updateInputs({ dependents: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 0 ? '(None)' : num === 1 ? 'dependent' : 'dependents'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roundingStep">Round amounts to nearest</Label>
            <Select 
              value={inputs.roundingStep.toString()} 
              onValueChange={(value: string) => updateInputs({ roundingStep: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROUNDING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fixed Commitments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Home className="h-5 w-5" />
            Existing Fixed Commitments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rent">Monthly Rent (₹)</Label>
              <Input
                id="rent"
                type="number"
                value={inputs.fixedCommitments.rent}
                onChange={(e) => updateFixedCommitments('rent', Number(e.target.value))}
                placeholder="15000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emis">Total EMIs (₹)</Label>
              <Input
                id="emis"
                type="number"
                value={inputs.fixedCommitments.emis}
                onChange={(e) => updateFixedCommitments('emis', Number(e.target.value))}
                placeholder="8000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurance">Insurance Premiums (₹)</Label>
              <Input
                id="insurance"
                type="number"
                value={inputs.fixedCommitments.insurance}
                onChange={(e) => updateFixedCommitments('insurance', Number(e.target.value))}
                placeholder="2000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscriptions">Subscriptions (₹)</Label>
              <Input
                id="subscriptions"
                type="number"
                value={inputs.fixedCommitments.subscriptions}
                onChange={(e) => updateFixedCommitments('subscriptions', Number(e.target.value))}
                placeholder="500"
              />
            </div>
          </div>
        </div>

        {/* High Interest Debt */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            High-Interest Debt
          </h3>
          <div className="flex items-center space-x-2">
            <Switch
              id="hasHighInterestDebt"
              checked={inputs.hasHighInterestDebt}
              onCheckedChange={(checked: boolean) => updateInputs({ hasHighInterestDebt: checked })}
            />
            <Label htmlFor="hasHighInterestDebt">I have high-interest debt</Label>
          </div>
          
          {inputs.hasHighInterestDebt && (
            <div className="space-y-2">
              <Label htmlFor="debtApr">Debt APR (%)</Label>
              <Input
                id="debtApr"
                type="number"
                step="0.1"
                value={inputs.debtApr || ''}
                onChange={(e) => updateInputs({ debtApr: Number(e.target.value) })}
                placeholder="18.0"
              />
            </div>
          )}
        </div>

        {/* Goal Priority Sliders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Goal Priorities</h3>
            <div className="text-sm text-gray-600">
              Total: {totalPriorities}%
            </div>
          </div>
          
          {/* Scenario Presets */}
          <div className="flex gap-2 mb-4">
            {Object.entries(SCENARIO_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={activeScenario === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyScenario(key as keyof typeof SCENARIO_PRESETS)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(inputs.goalPriorities).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={key}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Badge variant="outline">{value}%</Badge>
                </div>
                <Slider
                  id={key}
                  min={0}
                  max={100}
                  step={5}
                  value={[value]}
                  onValueChange={([newValue]: number[]) => 
                    updateGoalPriorities(key as keyof BudgetInputs['goalPriorities'], newValue)
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="efTargetMonths">Emergency Fund Target (months)</Label>
            <Select 
              value={inputs.emergencyFundTargetMonths.toString()} 
              onValueChange={(value: string) => updateInputs({ emergencyFundTargetMonths: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((months) => (
                  <SelectItem key={months} value={months.toString()}>
                    {months} months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="investingFloor">Minimum Investing Floor (%)</Label>
            <Input
              id="investingFloor"
              type="number"
              min="5"
              max="30"
              step="1"
              value={inputs.investingFloor * 100}
              onChange={(e) => updateInputs({ investingFloor: Number(e.target.value) / 100 })}
            />
          </div>
        </div>

        {/* Calculate Button */}
        <Button 
          onClick={onCalculate} 
          className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] transition-transform" 
          size="lg"
          disabled={loading || !inputs.salary}
        >
          <Calculator className="h-5 w-5 mr-2" />
          {loading ? 'Calculating Budget...' : 'Calculate Budget'}
        </Button>
      </CardContent>
    </Card>
  );
}
