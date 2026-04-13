import {
  SALARY_BANDS,
  CITY_TIERS,
  CATEGORY_CAPS,
  DEFAULT_CATEGORIES,
  HIGH_INTEREST_THRESHOLD,
  DTI_WARNING_THRESHOLD,
  INVESTING_FLOOR_DEFAULT,
  type CityTier,
} from './constants';

export interface BudgetInputs {
  salary: number;
  cityTier: CityTier;
  dependents: number;
  fixedCommitments: {
    rent: number;
    emis: number;
    insurance: number;
    subscriptions: number;
  };
  hasHighInterestDebt: boolean;
  debtApr?: number;
  goalPriorities: {
    emergencyFund: number; // 0-100
    debtPrepayment: number; // 0-100
    investing: number; // 0-100
    lifestyle: number; // 0-100
  };
  emergencyFundTargetMonths: number;
  investingFloor: number; // percentage
  roundingStep: number;
}

export interface CategoryAllocation {
  id: string;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  type: 'essential' | 'lifestyle' | 'goal' | 'fixed';
  isOverCap?: boolean;
  isAtFloor?: boolean;
}

export interface BudgetSummary {
  totalAllocated: number;
  essentialsPercentage: number;
  investingPercentage: number;
  lifestylePercentage: number;
  monthsToEfTarget: number;
  debtFreeEta?: number; // months
  dtiRatio: number;
}

export interface BudgetResult {
  allocations: CategoryAllocation[];
  summary: BudgetSummary;
  badges: string[];
  notes: string[];
}

export function calculateBudget(inputs: BudgetInputs): BudgetResult {
  const {
    salary,
    cityTier,
    dependents,
    fixedCommitments,
    hasHighInterestDebt,
    debtApr,
    goalPriorities,
    emergencyFundTargetMonths,
    investingFloor,
    roundingStep,
  } = inputs;

  // Get salary band
  const salaryBand = SALARY_BANDS.find(band => salary >= band.min && salary < band.max)!;
  
  // Initialize allocations with default categories
  const allocations: CategoryAllocation[] = DEFAULT_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    amount: 0,
    percentage: 0,
    type: cat.type,
  }));

  // Set fixed commitments
  setAllocation(allocations, 'housing', fixedCommitments.rent);
  setAllocation(allocations, 'debtEmi', fixedCommitments.emis);
  setAllocation(allocations, 'insurance', fixedCommitments.insurance);
  setAllocation(allocations, 'subscriptions', fixedCommitments.subscriptions);

  // Calculate DTI ratio
  const dtiRatio = fixedCommitments.emis / salary;
  
  // Apply constraints and caps
  applyHousingCap(allocations, salary, cityTier);
  applyBasicConstraints(allocations, salary, salaryBand, dependents);
  
  // Calculate remaining budget after fixed commitments
  const fixedTotal = fixedCommitments.rent + fixedCommitments.emis + 
                    fixedCommitments.insurance + fixedCommitments.subscriptions;
  const remainingBudget = salary - fixedTotal;

  // Apply debt strategy
  if (hasHighInterestDebt && debtApr && debtApr >= HIGH_INTEREST_THRESHOLD) {
    applyHighInterestDebtStrategy(allocations, remainingBudget, goalPriorities, investingFloor);
  }

  // Apply emergency fund strategy
  applyEmergencyFundStrategy(allocations, salary, emergencyFundTargetMonths, goalPriorities);

  // Allocate remaining budget using priority-based water-filling
  allocateRemainingBudget(allocations, salary, goalPriorities, investingFloor, salaryBand);

  // Apply rounding
  applyRounding(allocations, roundingStep, salary);

  // Calculate summary and badges
  const summary = calculateSummary(allocations, salary, emergencyFundTargetMonths, fixedCommitments.emis);
  const badges = generateBadges(allocations, summary, cityTier, dtiRatio);
  const notes = generateNotes(allocations, summary, inputs);

  return {
    allocations,
    summary,
    badges,
    notes,
  };
}

function setAllocation(allocations: CategoryAllocation[], categoryId: string, amount: number) {
  const category = allocations.find(a => a.id === categoryId);
  if (category) {
    category.amount = amount;
  }
}

function getAllocation(allocations: CategoryAllocation[], categoryId: string): number {
  return allocations.find(a => a.id === categoryId)?.amount || 0;
}

function applyHousingCap(allocations: CategoryAllocation[], salary: number, cityTier: CityTier) {
  const housingCap = CITY_TIERS[cityTier].housingCap * salary;
  const housing = allocations.find(a => a.id === 'housing');
  
  if (housing && housing.amount > housingCap) {
    housing.isOverCap = true;
  }
}

