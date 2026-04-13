/**
 * AI Salary Predictor - Forecasting engine for Indian tech salaries
 */

export type Role = 'Intern' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Staff' | 'Principal';
export type City = 'Bangalore' | 'Mumbai' | 'Delhi' | 'Hyderabad' | 'Pune' | 'Chennai' | 'Other';

export interface SalaryPredictionInput {
  baseCTC: number;
  role: Role;
  expYears: number;
  city: City;
  skills: string[];
  education?: string;
}

export interface SalaryPrediction {
  oneYear: number;
  threeYear: number;
  band: [number, number, number]; // [low, mid, high]
  factors: string[];
  cagr: number;
}

// Base CAGR for salary growth in Indian tech
const BASE_CAGR = 0.07; // 7%

// Skill multipliers (additional growth %)
const SKILL_MULTIPLIERS: Record<string, number> = {
  'Gen AI': 0.06,
  'Machine Learning': 0.05,
  'Cloud': 0.04,
  'AWS': 0.04,
  'Azure': 0.04,
  'GCP': 0.04,
  'Security': 0.04,
  'DevOps': 0.04,
  'Data Engineering': 0.03,
  'Kubernetes': 0.03,
  'React': 0.02,
  'Node.js': 0.02,
  'Python': 0.02,
  'Go': 0.03,
  'Rust': 0.04,
  'Web3': 0.05,
  'Blockchain': 0.05,
};

// Role multipliers for base salary
const ROLE_MULTIPLIERS: Record<Role, number> = {
  Intern: 0.8,
  Junior: 0.95,
  Mid: 1.0,
  Senior: 1.15,
  Lead: 1.25,
  Staff: 1.4,
  Principal: 1.6,
};

// City cost-of-living multipliers
const CITY_MULTIPLIERS: Record<City, number> = {
  Bangalore: 1.05,
  Mumbai: 1.08,
  Delhi: 1.02,
  Hyderabad: 0.98,
  Pune: 1.0,
  Chennai: 0.95,
  Other: 0.9,
};

/**
 * Predict salary growth based on various factors
 */
export function predictSalary(input: SalaryPredictionInput): SalaryPrediction {
  // Clamp experience to 0-30 years
  const experience = Math.max(0, Math.min(30, input.expYears));

  // Calculate skill bonus
  const skillBonus = input.skills.reduce((total, skill) => {
    const multiplier = SKILL_MULTIPLIERS[skill] || 0;
    return total + multiplier;
  }, 0);

  // Calculate total CAGR
  const totalCAGR = BASE_CAGR + skillBonus;

  // Calculate role adjustment
  const roleMultiplier = ROLE_MULTIPLIERS[input.role] || 1.0;

  // Calculate city adjustment
  const cityMultiplier = CITY_MULTIPLIERS[input.city] || 1.0;

  // Apply adjustments to base CTC
  const adjustedBase = input.baseCTC * roleMultiplier * cityMultiplier;

  // Project 1-year and 3-year salaries
  const oneYear = Math.round(adjustedBase * (1 + totalCAGR));
  const threeYear = Math.round(adjustedBase * Math.pow(1 + totalCAGR, 3));

  // Calculate band (low, mid, high) with ±15% variance
  const low = Math.round(oneYear * 0.85);
  const mid = oneYear;
  const high = Math.round(oneYear * 1.15);

  // Generate factors explanation
  const factors: string[] = [];
  
  factors.push(`Base CAGR: ${(BASE_CAGR * 100).toFixed(0)}%`);
  
  if (skillBonus > 0) {
    factors.push(`Skill premium: +${(skillBonus * 100).toFixed(0)}%`);
  }
  
  if (roleMultiplier !== 1.0) {
    factors.push(`${input.role} level: ${((roleMultiplier - 1) * 100).toFixed(0)}% adjustment`);
  }
  
  if (cityMultiplier !== 1.0) {
    factors.push(`${input.city} location: ${((cityMultiplier - 1) * 100).toFixed(0)}% adjustment`);
  }

  if (experience < 2) {
    factors.push('Early career growth potential');
  } else if (experience > 10) {
    factors.push('Senior leadership trajectory');
  }

  return {
    oneYear,
    threeYear,
    band: [low, mid, high],
    factors,
    cagr: totalCAGR,
  };
}

/**
 * Generate AI-powered action plan for salary growth
 */
export interface ActionPlan {
  title: string;
  timeframe: string;
  impact: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export function generateActionPlan(
  input: SalaryPredictionInput,
  prediction: SalaryPrediction
): ActionPlan[] {
  const plans: ActionPlan[] = [];
  const currentSkills = new Set(input.skills.map((s) => s.toLowerCase()));

  // Identify high-impact skills not yet mastered
  const highImpactSkills = Object.entries(SKILL_MULTIPLIERS)
    .filter(([skill, multiplier]) => !currentSkills.has(skill.toLowerCase()) && multiplier >= 0.04)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  // Add skill recommendations
  highImpactSkills.forEach(([skill, multiplier]) => {
    plans.push({
      title: `Learn ${skill}`,
      timeframe: '3-6 months',
      impact: `+${(multiplier * 100).toFixed(0)}% salary growth potential`,
      difficulty: 'Medium',
    });
  });

  // Role progression
  if (input.role === 'Junior' || input.role === 'Mid') {
    plans.push({
      title: 'Target Senior role promotion',
      timeframe: '12-18 months',
      impact: '+15-25% immediate salary increase',
      difficulty: 'Medium',
    });
  }

  // Certifications
  if (!currentSkills.has('cloud') && !currentSkills.has('aws')) {
    plans.push({
      title: 'Earn AWS/Azure certification',
      timeframe: '2-3 months',
      impact: '+4-5% premium + job opportunities',
      difficulty: 'Easy',
    });
  }

  // Leadership path
  if (input.expYears >= 5 && input.role !== 'Lead') {
    plans.push({
      title: 'Build leadership skills & mentor juniors',
      timeframe: '6-12 months',
      impact: 'Positions for Lead role (+25% salary)',
      difficulty: 'Medium',
    });
  }

  // Return top 4 most impactful
  return plans.slice(0, 4);
}

/**
 * Get market insights for a role
 */
export function getMarketInsights(role: Role, city: City): {
  averageCTC: number;
  demandLevel: 'High' | 'Medium' | 'Low';
  topCompanies: string[];
} {
  const baseSalaries: Record<Role, number> = {
    Intern: 300000,
    Junior: 600000,
    Mid: 1200000,
    Senior: 2000000,
    Lead: 3500000,
    Staff: 5000000,
    Principal: 7000000,
  };

  const averageCTC = Math.round(baseSalaries[role] * (CITY_MULTIPLIERS[city] || 1.0));

  const demandLevel: 'High' | 'Medium' | 'Low' = 
    role === 'Mid' || role === 'Senior' ? 'High' :
    role === 'Lead' || role === 'Staff' ? 'Medium' : 'Medium';

  const topCompanies = [
    'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Swiggy',
    'Razorpay', 'Zerodha', 'CRED', 'PhonePe', 'Zomato'
  ];

  return {
    averageCTC,
    demandLevel,
    topCompanies: topCompanies.slice(0, 5),
  };
}
