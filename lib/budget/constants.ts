export const CITY_TIERS = {
  'tier-1': { label: 'Tier-1 (Mumbai, Delhi, Bangalore)', housingCap: 0.35 },
  'tier-2': { label: 'Tier-2 (Pune, Hyderabad, Chennai)', housingCap: 0.30 },
  'tier-3': { label: 'Tier-3 (Smaller cities)', housingCap: 0.25 },
} as const;

export type CityTier = keyof typeof CITY_TIERS;

export const SALARY_BANDS = [
  {
    min: 0,
    max: 30000,
    essentials: { min: 0.65, max: 0.70 },
    investing: { min: 0.05, max: 0.10 },
    lifestyle: { min: 0.10, max: 0.15 },
    emergencyFund: { min: 0.05, max: 0.10 },
  },
  {
    min: 30000,
    max: 100000,
    essentials: { min: 0.50, max: 0.55 },
    investing: { min: 0.15, max: 0.25 },
    lifestyle: { min: 0.15, max: 0.20 },
    emergencyFund: { min: 0.05, max: 0.10 },
  },
  {
    min: 100000,
    max: Infinity,
    essentials: { min: 0.40, max: 0.45 },
    investing: { min: 0.25, max: 0.35 },
    lifestyle: { min: 0.15, max: 0.20 },
    emergencyFund: { min: 0.05, max: 0.10 },
  },
];

export const CATEGORY_CAPS = {
  utilities: { min: 0.03, max: 0.06 },
  phoneInternet: { min: 0.01, max: 0.03 },
  transport: { min: 0.04, max: 0.08 },
  groceries: { min: 0.12, max: 0.18 },
  insurance: { min: 0.02, max: 0.05 },
} as const;

export const DEFAULT_CATEGORIES = [
  { id: 'housing', name: 'Housing (Rent)', icon: '🏠', type: 'essential', editable: true },
  { id: 'utilities', name: 'Utilities', icon: '💡', type: 'essential', editable: true },
  { id: 'transport', name: 'Transport', icon: '🚗', type: 'essential', editable: true },
  { id: 'groceries', name: 'Food & Groceries', icon: '🛒', type: 'essential', editable: true },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', type: 'essential', editable: true },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', type: 'essential', editable: true },
  { id: 'phoneInternet', name: 'Phone & Internet', icon: '📱', type: 'essential', editable: true },
  { id: 'subscriptions', name: 'Subscriptions', icon: '📺', type: 'lifestyle', editable: true },
  { id: 'education', name: 'Education', icon: '📚', type: 'essential', editable: true },
  { id: 'childcare', name: 'Childcare', icon: '👶', type: 'essential', editable: true },
  { id: 'debtEmi', name: 'Debt EMI', icon: '💳', type: 'fixed', editable: false },
  { id: 'debtPrepayment', name: 'Debt Prepayment', icon: '💰', type: 'goal', editable: true },
  { id: 'emergencyFund', name: 'Emergency Fund', icon: '🚨', type: 'goal', editable: true },
  { id: 'investing', name: 'Investing (SIP)', icon: '📈', type: 'goal', editable: true },
  { id: 'savings', name: 'Savings (short-term)', icon: '💵', type: 'goal', editable: true },
  { id: 'funLeisure', name: 'Fun/Leisure', icon: '🎉', type: 'lifestyle', editable: true },
  { id: 'miscellaneous', name: 'Miscellaneous', icon: '📦', type: 'lifestyle', editable: true },
  { id: 'charity', name: 'Charity', icon: '❤️', type: 'lifestyle', editable: true },
] as const;

export const ROUNDING_OPTIONS = [
  { value: 10, label: '₹10' },
  { value: 50, label: '₹50' },
  { value: 100, label: '₹100' },
] as const;

export const SCENARIO_PRESETS = {
  aggressive: {
    emergencyFund: 20,
    debtPrepayment: 40,
    investing: 30,
    lifestyle: 10,
  },
  balanced: {
    emergencyFund: 25,
    debtPrepayment: 25,
    investing: 25,
    lifestyle: 25,
  },
  relaxed: {
    emergencyFund: 15,
    debtPrepayment: 15,
    investing: 20,
    lifestyle: 50,
  },
} as const;

export const HIGH_INTEREST_THRESHOLD = 14; // APR %
export const DTI_WARNING_THRESHOLD = 0.40; // 40% of salary
export const INVESTING_FLOOR_DEFAULT = 0.10; // 10%
export const EF_TARGET_MONTHS_DEFAULT = 6;
