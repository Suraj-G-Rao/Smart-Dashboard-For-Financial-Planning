// Comprehensive Indian Stock Symbol Mapping for Yahoo Finance
// Maps common names/search terms to exact Yahoo Finance symbols

export interface StockInfo {
  symbol: string;
  yahooSymbol: string;
  companyName: string;
  sector: string;
  exchange: 'NSE' | 'BSE';
}

export const INDIAN_STOCKS: Record<string, StockInfo> = {
  // Large Cap IT Stocks
  'TCS': {
    symbol: 'TCS',
    yahooSymbol: 'TCS.NS',
    companyName: 'Tata Consultancy Services Limited',
    sector: 'Information Technology',
    exchange: 'NSE'
  },
  'INFY': {
    symbol: 'INFY',
    yahooSymbol: 'INFY.NS',
    companyName: 'Infosys Limited',
    sector: 'Information Technology',
    exchange: 'NSE'
  },
  'WIPRO': {
    symbol: 'WIPRO',
    yahooSymbol: 'WIPRO.NS',
    companyName: 'Wipro Limited',
    sector: 'Information Technology',
    exchange: 'NSE'
  },
  'HCLTECH': {
    symbol: 'HCLTECH',
    yahooSymbol: 'HCLTECH.NS',
    companyName: 'HCL Technologies Limited',
    sector: 'Information Technology',
    exchange: 'NSE'
  },
  'TECHM': {
    symbol: 'TECHM',
    yahooSymbol: 'TECHM.NS',
    companyName: 'Tech Mahindra Limited',
    sector: 'Information Technology',
    exchange: 'NSE'
  },

  // Banking Stocks
  'HDFCBANK': {
    symbol: 'HDFCBANK',
    yahooSymbol: 'HDFCBANK.NS',
    companyName: 'HDFC Bank Limited',
    sector: 'Banking',
    exchange: 'NSE'
  },
  'ICICIBANK': {
    symbol: 'ICICIBANK',
    yahooSymbol: 'ICICIBANK.NS',
    companyName: 'ICICI Bank Limited',
    sector: 'Banking',
    exchange: 'NSE'
  },
  'SBIN': {
    symbol: 'SBIN',
    yahooSymbol: 'SBIN.NS',
    companyName: 'State Bank of India',
    sector: 'Banking',
    exchange: 'NSE'
  },
  'AXISBANK': {
    symbol: 'AXISBANK',
    yahooSymbol: 'AXISBANK.NS',
    companyName: 'Axis Bank Limited',
    sector: 'Banking',
    exchange: 'NSE'
  },
  'KOTAKBANK': {
    symbol: 'KOTAKBANK',
    yahooSymbol: 'KOTAKBANK.NS',
    companyName: 'Kotak Mahindra Bank Limited',
    sector: 'Banking',
    exchange: 'NSE'
  },

  // Oil & Gas
  'RELIANCE': {
    symbol: 'RELIANCE',
    yahooSymbol: 'RELIANCE.NS',
    companyName: 'Reliance Industries Limited',
    sector: 'Oil & Gas',
    exchange: 'NSE'
  },
  'ONGC': {
    symbol: 'ONGC',
    yahooSymbol: 'ONGC.NS',
    companyName: 'Oil and Natural Gas Corporation Limited',
    sector: 'Oil & Gas',
    exchange: 'NSE'
  },
  'IOC': {
    symbol: 'IOC',
    yahooSymbol: 'IOC.NS',
    companyName: 'Indian Oil Corporation Limited',
    sector: 'Oil & Gas',
    exchange: 'NSE'
  },

  // Pharmaceuticals
  'SUNPHARMA': {
    symbol: 'SUNPHARMA',
    yahooSymbol: 'SUNPHARMA.NS',
    companyName: 'Sun Pharmaceutical Industries Limited',
    sector: 'Pharmaceuticals',
    exchange: 'NSE'
  },
  'DRREDDY': {
    symbol: 'DRREDDY',
    yahooSymbol: 'DRREDDY.NS',
    companyName: 'Dr. Reddys Laboratories Limited',
    sector: 'Pharmaceuticals',
    exchange: 'NSE'
  },
  'CIPLA': {
    symbol: 'CIPLA',
    yahooSymbol: 'CIPLA.NS',
    companyName: 'Cipla Limited',
    sector: 'Pharmaceuticals',
    exchange: 'NSE'
  },

  // Automobiles
  'MARUTI': {
    symbol: 'MARUTI',
    yahooSymbol: 'MARUTI.NS',
    companyName: 'Maruti Suzuki India Limited',
    sector: 'Automobiles',
    exchange: 'NSE'
  },
  'TATAMOTORS': {
    symbol: 'TATAMOTORS',
    yahooSymbol: 'TATAMOTORS.NS',
    companyName: 'Tata Motors Limited',
    sector: 'Automobiles',
    exchange: 'NSE'
  },
  'M&M': {
    symbol: 'M&M',
    yahooSymbol: 'M&M.NS',
    companyName: 'Mahindra & Mahindra Limited',
    sector: 'Automobiles',
    exchange: 'NSE'
  },

  // FMCG
  'HINDUNILVR': {
    symbol: 'HINDUNILVR',
    yahooSymbol: 'HINDUNILVR.NS',
    companyName: 'Hindustan Unilever Limited',
    sector: 'FMCG',
    exchange: 'NSE'
  },
  'ITC': {
    symbol: 'ITC',
    yahooSymbol: 'ITC.NS',
    companyName: 'ITC Limited',
    sector: 'FMCG',
    exchange: 'NSE'
  },
  'NESTLEIND': {
    symbol: 'NESTLEIND',
    yahooSymbol: 'NESTLEIND.NS',
    companyName: 'Nestle India Limited',
    sector: 'FMCG',
    exchange: 'NSE'
  },

  // Metals & Mining
  'TATASTEEL': {
    symbol: 'TATASTEEL',
    yahooSymbol: 'TATASTEEL.NS',
    companyName: 'Tata Steel Limited',
    sector: 'Metals & Mining',
    exchange: 'NSE'
  },
  'HINDALCO': {
    symbol: 'HINDALCO',
    yahooSymbol: 'HINDALCO.NS',
    companyName: 'Hindalco Industries Limited',
    sector: 'Metals & Mining',
    exchange: 'NSE'
  },
  'JSWSTEEL': {
    symbol: 'JSWSTEEL',
    yahooSymbol: 'JSWSTEEL.NS',
    companyName: 'JSW Steel Limited',
    sector: 'Metals & Mining',
    exchange: 'NSE'
  },

  // Cement
  'ULTRACEMCO': {
    symbol: 'ULTRACEMCO',
    yahooSymbol: 'ULTRACEMCO.NS',
    companyName: 'UltraTech Cement Limited',
    sector: 'Cement',
    exchange: 'NSE'
  },
  'SHREECEM': {
    symbol: 'SHREECEM',
    yahooSymbol: 'SHREECEM.NS',
    companyName: 'Shree Cement Limited',
    sector: 'Cement',
    exchange: 'NSE'
  },

  // Telecom
  'BHARTIARTL': {
    symbol: 'BHARTIARTL',
    yahooSymbol: 'BHARTIARTL.NS',
    companyName: 'Bharti Airtel Limited',
    sector: 'Telecommunications',
    exchange: 'NSE'
  },

  // Power
  'NTPC': {
    symbol: 'NTPC',
    yahooSymbol: 'NTPC.NS',
    companyName: 'NTPC Limited',
    sector: 'Power',
    exchange: 'NSE'
  },
  'POWERGRID': {
    symbol: 'POWERGRID',
    yahooSymbol: 'POWERGRID.NS',
    companyName: 'Power Grid Corporation of India Limited',
    sector: 'Power',
    exchange: 'NSE'
  },

  // Healthcare/Diagnostics - VIMATA LAB CORRECTION
  'VIMTALABS': {
    symbol: 'VIMTALABS',
    yahooSymbol: 'VIMTALABS.NS',
    companyName: 'Vimta Labs Limited',
    sector: 'Healthcare',
    exchange: 'NSE'
  },
  'VIMATA': {
    symbol: 'VIMTALABS', // Redirect VIMATA to correct symbol
    yahooSymbol: 'VIMTALABS.NS',
    companyName: 'Vimta Labs Limited',
    sector: 'Healthcare',
    exchange: 'NSE'
  },

  // Financial Services
  'BAJFINANCE': {
    symbol: 'BAJFINANCE',
    yahooSymbol: 'BAJFINANCE.NS',
    companyName: 'Bajaj Finance Limited',
    sector: 'Financial Services',
    exchange: 'NSE'
  },
  'BAJAJFINSV': {
    symbol: 'BAJAJFINSV',
    yahooSymbol: 'BAJAJFINSV.NS',
    companyName: 'Bajaj Finserv Limited',
    sector: 'Financial Services',
    exchange: 'NSE'
  },

  // Paints
  'ASIANPAINT': {
    symbol: 'ASIANPAINT',
    yahooSymbol: 'ASIANPAINT.NS',
    companyName: 'Asian Paints Limited',
    sector: 'Paints',
    exchange: 'NSE'
  }
};