function applyBasicConstraints(
  allocations: CategoryAllocation[], 
  salary: number, 
  salaryBand: typeof SALARY_BANDS[0],
  dependents: number
) {
  // Utilities
  const utilitiesMin = CATEGORY_CAPS.utilities.min * salary;
  const utilitiesMax = CATEGORY_CAPS.utilities.max * salary;
  setAllocation(allocations, 'utilities', Math.max(utilitiesMin, Math.min(utilitiesMax, utilitiesMin * (1 + dependents * 0.2))));

  // Phone & Internet
  const phoneMin = CATEGORY_CAPS.phoneInternet.min * salary;
  const phoneMax = CATEGORY_CAPS.phoneInternet.max * salary;
  setAllocation(allocations, 'phoneInternet', Math.min(phoneMax, phoneMin * (1 + dependents * 0.1)));

  // Transport
  const transportMin = CATEGORY_CAPS.transport.min * salary;
  const transportMax = CATEGORY_CAPS.transport.max * salary;
  setAllocation(allocations, 'transport', Math.min(transportMax, transportMin * (1 + dependents * 0.15)));

  // Groceries
  const groceriesMin = CATEGORY_CAPS.groceries.min * salary;
  const groceriesMax = CATEGORY_CAPS.groceries.max * salary;
  setAllocation(allocations, 'groceries', Math.min(groceriesMax, groceriesMin * (1 + dependents * 0.3)));

  // Healthcare (scales with dependents)
  const healthcareBase = salary * 0.03;
  setAllocation(allocations, 'healthcare', healthcareBase * (1 + dependents * 0.5));

  // Education (if dependents)
  if (dependents > 0) {
    setAllocation(allocations, 'education', salary * 0.05 * dependents);
  }

  // Childcare (if dependents)
  if (dependents > 0) {
    setAllocation(allocations, 'childcare', salary * 0.08 * Math.min(dependents, 2));
  }
}

function applyHighInterestDebtStrategy(
  allocations: CategoryAllocation[],
  remainingBudget: number,
  goalPriorities: BudgetInputs['goalPriorities'],
  investingFloor: number
) {
  // Allocate aggressive debt prepayment
  const debtPrepaymentTarget = remainingBudget * (goalPriorities.debtPrepayment / 100) * 0.4; // 40% of priority weight
  setAllocation(allocations, 'debtPrepayment', Math.max(remainingBudget * 0.05, debtPrepaymentTarget));
  
  // Reduce investing to floor
  const investingAmount = Math.max(remainingBudget * investingFloor, remainingBudget * 0.05);
  setAllocation(allocations, 'investing', investingAmount);
  
  const investing = allocations.find(a => a.id === 'investing');
  if (investing) {
    investing.isAtFloor = true;
  }
}

function applyEmergencyFundStrategy(
  allocations: CategoryAllocation[],
  salary: number,
  targetMonths: number,
  goalPriorities: BudgetInputs['goalPriorities']
) {
  // Calculate essentials for EF target
  const essentials = allocations
    .filter(a => a.type === 'essential')
    .reduce((sum, a) => sum + a.amount, 0);
  
  const efTarget = essentials * targetMonths;
  const efPriority = goalPriorities.emergencyFund / 100;
  
  // Monthly EF contribution (5-15% based on priority)
  const efContribution = salary * (0.05 + (efPriority * 0.10));
  setAllocation(allocations, 'emergencyFund', efContribution);
}

function allocateRemainingBudget(
  allocations: CategoryAllocation[],
  salary: number,
  goalPriorities: BudgetInputs['goalPriorities'],
  investingFloor: number,
  salaryBand: typeof SALARY_BANDS[0]
) {
  const allocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  let remaining = salary - allocated;

  // Normalize priorities
  const totalPriority = Object.values(goalPriorities).reduce((sum, p) => sum + p, 0);
  const normalizedPriorities = {
    emergencyFund: goalPriorities.emergencyFund / totalPriority,
    debtPrepayment: goalPriorities.debtPrepayment / totalPriority,
    investing: goalPriorities.investing / totalPriority,
    lifestyle: goalPriorities.lifestyle / totalPriority,
  };

  // Ensure investing floor
  const currentInvesting = getAllocation(allocations, 'investing');
  const investingFloorAmount = salary * investingFloor;
  if (currentInvesting < investingFloorAmount) {
    const investingIncrease = investingFloorAmount - currentInvesting;
    setAllocation(allocations, 'investing', investingFloorAmount);
    remaining -= investingIncrease;
  }

  // Distribute remaining budget by priorities
  if (remaining > 0) {
    const investingBonus = remaining * normalizedPriorities.investing;
    const lifestyleAmount = remaining * normalizedPriorities.lifestyle;
    const savingsAmount = remaining * 0.1; // 10% to short-term savings
    const miscAmount = remaining * 0.05; // 5% to miscellaneous

    setAllocation(allocations, 'investing', getAllocation(allocations, 'investing') + investingBonus);
    setAllocation(allocations, 'funLeisure', lifestyleAmount * 0.7);
    setAllocation(allocations, 'miscellaneous', miscAmount);
    setAllocation(allocations, 'savings', savingsAmount);
    setAllocation(allocations, 'charity', lifestyleAmount * 0.1);
  }
}

