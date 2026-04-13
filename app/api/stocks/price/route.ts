import { NextRequest, NextResponse } from 'next/server';
import { getMockStockPrice } from '../mock-data';
import { getYahooSymbol, getStockInfo } from '../indian-stock-symbols';

export async function POST(request: NextRequest) {
  try {
    const { symbol, exchange = 'NSE' } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    // Get correct Yahoo Finance symbol using our mapping
    const yahooSymbol = getYahooSymbol(symbol);
    const stockInfo = getStockInfo(symbol);
    
    console.log(`Searching for: ${symbol} -> Yahoo Symbol: ${yahooSymbol}`);

    // Use Yahoo Finance API with proper headers to avoid CORS issues
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
    
    try {
      const response = await fetch(yahooUrl, {
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
        throw new Error('No data found');
      }
      
      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      const currentPrice = meta.regularMarketPrice || 0;
      const previousClose = meta.previousClose || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      // Get additional info from Yahoo Finance quote API
      const quoteUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=summaryDetail,price,defaultKeyStatistics`;
      let additionalInfo: any = {};
      
      try {
        const quoteResponse = await fetch(quoteUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!quoteResponse.ok) {
          console.log(`Quote API error: ${quoteResponse.status}`);
        } else {
          const quoteData = await quoteResponse.json();
          if (quoteData.quoteSummary && quoteData.quoteSummary.result) {
            const summaryDetail = quoteData.quoteSummary.result[0]?.summaryDetail || {};
            const price = quoteData.quoteSummary.result[0]?.price || {};
            const keyStats = quoteData.quoteSummary.result[0]?.defaultKeyStatistics || {};
            
            additionalInfo = {
              marketCap: keyStats.marketCap?.fmt || 'N/A',
              pe: summaryDetail.trailingPE?.fmt || 'N/A',
              volume: meta.regularMarketVolume || 0,
              dayHigh: summaryDetail.dayHigh?.raw || meta.regularMarketDayHigh || 0,
              dayLow: summaryDetail.dayLow?.raw || meta.regularMarketDayLow || 0,
              week52High: summaryDetail.fiftyTwoWeekHigh?.raw || 0,
              week52Low: summaryDetail.fiftyTwoWeekLow?.raw || 0,
              sector: price.quoteSourceName || 'Unknown',
              companyName: price.longName || price.shortName || symbol
            };
          }
        }
      } catch (quoteError) {
        console.log('Could not fetch additional quote data:', quoteError);
      }
      
      const stockData = {
        symbol: symbol,
        exchange: stockInfo?.exchange || exchange,
        currentPrice: currentPrice.toFixed(2),
        previousClose: previousClose.toFixed(2),
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
        volume: (additionalInfo.volume || meta.regularMarketVolume || 0).toString(),
        marketCap: additionalInfo.marketCap || 'N/A',
        pe: additionalInfo.pe || 'N/A',
        dayHigh: (additionalInfo.dayHigh || meta.regularMarketDayHigh || 0).toFixed(2),
        dayLow: (additionalInfo.dayLow || meta.regularMarketDayLow || 0).toFixed(2),
        week52High: (additionalInfo.week52High || 0).toFixed(2),
        week52Low: (additionalInfo.week52Low || 0).toFixed(2),
        sector: stockInfo?.sector || additionalInfo.sector || 'Unknown',
        companyName: stockInfo?.companyName || additionalInfo.companyName || symbol,
        lastUpdated: new Date().toISOString(),
        yahooSymbol: yahooSymbol
      };
      
      return NextResponse.json(stockData);
      
    } catch (fetchError) {
      console.error('Yahoo Finance API error:', fetchError);
      
      // Use mock data as fallback
      const mockData = getMockStockPrice(symbol);
      mockData.exchange = exchange;
      mockData.note = "Using mock data - Yahoo Finance API unavailable";
      
      return NextResponse.json(mockData);
    }

  } catch (error) {
    console.error('Error fetching stock price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock price' },
      { status: 500 }
    );
  }
}
