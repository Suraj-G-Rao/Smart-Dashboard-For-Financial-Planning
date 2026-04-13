import { describe, it, expect } from 'vitest'
import { calculateEMI, calculateEMIWithSavings, generateBaseSchedule } from '@/lib/emi'

describe('EMI Calculator', () => {
  it('should calculate correct EMI for a loan', () => {
    const emi = calculateEMI(1000000, 10, 240) // 10L at 10% for 20 years
    expect(emi).toBeCloseTo(9650.16, 1)
  })

  it('should generate base amortization schedule', () => {
    const result = generateBaseSchedule({
      principal: 100000,
      rateApr: 12,
      tenureYears: 1,
    })

    expect(result.schedule).toHaveLength(12)
    expect(result.summary.emi).toBeGreaterThan(0)
    expect(result.summary.totalInterest).toBeGreaterThan(0)
    expect(result.summary.monthsToPayoff).toBe(12)
  })

  it('should calculate savings with extra EMIs', () => {
    const result = calculateEMIWithSavings(
      { principal: 1000000, rateApr: 10, tenureYears: 20 },
      {
        extraEmisPerYear: 2,
        emiIncreasePercent: 0,
        oneTimePrepayment: 0,
        prepayMonth: 0,
        startMonth: 1,
      }
    )

    expect(result.savingsDelta).toBeDefined()
    expect(result.savingsDelta!.monthsSaved).toBeGreaterThan(0)
    expect(result.savingsDelta!.interestSaved).toBeGreaterThan(0)
  })

  it('should handle zero interest rate', () => {
    const emi = calculateEMI(100000, 0, 12)
    expect(emi).toBeCloseTo(100000 / 12, 1)
  })

  it('should reduce tenure with step-up', () => {
    const result = calculateEMIWithSavings(
      { principal: 500000, rateApr: 8, tenureYears: 10 },
      {
        extraEmisPerYear: 0,
        emiIncreasePercent: 10,
        oneTimePrepayment: 0,
        prepayMonth: 0,
        startMonth: 1,
      }
    )

    expect(result.savingsDelta!.monthsSaved).toBeGreaterThan(0)
  })

  it('should apply one-time prepayment correctly', () => {
    const result = calculateEMIWithSavings(
      { principal: 1000000, rateApr: 9, tenureYears: 15 },
      {
        extraEmisPerYear: 0,
        emiIncreasePercent: 0,
        oneTimePrepayment: 100000,
        prepayMonth: 12,
        startMonth: 1,
      }
    )

    expect(result.savingsSchedule).toBeDefined()
    const prepaymentMonth = result.savingsSchedule!.find((s) => s.month === 12)
    expect(prepaymentMonth?.prepayment).toBeGreaterThan(0)
  })
})
