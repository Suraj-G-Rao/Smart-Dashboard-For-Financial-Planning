/**
 * EMI Calculator with Savings Planner
 */

export interface EMIInput {
  principal: number
  rateApr: number
  tenureYears: number
}

export interface SavingsInput {
  extraEmisPerYear: number
  emiIncreasePercent: number
  oneTimePrepayment: number
  prepayMonth: number
  startMonth: number
}

export interface EMIInstallment {
  month: number
  emi: number
  principal: number
  interest: number
  prepayment: number
  balance: number
}

export interface EMISummary {
  emi: number
  totalInterest: number
  totalPayment: number
  payoffDate: string
  monthsToPayoff: number
}

export interface EMIResult {
  baseSchedule: EMIInstallment[]
  savingsSchedule: EMIInstallment[] | null
  summaryBefore: EMISummary
  summaryAfter: EMISummary | null
  savingsDelta: {
    monthsSaved: number
    interestSaved: number
  } | null
}

/**
 * Calculate monthly EMI
 */
export function calculateEMI(principal: number, rateApr: number, tenureMonths: number): number {
  const r = rateApr / 100 / 12
  if (r === 0) return principal / tenureMonths
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1)
  return Math.round(emi * 100) / 100
}

/**
 * Generate base amortization schedule
 */
export function generateBaseSchedule(input: EMIInput): {
  schedule: EMIInstallment[]
  summary: EMISummary
} {
  const { principal, rateApr, tenureYears } = input
  const tenureMonths = tenureYears * 12
  const monthlyRate = rateApr / 100 / 12
  const emi = calculateEMI(principal, rateApr, tenureMonths)

  const schedule: EMIInstallment[] = []
  let balance = principal
  let totalInterest = 0

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate
    const principalPaid = emi - interest
    balance = Math.max(0, balance - principalPaid)
    totalInterest += interest

    schedule.push({
      month,
      emi,
      principal: principalPaid,
      interest,
      prepayment: 0,
      balance,
    })

    if (balance <= 0) break
  }

  const startDate = new Date()
  const payoffDate = new Date(startDate.getFullYear(), startDate.getMonth() + schedule.length, 1)

  return {
    schedule,
    summary: {
      emi,
      totalInterest,
      totalPayment: principal + totalInterest,
      payoffDate: payoffDate.toISOString().split('T')[0],
      monthsToPayoff: schedule.length,
    },
  }
}

/**
 * Generate schedule with savings strategies
 */
export function generateSavingsSchedule(
  input: EMIInput,
  savings: SavingsInput
): {
  schedule: EMIInstallment[]
  summary: EMISummary
} {
  const { principal, rateApr } = input
  const { extraEmisPerYear, emiIncreasePercent, oneTimePrepayment, prepayMonth, startMonth } =
    savings
  const monthlyRate = rateApr / 100 / 12
  const baseEmi = calculateEMI(principal, rateApr, input.tenureYears * 12)

  const schedule: EMIInstallment[] = []
  let balance = principal
  let totalInterest = 0
  let currentEmi = baseEmi
  let month = 1

  // Determine which months get extra EMI (spread evenly)
  const extraEmiMonths = new Set<number>()
  if (extraEmisPerYear > 0) {
    const interval = Math.floor(12 / extraEmisPerYear)
    for (let i = 0; i < extraEmisPerYear; i++) {
      extraEmiMonths.add(startMonth + i * interval)
    }
  }

  while (balance > 0 && month <= 1000) {
    // Avoid infinite loop
    const interest = balance * monthlyRate
    let prepayment = 0

    // Apply one-time prepayment
    if (month === prepayMonth && oneTimePrepayment > 0) {
      prepayment = Math.min(oneTimePrepayment, balance - interest)
    }

    // Apply extra EMI
    if (extraEmiMonths.has(month % 12 || 12) && month >= startMonth) {
      prepayment += currentEmi
    }

    const totalPayment = currentEmi + prepayment
    const principalPaid = Math.min(totalPayment - interest, balance)
    balance = Math.max(0, balance - principalPaid - prepayment)
    totalInterest += interest

    schedule.push({
      month,
      emi: currentEmi,
      principal: principalPaid,
      interest,
      prepayment,
      balance,
    })

    if (balance <= 0) break

    // Apply step-up at year boundary
    if (month % 12 === 0 && emiIncreasePercent > 0) {
      currentEmi = currentEmi * (1 + emiIncreasePercent / 100)
    }

    month++
  }

  const startDate = new Date()
  const payoffDate = new Date(startDate.getFullYear(), startDate.getMonth() + schedule.length, 1)

  return {
    schedule,
    summary: {
      emi: baseEmi,
      totalInterest,
      totalPayment: principal + totalInterest,
      payoffDate: payoffDate.toISOString().split('T')[0],
      monthsToPayoff: schedule.length,
    },
  }
}

/**
 * Full EMI calculation with optional savings
 */
export function calculateEMIWithSavings(
  input: EMIInput,
  savings?: SavingsInput
): EMIResult {
  const base = generateBaseSchedule(input)

  if (!savings) {
    return {
      baseSchedule: base.schedule,
      savingsSchedule: null,
      summaryBefore: base.summary,
      summaryAfter: null,
      savingsDelta: null,
    }
  }

  const withSavings = generateSavingsSchedule(input, savings)

  return {
    baseSchedule: base.schedule,
    savingsSchedule: withSavings.schedule,
    summaryBefore: base.summary,
    summaryAfter: withSavings.summary,
    savingsDelta: {
      monthsSaved: base.summary.monthsToPayoff - withSavings.summary.monthsToPayoff,
      interestSaved: base.summary.totalInterest - withSavings.summary.totalInterest,
    },
  }
}
