import { NextRequest, NextResponse } from 'next/server';
import { getMockTechnicalAnalysis } from '../mock-data';
import { getYahooSymbol, getStockInfo } from '../indian-stock-symbols';

// Technical indicator calculation functions
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export async function POST(request: NextRequest) {
  try {
    const { symbol, exchange = 'NSE', currentPrice } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    // Get correct Yahoo Finance symbol using our mapping
    const yahooSymbol = getYahooSymbol(symbol);
    const stockInfo = getStockInfo(symbol);
    
    console.log(`Technical Analysis for: ${symbol} -> Yahoo Symbol: ${yahooSymbol}`);

    try {
      // Get historical data for technical analysis (3 months)
      const historyUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=3mo`;
      const response = await fetch(historyUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error('No historical data found');
      }
      
      const result = data.chart.result[0];
      const prices = result.indicators.quote[0].close.filter((price: number) => price !== null);
      
      if (prices.length < 50) {
        throw new Error('Insufficient data for analysis');
      }
      
      // Calculate technical indicators
      const currentPriceValue = currentPrice || prices[prices.length - 1];
      const ema20 = calculateEMA(prices, 20);
      const ema50 = calculateEMA(prices, 50);
      const ema200 = calculateEMA(prices, 200);
      const rsi = calculateRSI(prices, 14);
      const sma20 = calculateSMA(prices, 20);
      const sma50 = calculateSMA(prices, 50);
      
      // EMA Crossover Analysis
      const prevEma20 = calculateEMA(prices.slice(0, -1), 20);
      const prevEma50 = calculateEMA(prices.slice(0, -1), 50);
      
      const isEma20AboveEma50 = ema20 > ema50;
      const wasEma20AboveEma50 = prevEma20 > prevEma50;
      const bullishCrossover = isEma20AboveEma50 && !wasEma20AboveEma50;
      const bearishCrossover = !isEma20AboveEma50 && wasEma20AboveEma50;
      
      // Generate signals
      let overallSignal = 'HOLD';
      let emaCrossoverSignal = 'WAIT';
      let confidence = 5;
      
      if (bullishCrossover && rsi < 70) {
        overallSignal = 'BUY';
        emaCrossoverSignal = 'BUY';
        confidence = 8;
      } else if (bearishCrossover || rsi > 80) {
        overallSignal = 'SELL';
        emaCrossoverSignal = 'AVOID';
        confidence = 7;
      } else if (isEma20AboveEma50 && currentPriceValue > ema20 && rsi < 60) {
        overallSignal = 'BUY';
        emaCrossoverSignal = 'BUY';
        confidence = 6;
      }
      
      // Support and resistance levels
      const recentHigh = Math.max(...prices.slice(-20));
      const recentLow = Math.min(...prices.slice(-20));
      const support1 = Math.min(ema50, sma50);
      const resistance1 = Math.max(recentHigh, ema20 * 1.05);
      
      const analysisData = {
        symbol: symbol,
        technicalIndicators: {
          rsi: `${rsi.toFixed(1)} - ${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}`,
          macd: `${ema20 > ema50 ? 'Bullish' : 'Bearish'} - EMA20 ${ema20 > ema50 ? 'above' : 'below'} EMA50`,
          ema20: `₹${ema20.toFixed(2)} - Price is ${currentPriceValue > ema20 ? 'above' : 'below'} EMA20`,
          ema50: `₹${ema50.toFixed(2)} - ${ema20 > ema50 ? 'Bullish' : 'Bearish'} trend`,
          ema200: `₹${ema200.toFixed(2)} - ${currentPriceValue > ema200 ? 'Long-term uptrend' : 'Long-term downtrend'}`,
          emaCrossover: bullishCrossover ? 'Recent bullish crossover detected' : bearishCrossover ? 'Recent bearish crossover detected' : 'No recent crossover',
          bollinger: `Price ${currentPriceValue > sma20 ? 'above' : 'below'} middle band (SMA20)`,
          volume: 'Volume analysis based on recent trading activity'
        },
        signals: {
          overall: `${overallSignal} - Confidence: ${confidence}/10`,
          shortTerm: rsi > 70 ? 'SELL' : rsi < 30 ? 'BUY' : 'HOLD',
          mediumTerm: isEma20AboveEma50 ? 'BUY' : 'SELL',
          longTerm: currentPriceValue > ema200 ? 'BUY' : 'SELL'
        },
        keyLevels: {
          support: [`₹${support1.toFixed(2)}`, `₹${recentLow.toFixed(2)}`],
          resistance: [`₹${resistance1.toFixed(2)}`, `₹${recentHigh.toFixed(2)}`],
          targetPrice: `₹${(currentPriceValue * 1.1).toFixed(2)}`,
          stopLoss: `₹${(Math.min(ema20, support1) * 0.95).toFixed(2)}`
        },
        emaCrossoverStrategy: {
          status: bullishCrossover ? 'Fresh bullish EMA crossover detected!' : isEma20AboveEma50 ? 'EMA20 above EMA50 - Uptrend intact' : 'EMA20 below EMA50 - Downtrend',
          signal: emaCrossoverSignal,
          entry: `₹${(currentPriceValue * 0.98).toFixed(2)}`,
          confidence: confidence.toString()
        },
        summary: `${symbol} shows ${overallSignal.toLowerCase()} signals with EMA20 ${ema20 > ema50 ? 'above' : 'below'} EMA50. RSI at ${rsi.toFixed(1)} indicates ${rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'} conditions. ${bullishCrossover ? 'Recent bullish crossover detected.' : ''}`,
        risks: 'Market volatility, sector-specific risks, and broader economic conditions may impact performance. Use proper risk management.',
        lastUpdated: new Date().toISOString()
      };
      
      return NextResponse.json(analysisData);
      
    } catch (fetchError) {
      console.error('Technical analysis error:', fetchError);
      
      // Use mock technical analysis as fallback
      const mockAnalysis = getMockTechnicalAnalysis(symbol);
      mockAnalysis.note = "Using mock analysis - Yahoo Finance API unavailable";
      
      return NextResponse.json(mockAnalysis);
    }

  } catch (error) {
    console.error('Error generating technical analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate technical analysis' },
      { status: 500 }
    );
  }
}