function applyRounding(allocations: CategoryAllocation[], roundingStep: number, salary: number) {
  let totalRounded = 0;
  
  allocations.forEach(allocation => {
    const rounded = Math.round(allocation.amount / roundingStep) * roundingStep;
    totalRounded += rounded;
    allocation.amount = rounded;
  });

  // Redistribute residual to investing
  const residual = salary - totalRounded;
  const investing = allocations.find(a => a.id === 'investing');
  if (investing && residual !== 0) {
    investing.amount += residual;
  }

  // Update percentages
  allocations.forEach(allocation => {
    allocation.percentage = (allocation.amount / salary) * 100;
  });
}

function calculateSummary(
  allocations: CategoryAllocation[],
  salary: number,
  efTargetMonths: number,
  totalEmis: number
): BudgetSummary {
  const essentials = allocations
    .filter(a => a.type === 'essential')
    .reduce((sum, a) => sum + a.amount, 0);
  
  const lifestyle = allocations
    .filter(a => a.type === 'lifestyle')
    .reduce((sum, a) => sum + a.amount, 0);
  
  const investing = getAllocation(allocations, 'investing');
  const efContribution = getAllocation(allocations, 'emergencyFund');
  const debtPrepayment = getAllocation(allocations, 'debtPrepayment');
  
  const efTarget = essentials * efTargetMonths;
  const monthsToEfTarget = efContribution > 0 ? Math.ceil(efTarget / efContribution) : Infinity;
  
  // Estimate debt-free ETA (simplified)
  let debtFreeEta: number | undefined;
  if (totalEmis > 0 && debtPrepayment > 0) {
    // Simplified calculation assuming average debt
    const estimatedDebtBalance = totalEmis * 60; // Assume 5 years remaining
    debtFreeEta = Math.ceil(estimatedDebtBalance / (totalEmis + debtPrepayment));
  }

  return {
    totalAllocated: allocations.reduce((sum, a) => sum + a.amount, 0),
    essentialsPercentage: (essentials / salary) * 100,
    investingPercentage: (investing / salary) * 100,
    lifestylePercentage: (lifestyle / salary) * 100,
    monthsToEfTarget,
    debtFreeEta,
    dtiRatio: totalEmis / salary,
  };
}

function generateBadges(
  allocations: CategoryAllocation[],
  summary: BudgetSummary,
  cityTier: CityTier,
  dtiRatio: number
): string[] {
  const badges: string[] = [];

  // Housing cap check
  const housing = allocations.find(a => a.id === 'housing');
  if (housing?.isOverCap) {
    badges.push('Over Cap (Housing)');
  }

  // DTI check
  if (dtiRatio > DTI_WARNING_THRESHOLD) {
    badges.push('High DTI');
  }

  // Emergency fund check
  if (summary.monthsToEfTarget <= 12) {
    badges.push('EF on track');
  }

  // Investing floor check
  const investing = allocations.find(a => a.id === 'investing');
  if (investing?.isAtFloor) {
    badges.push('Investing at floor');
  }

  return badges;
}

function generateNotes(
  allocations: CategoryAllocation[],
  summary: BudgetSummary,
  inputs: BudgetInputs
): string[] {
  const notes: string[] = [];

  if (summary.dtiRatio > DTI_WARNING_THRESHOLD) {
    notes.push('High debt-to-income ratio detected. Consider debt consolidation or prepayment.');
  }

  if (summary.investingPercentage < 15) {
    notes.push('Investing percentage is below recommended 15-20%. Consider increasing SIP contributions.');
  }

  if (summary.monthsToEfTarget > 24) {
    notes.push('Emergency fund target will take over 2 years. Consider increasing monthly contribution.');
  }

  const housing = allocations.find(a => a.id === 'housing');
  if (housing?.isOverCap) {
    notes.push(`Housing cost exceeds ${CITY_TIERS[inputs.cityTier].housingCap * 100}% recommended for ${inputs.cityTier} cities.`);
  }

  return notes;
}
