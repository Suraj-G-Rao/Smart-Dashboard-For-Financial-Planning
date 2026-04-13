/**
 * Insurance Recommendations Engine for Indian Market
 */

export type InsuranceType = 'Term' | 'Health' | 'Motor' | 'Travel' | 'Life';
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface InsuranceRecommendationInput {
  age: number;
  annualIncome: number;
  dependents: number;
  city: string;
  riskProfile: RiskProfile;
  existingCoverage?: number;
  hasVehicle?: boolean;
  hasHealthIssues?: boolean;
}

export interface InsuranceRecommendation {
  type: InsuranceType;
  recommendedCoverage: number;
  estimatedPremium: number;
  rationale: string;
  providers: string[];
  priority: 'High' | 'Medium' | 'Low';
}

/**
 * Calculate recommended term life insurance coverage
 * Rule: 10-15× annual income
 */
export function calculateTermLifeCoverage(
  annualIncome: number,
  dependents: number,
  existingCoverage: number = 0
): number {
  let multiplier = 10;
  
  // Increase multiplier based on dependents
  if (dependents >= 3) multiplier = 15;
  else if (dependents >= 1) multiplier = 12;
  
  const recommended = annualIncome * multiplier;
  const additionalNeeded = Math.max(0, recommended - existingCoverage);
  
  return Math.round(additionalNeeded);
}

/**
 * Calculate recommended health insurance coverage
 * Base: ₹5-10L, +₹3L per dependent
 */
export function calculateHealthCoverage(
  dependents: number,
  city: string,
  hasHealthIssues: boolean
): number {
  // Metro cities need higher coverage
  const metros = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];
  const isMetro = metros.includes(city);
  
  let baseCoverage = isMetro ? 1000000 : 500000; // ₹10L or ₹5L
  
  // Add per dependent
  baseCoverage += dependents * 300000; // +₹3L per dependent
  
  // Increase if health issues exist
  if (hasHealthIssues) {
    baseCoverage *= 1.5;
  }
  
  return Math.round(baseCoverage);
}

/**
 * Estimate term life premium (heuristic: 0.5-1% of coverage)
 */
export function estimateTermPremium(
  coverage: number,
  age: number,
  hasHealthIssues: boolean
): number {
  let rate = 0.007; // 0.7% base rate
  
  // Age-based adjustments
  if (age < 30) rate = 0.005;
  else if (age >= 40) rate = 0.010;
  else if (age >= 50) rate = 0.015;
  
  // Health issues increase premium
  if (hasHealthIssues) rate *= 1.5;
  
  return Math.round(coverage * rate);
}

/**
 * Estimate health insurance premium
 */
export function estimateHealthPremium(
  coverage: number,
  age: number,
  dependents: number,
  hasHealthIssues: boolean
): number {
  // Base premium per lakh of coverage
  let ratePerLakh = 250;
  
  // Age adjustments
  if (age < 35) ratePerLakh = 200;
  else if (age >= 45) ratePerLakh = 350;
  else if (age >= 55) ratePerLakh = 500;
  
  // Family size adjustment
  const familyMultiplier = 1 + (dependents * 0.3);
  
  let premium = (coverage / 100000) * ratePerLakh * familyMultiplier;
  
  // Health issues increase premium significantly
  if (hasHealthIssues) premium *= 1.8;
  
  return Math.round(premium);
}

/**
 * Generate comprehensive insurance recommendations
 */