// Search function to find stocks by partial name match
export function searchStocks(query: string): StockInfo[] {
  const searchTerm = query.toUpperCase().trim();
  const results: StockInfo[] = [];
  
  // Exact symbol match first
  if (INDIAN_STOCKS[searchTerm]) {
    results.push(INDIAN_STOCKS[searchTerm]);
  }
  
  // Partial matches in company name or symbol
  Object.values(INDIAN_STOCKS).forEach(stock => {
    if (stock.symbol !== searchTerm && 
        (stock.symbol.includes(searchTerm) || 
         stock.companyName.toUpperCase().includes(searchTerm))) {
      results.push(stock);
    }
  });
  
  return results.slice(0, 10); // Limit to 10 results
}

// Get correct Yahoo Finance symbol
export function getYahooSymbol(inputSymbol: string): string {
  const upperSymbol = inputSymbol.toUpperCase().trim();
  const stockInfo = INDIAN_STOCKS[upperSymbol];
  
  if (stockInfo) {
    return stockInfo.yahooSymbol;
  }
  
  // If not found, assume it's already a Yahoo symbol or add .NS
  if (inputSymbol.includes('.')) {
    return inputSymbol;
  }
  
  return `${inputSymbol.toUpperCase()}.NS`;
}

// Get stock info by symbol
export function getStockInfo(symbol: string): StockInfo | null {
  const upperSymbol = symbol.toUpperCase().trim();
  return INDIAN_STOCKS[upperSymbol] || null;
}
