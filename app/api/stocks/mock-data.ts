// Mock stock data for development and fallback
export const mockStockData: Record<string, any> = {
  'RELIANCE': {
    symbol: 'RELIANCE',
    exchange: 'NSE',
    currentPrice: '2847.65',
    previousClose: '2832.40',
    change: '15.25',
    changePercent: '0.54',
    volume: '2847392',
    marketCap: '19,23,456 Cr',
    pe: '13.8',
    dayHigh: '2865.00',
    dayLow: '2825.50',
    week52High: '3024.90',
    week52Low: '2220.30',
    sector: 'Oil & Gas',
    companyName: 'Reliance Industries Limited'
  },
  'TCS': {
    symbol: 'TCS',
    exchange: 'NSE',
    currentPrice: '4127.85',
    previousClose: '4098.20',
    change: '29.65',
    changePercent: '0.72',
    volume: '1456789',
    marketCap: '15,02,345 Cr',
    pe: '28.4',
    dayHigh: '4145.00',
    dayLow: '4089.75',
    week52High: '4592.25',
    week52Low: '3311.00',
    sector: 'Information Technology',
    companyName: 'Tata Consultancy Services Limited'
  },
  'HDFCBANK': {
    symbol: 'HDFCBANK',
    exchange: 'NSE',
    currentPrice: '1742.30',
    previousClose: '1728.95',
    change: '13.35',
    changePercent: '0.77',
    volume: '3245678',
    marketCap: '13,24,567 Cr',
    pe: '19.2',
    dayHigh: '1756.80',
    dayLow: '1721.40',
    week52High: '1880.00',
    week52Low: '1363.55',
    sector: 'Banking',
    companyName: 'HDFC Bank Limited'
  },
  'INFY': {
    symbol: 'INFY',
    exchange: 'NSE',
    currentPrice: '1845.75',
    previousClose: '1832.60',
    change: '13.15',
    changePercent: '0.72',
    volume: '1987654',
    marketCap: '7,65,432 Cr',
    pe: '26.8',
    dayHigh: '1858.90',
    dayLow: '1825.30',
    week52High: '1953.90',
    week52Low: '1351.65',
    sector: 'Information Technology',
    companyName: 'Infosys Limited'
  },
  'ICICIBANK': {
    symbol: 'ICICIBANK',
    exchange: 'NSE',
    currentPrice: '1267.45',
    previousClose: '1254.80',
    change: '12.65',
    changePercent: '1.01',
    volume: '4567890',
    marketCap: '8,87,654 Cr',
    pe: '16.5',
    dayHigh: '1275.20',
    dayLow: '1248.90',
    week52High: '1257.80',
    week52Low: '951.05',
    sector: 'Banking',
    companyName: 'ICICI Bank Limited'
  },
  'WIPRO': {
    symbol: 'WIPRO',
    exchange: 'NSE',
    currentPrice: '567.85',
    previousClose: '562.40',
    change: '5.45',
    changePercent: '0.97',
    volume: '2345678',
    marketCap: '3,12,456 Cr',
    pe: '24.7',
    dayHigh: '572.30',
    dayLow: '559.80',
    week52High: '695.00',
    week52Low: '389.95',
    sector: 'Information Technology',
    companyName: 'Wipro Limited'
  },
  'VIMTALABS': {
    symbol: 'VIMTALABS',
    exchange: 'NSE',
    currentPrice: '661.35',
    previousClose: '655.20',
    change: '6.15',
    changePercent: '0.94',
    volume: '125430',
    marketCap: '1,245 Cr',
    pe: '18.5',
    dayHigh: '668.90',
    dayLow: '652.10',
    week52High: '785.00',
    week52Low: '485.30',
    sector: 'Healthcare',
    companyName: 'Vimta Labs Limited'
  },
  'VIMATA': {
    symbol: 'VIMTALABS', // Redirect to correct symbol
    exchange: 'NSE',
    currentPrice: '661.35',
    previousClose: '655.20',
    change: '6.15',
    changePercent: '0.94',
    volume: '125430',
    marketCap: '1,245 Cr',
    pe: '18.5',
    dayHigh: '668.90',
    dayLow: '652.10',
    week52High: '785.00',
    week52Low: '485.30',
    sector: 'Healthcare',
    companyName: 'Vimta Labs Limited'
  }
};