export function generateInsuranceRecommendations(
  input: InsuranceRecommendationInput
): InsuranceRecommendation[] {
  const recommendations: InsuranceRecommendation[] = [];
  
  // 1. Term Life Insurance
  if (input.dependents > 0 || input.age < 50) {
    const termCoverage = calculateTermLifeCoverage(
      input.annualIncome,
      input.dependents,
      input.existingCoverage || 0
    );
    
    if (termCoverage > 0) {
      const premium = estimateTermPremium(
        termCoverage,
        input.age,
        input.hasHealthIssues || false
      );
      
      recommendations.push({
        type: 'Term',
        recommendedCoverage: termCoverage,
        estimatedPremium: premium,
        rationale: `With ${input.dependents} dependent(s), you need ${(termCoverage / input.annualIncome).toFixed(0)}× your annual income as coverage to protect your family's financial future.`,
        providers: ['HDFC Life', 'ICICI Prudential', 'Max Life', 'SBI Life', 'LIC'],
        priority: input.dependents > 0 ? 'High' : 'Medium',
      });
    }
  }
  
  // 2. Health Insurance
  const healthCoverage = calculateHealthCoverage(
    input.dependents,
    input.city,
    input.hasHealthIssues || false
  );
  
  const healthPremium = estimateHealthPremium(
    healthCoverage,
    input.age,
    input.dependents,
    input.hasHealthIssues || false
  );
  
  recommendations.push({
    type: 'Health',
    recommendedCoverage: healthCoverage,
    estimatedPremium: healthPremium,
    rationale: `₹${(healthCoverage / 100000).toFixed(0)}L coverage recommended for ${input.dependents + 1} family member(s) in ${input.city}. Rising healthcare costs make this essential.`,
    providers: ['Star Health', 'Care Health', 'HDFC Ergo', 'ICICI Lombard', 'Niva Bupa'],
    priority: 'High',
  });
  
  // 3. Motor Insurance (if has vehicle)
  if (input.hasVehicle) {
    recommendations.push({
      type: 'Motor',
      recommendedCoverage: 1000000, // ₹10L third-party
      estimatedPremium: 8000, // Approximate for sedan
      rationale: 'Comprehensive motor insurance is mandatory and protects against accidents, theft, and third-party liabilities.',
      providers: ['HDFC Ergo', 'ICICI Lombard', 'Bajaj Allianz', 'Digit Insurance', 'Acko'],
      priority: 'High',
    });
  }
  
  // 4. Travel Insurance (optional, for frequent travelers)
  if (input.riskProfile !== 'conservative' && input.annualIncome > 1000000) {
    recommendations.push({
      type: 'Travel',
      recommendedCoverage: 500000,
      estimatedPremium: 1500,
      rationale: 'For international travel, covers medical emergencies, trip cancellations, and lost luggage.',
      providers: ['ICICI Lombard', 'HDFC Ergo', 'Digit', 'Bajaj Allianz', 'Tata AIG'],
      priority: 'Low',
    });
  }
  
  return recommendations;
}

/**
 * Calculate insurance adequacy score (0-100)
 */
export function calculateInsuranceAdequacy(
  input: InsuranceRecommendationInput,
  currentPolicies: { type: InsuranceType; coverage: number }[]
): {
  score: number;
  gaps: { type: InsuranceType; shortfall: number }[];
} {
  const recommendations = generateInsuranceRecommendations(input);
  let totalScore = 0;
  let maxScore = 0;
  const gaps: { type: InsuranceType; shortfall: number }[] = [];
  
  recommendations.forEach((rec) => {
    const current = currentPolicies.find((p) => p.type === rec.type);
    const currentCoverage = current?.coverage || 0;
    const recommended = rec.recommendedCoverage;
    
    const weight = rec.priority === 'High' ? 40 : rec.priority === 'Medium' ? 30 : 20;
    maxScore += weight;
    
    const coverageRatio = Math.min(1, currentCoverage / recommended);
    totalScore += coverageRatio * weight;
    
    if (coverageRatio < 1) {
      gaps.push({
        type: rec.type,
        shortfall: recommended - currentCoverage,
      });
    }
  });
  
  return {
    score: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
    gaps,
  };
}

/**
 * Check for upcoming premium renewals
 */
export function getUpcomingRenewals(
  policies: { nextPremiumOn: Date; premium: number; policyType: string }[],
  daysAhead: number = 30
): { policy: typeof policies[0]; daysUntil: number }[] {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + daysAhead);
  
  return policies
    .filter((p) => p.nextPremiumOn >= today && p.nextPremiumOn <= futureDate)
    .map((p) => ({
      policy: p,
      daysUntil: Math.ceil((p.nextPremiumOn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
