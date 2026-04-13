import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // EMA Crossover Strategy Recommendations (Mock Data)
    const recommendationsData = {
      recommendations: [
        {
          symbol: "RELIANCE",
          companyName: "Reliance Industries Limited",
          sector: "Oil & Gas",
          currentPrice: "2847",
          emaCrossoverDate: "Nov 8, 2025",
          signal: "BUY",
          targetPrice: "3100",
          stopLoss: "2720",
          confidence: "8",
          reasoning: "Strong EMA crossover with volume support. Oil prices stabilizing and new energy ventures showing promise.",
          timeframe: "3-6 months"
        },
        {
          symbol: "TCS",
          companyName: "Tata Consultancy Services",
          sector: "IT Services",
          currentPrice: "4128",
          emaCrossoverDate: "Nov 10, 2025",
          signal: "STRONG_BUY",
          targetPrice: "4500",
          stopLoss: "3920",
          confidence: "9",
          reasoning: "Fresh bullish crossover with IT sector recovery. Strong Q3 results and improved client spending.",
          timeframe: "2-4 months"
        },
        {
          symbol: "HDFCBANK",
          companyName: "HDFC Bank Limited",
          sector: "Banking",
          currentPrice: "1742",
          emaCrossoverDate: "Nov 9, 2025",
          signal: "BUY",
          targetPrice: "1900",
          stopLoss: "1650",
          confidence: "7",
          reasoning: "Banking sector showing signs of recovery. EMA crossover with good volume participation.",
          timeframe: "4-6 months"
        },
        {
          symbol: "INFY",
          companyName: "Infosys Limited",
          sector: "IT Services",
          currentPrice: "1846",
          emaCrossoverDate: "Nov 7, 2025",
          signal: "BUY",
          targetPrice: "2000",
          stopLoss: "1750",
          confidence: "8",
          reasoning: "Strong technical setup with improving fundamentals. Digital transformation demand remains robust.",
          timeframe: "3-5 months"
        },
        {
          symbol: "ICICIBANK",
          companyName: "ICICI Bank Limited",
          sector: "Banking",
          currentPrice: "1267",
          emaCrossoverDate: "Nov 6, 2025",
          signal: "BUY",
          targetPrice: "1400",
          stopLoss: "1200",
          confidence: "7",
          reasoning: "Private banking leader with strong asset quality. Technical breakout with volume confirmation.",
          timeframe: "4-7 months"
        }
      ],
      marketOverview: {
        trend: "Cautiously optimistic with selective opportunities",
        sentiment: "Mixed - Quality stocks showing strength",
        keyFactors: [
          "Global economic uncertainty",
          "Domestic consumption recovery",
          "Corporate earnings improvement",
          "FII/DII flow dynamics"
        ]
      },
      strategy: {
        description: "EMA crossover strategy identifies momentum shifts when 20-day EMA crosses above 50-day EMA, indicating potential uptrend initiation",
        riskLevel: "MEDIUM",
        timeHorizon: "3-6 months for optimal results",
        tips: [
          "Always use stop losses to limit downside risk",
          "Diversify across sectors to reduce concentration risk",
          "Monitor volume confirmation for crossover signals",
          "Consider market conditions and news flow",
          "Book partial profits at target levels"
        ]
      },
      disclaimer: "This is for educational purposes only. Past performance does not guarantee future results. Please consult a qualified financial advisor before making investment decisions.",
      lastUpdated: new Date().toISOString(),
      note: "EMA crossover recommendations based on technical analysis"
    };

    return NextResponse.json(recommendationsData);

  } catch (error) {
    console.error('Error generating stock recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate stock recommendations' },
      { status: 500 }
    );
  }
}
