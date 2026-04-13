import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in INR
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format number with Indian numbering system
 */
export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Calculate XIRR (Extended Internal Rate of Return)
 */
export function calculateXIRR(cashflows: { date: Date; amount: number }[]): number {
  if (cashflows.length < 2) return 0

  // Sort by date
  cashflows.sort((a, b) => a.date.getTime() - b.date.getTime())

  const firstDate = cashflows[0].date.getTime()

  // Newton-Raphson method
  let rate = 0.1
  const maxIterations = 100
  const tolerance = 0.0001

  for (let i = 0; i < maxIterations; i++) {
    let sum = 0
    let derivative = 0

    for (const cf of cashflows) {
      const years = (cf.date.getTime() - firstDate) / (365.25 * 24 * 60 * 60 * 1000)
      sum += cf.amount / Math.pow(1 + rate, years)
      derivative -= years * cf.amount / Math.pow(1 + rate, years + 1)
    }

    const newRate = rate - sum / derivative

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100
    }

    rate = newRate
  }

  return rate * 100
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / period)
    }
  }
  return result
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = []
  let ema = data[0]

  result.push(ema)

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k)
    result.push(ema)
  }

  return result
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(data: number[], period = 14): number[] {
  const result: number[] = []
  let gains = 0
  let losses = 0

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1]
    if (change > 0) gains += change
    else losses -= change
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  for (let i = 0; i < period; i++) {
    result.push(NaN)
  }

  result.push(100 - 100 / (1 + avgGain / avgLoss))

  // Calculate RSI for remaining data
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? -change : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    const rs = avgGain / avgLoss
    result.push(100 - 100 / (1 + rs))
  }

  return result
}