export const mockTechnicalAnalysis: Record<string, any> = {
  'RELIANCE': {
    symbol: 'RELIANCE',
    technicalIndicators: {
      rsi: '58.4 - Neutral',
      macd: 'Bullish - EMA20 above EMA50',
      ema20: '₹2835.50 - Price above EMA20',
      ema50: '₹2798.30 - Bullish trend',
      ema200: '₹2654.80 - Long-term uptrend',
      emaCrossover: 'EMA20 above EMA50 - Uptrend intact',
      bollinger: 'Price near middle band - Neutral momentum',
      volume: 'Above average volume - Good participation'
    },
    signals: {
      overall: 'BUY - Confidence: 7/10',
      shortTerm: 'BUY',
      mediumTerm: 'BUY',
      longTerm: 'HOLD'
    },
    keyLevels: {
      support: ['₹2798.30', '₹2750.00'],
      resistance: ['₹2890.00', '₹2950.00'],
      targetPrice: '₹3050.00',
      stopLoss: '₹2720.00'
    },
    emaCrossoverStrategy: {
      status: 'EMA20 above EMA50 - Bullish trend confirmed',
      signal: 'BUY',
      entry: '₹2830.00',
      confidence: '7'
    },
    summary: 'RELIANCE shows bullish technical setup with strong momentum. EMA crossover strategy favors upside with good volume support.',
    risks: 'Oil price volatility and global economic conditions may impact performance.'
  },
  'TCS': {
    symbol: 'TCS',
    technicalIndicators: {
      rsi: '62.1 - Neutral to Bullish',
      macd: 'Bullish - EMA20 above EMA50',
      ema20: '₹4089.25 - Price above EMA20',
      ema50: '₹4012.60 - Bullish trend',
      ema200: '₹3876.40 - Long-term uptrend',
      emaCrossover: 'Recent bullish crossover detected',
      bollinger: 'Price above middle band - Strong momentum',
      volume: 'Steady volume - Institutional interest'
    },
    signals: {
      overall: 'STRONG BUY - Confidence: 8/10',
      shortTerm: 'BUY',
      mediumTerm: 'BUY',
      longTerm: 'BUY'
    },
    keyLevels: {
      support: ['₹4012.60', '₹3950.00'],
      resistance: ['₹4180.00', '₹4250.00'],
      targetPrice: '₹4350.00',
      stopLoss: '₹3920.00'
    },
    emaCrossoverStrategy: {
      status: 'Fresh bullish EMA crossover detected!',
      signal: 'BUY',
      entry: '₹4100.00',
      confidence: '8'
    },
    summary: 'TCS shows strong bullish momentum with fresh EMA crossover. IT sector recovery supports upside potential.',
    risks: 'Global IT spending slowdown and currency fluctuations are key risks.'
  }
};

export function getMockStockPrice(symbol: string): any {
  const baseData = mockStockData[symbol.toUpperCase()];
  if (!baseData) {
    return {
      symbol: symbol,
      exchange: 'NSE',
      currentPrice: (Math.random() * 1000 + 500).toFixed(2),
      previousClose: (Math.random() * 1000 + 500).toFixed(2),
      change: (Math.random() * 50 - 25).toFixed(2),
      changePercent: (Math.random() * 5 - 2.5).toFixed(2),
      volume: Math.floor(Math.random() * 5000000).toString(),
      marketCap: 'N/A',
      pe: (Math.random() * 30 + 10).toFixed(1),
      dayHigh: (Math.random() * 1000 + 500).toFixed(2),
      dayLow: (Math.random() * 1000 + 500).toFixed(2),
      week52High: (Math.random() * 1200 + 600).toFixed(2),
      week52Low: (Math.random() * 800 + 300).toFixed(2),
      sector: 'Unknown',
      companyName: `${symbol} Limited`,
      lastUpdated: new Date().toISOString(),
      note: 'Mock data for development'
    };
  }
  
  // Add some random variation to make it look live
  const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
  const currentPrice = parseFloat(baseData.currentPrice);
  const newPrice = currentPrice * (1 + variation);
  const change = newPrice - parseFloat(baseData.previousClose);
  const changePercent = (change / parseFloat(baseData.previousClose)) * 100;
  
  return {
    ...baseData,
    currentPrice: newPrice.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    lastUpdated: new Date().toISOString(),
    note: 'Mock data with live variation'
  };
}

export function getMockTechnicalAnalysis(symbol: string): any {
  return mockTechnicalAnalysis[symbol.toUpperCase()] || {
    symbol: symbol,
    technicalIndicators: {
      rsi: '50.0 - Neutral',
      macd: 'Neutral - EMA20 near EMA50',
      ema20: '₹0.00 - Calculating...',
      ema50: '₹0.00 - Calculating...',
      ema200: '₹0.00 - Calculating...',
      emaCrossover: 'No recent crossover',
      bollinger: 'Price near middle band',
      volume: 'Average volume'
    },
    signals: {
      overall: 'HOLD - Confidence: 5/10',
      shortTerm: 'HOLD',
      mediumTerm: 'HOLD',
      longTerm: 'HOLD'
    },
    keyLevels: {
      support: ['₹0.00', '₹0.00'],
      resistance: ['₹0.00', '₹0.00'],
      targetPrice: '₹0.00',
      stopLoss: '₹0.00'
    },
    emaCrossoverStrategy: {
      status: 'Insufficient data for analysis',
      signal: 'WAIT',
      entry: '₹0.00',
      confidence: '5'
    },
    summary: `${symbol} technical analysis is being calculated. Please try again in a few moments.`,
    risks: 'General market risks apply. Conduct thorough research before investing.',
    lastUpdated: new Date().toISOString(),
    note: 'Mock analysis data'
  };
}
