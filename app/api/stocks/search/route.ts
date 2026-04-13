import { NextRequest, NextResponse } from 'next/server';
import { searchStocks, INDIAN_STOCKS } from '../indian-stock-symbols';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      // Return popular stocks if no query
      const popularStocks = [
        'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 
        'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'ASIANPAINT'
      ].map(symbol => INDIAN_STOCKS[symbol]);

      return NextResponse.json({
        results: popularStocks,
        message: 'Popular Indian stocks'
      });
    }

    const results = searchStocks(query);
    
    return NextResponse.json({
      results: results,
      query: query,
      count: results.length
    });

  } catch (error) {
    console.error('Error searching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const results = searchStocks(query);
    
    return NextResponse.json({
      results: results,
      query: query,
      count: results.length
    });

  } catch (error) {
    console.error('Error searching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    );
  }
}
