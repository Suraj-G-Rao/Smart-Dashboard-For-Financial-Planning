// Simple test for budget calculator
import { calculateBudget } from './engine';
import type { BudgetInputs } from './engine';

// Test case 1: Basic budget calculation
const testInputs: BudgetInputs = {
  salary: 50000,
  cityTier: 'tier-2',
  dependents: 1,
  fixedCommitments: {
    rent: 15000,
    emis: 5000,
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
  emergencyFundTargetMonths: 6,
  investingFloor: 0.10,
  roundingStep: 100,
};

export function runBudgetTest() {
  console.log('🧪 Testing Budget Calculator...');
  
  try {
    const result = calculateBudget(testInputs);
    
    console.log('✅ Budget calculation successful!');
    console.log('📊 Summary:', {
      totalAllocated: result.summary.totalAllocated,
      essentialsPercentage: result.summary.essentialsPercentage.toFixed(1) + '%',
      investingPercentage: result.summary.investingPercentage.toFixed(1) + '%',
      lifestylePercentage: result.summary.lifestylePercentage.toFixed(1) + '%',
      monthsToEfTarget: result.summary.monthsToEfTarget,
    });
    
    console.log('🏷️ Badges:', result.badges);
    console.log('💡 Notes:', result.notes);
    
    // Verify total allocation equals salary
    const totalCheck = Math.abs(result.summary.totalAllocated - testInputs.salary) < 1;
    console.log(totalCheck ? '✅ Total allocation matches salary' : '❌ Total allocation mismatch');
    
    // Verify investing floor
    const investingAmount = result.allocations.find(a => a.id === 'investing')?.amount || 0;
    const investingPercentage = (investingAmount / testInputs.salary) * 100;
    const floorCheck = investingPercentage >= (testInputs.investingFloor * 100);
    console.log(floorCheck ? '✅ Investing floor maintained' : '❌ Investing below floor');
    
    return result;
  } catch (error) {
    console.error('❌ Budget calculation failed:', error);
    return null;
  }
}

// Test case 2: High-interest debt scenario
export function testHighInterestDebt() {
  console.log('\n🧪 Testing High-Interest Debt Scenario...');
  
  const debtInputs: BudgetInputs = {
    ...testInputs,
    hasHighInterestDebt: true,
    debtApr: 18,
    goalPriorities: {
      emergencyFund: 20,
      debtPrepayment: 40,
      investing: 25,
      lifestyle: 15,
    },
  };
  
  try {
    const result = calculateBudget(debtInputs);
    
    const debtPrepayment = result.allocations.find(a => a.id === 'debtPrepayment')?.amount || 0;
    const investing = result.allocations.find(a => a.id === 'investing');
    
    console.log('💳 Debt prepayment allocation:', debtPrepayment);
    console.log('📈 Investing at floor:', investing?.isAtFloor ? 'Yes' : 'No');
    console.log('🏷️ Badges:', result.badges);
    
    return result;
  } catch (error) {
    console.error('❌ High-interest debt test failed:', error);
    return null;
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runBudgetTest();
  testHighInterestDebt();
}
