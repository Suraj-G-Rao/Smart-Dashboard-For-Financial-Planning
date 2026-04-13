import { describe, it, expect } from 'vitest'
import { formatINR, formatNumber, calculateXIRR, calculateSMA, calculateRSI } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatINR', () => {
    it('should format Indian currency correctly', () => {
      expect(formatINR(1000)).toBe('₹1,000')
      expect(formatINR(100000)).toBe('₹1,00,000')
      expect(formatINR(10000000)).toBe('₹1,00,00,000')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with Indian numbering', () => {
      expect(formatNumber(1234567)).toContain('1,234,567')
    })
  })

  describe('calculateXIRR', () => {
    it('should calculate XIRR for cash flows', () => {
      const cashflows = [
        { date: new Date('2023-01-01'), amount: -100000 },
        { date: new Date('2023-06-01'), amount: 10000 },
        { date: new Date('2024-01-01'), amount: 110000 },
      ]
      const xirr = calculateXIRR(cashflows)
      expect(xirr).toBeGreaterThan(0)
      expect(xirr).toBeLessThan(100)
    })
  })

  describe('calculateSMA', () => {
    it('should calculate simple moving average', () => {
      const data = [10, 20, 30, 40, 50]
      const sma = calculateSMA(data, 3)
      expect(sma[2]).toBe(20) // (10+20+30)/3
      expect(sma[3]).toBe(30) // (20+30+40)/3
    })
  })

  describe('calculateRSI', () => {
    it('should calculate RSI', () => {
      const data = [
        44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61,
        46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64,
      ]
      const rsi = calculateRSI(data, 14)
      const lastRsi = rsi[rsi.length - 1]
      expect(lastRsi).toBeGreaterThan(0)
      expect(lastRsi).toBeLessThan(100)
    })
  })
})
