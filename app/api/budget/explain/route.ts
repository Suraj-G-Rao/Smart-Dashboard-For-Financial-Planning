import { NextRequest, NextResponse } from 'next/server';
import type { BudgetResult } from '@/lib/budget/engine';

export async function POST(request: NextRequest) {
  try {
    const { summary, allocations, badges } = await request.json();

    // Sanitize data to remove PII
    const sanitizedSummary = {
      essentialsPercentage: Math.round(summary.essentialsPercentage),
      investingPercentage: Math.round(summary.investingPercentage),
      lifestylePercentage: Math.round(summary.lifestylePercentage),
      monthsToEfTarget: summary.monthsToEfTarget,
      hasHighDTI: badges.includes('High DTI'),
      hasOverCapHousing: badges.includes('Over Cap (Housing)'),
      isInvestingAtFloor: badges.includes('Investing at floor'),
    };

    // Generate educational insights based on the budget allocation
    const insights = generateInsights(sanitizedSummary);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI explanation error:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}

function generateInsights(summary: any): string[] {
  const insights: string[] = [];

  // Essentials analysis
  if (summary.essentialsPercentage > 60) {
    insights.push('Your essential expenses are quite high. Consider reviewing subscriptions and finding ways to optimize utility costs.');
  } else if (summary.essentialsPercentage < 40) {
    insights.push('Great job keeping essential expenses low! This gives you more flexibility for investing and lifestyle choices.');
  }

  // Investing analysis
  if (summary.investingPercentage < 15) {
    insights.push('Consider increasing your investment allocation to build long-term wealth. Even a 5% increase can significantly impact your future financial security.');
  } else if (summary.investingPercentage > 30) {
    insights.push('Excellent investment allocation! You\'re well-positioned for long-term wealth building.');
  }

  // Emergency fund analysis
  if (summary.monthsToEfTarget > 24) {
    insights.push('Your emergency fund target will take over 2 years to achieve. Consider increasing monthly contributions or reducing the target to 3-4 months initially.');
  } else if (summary.monthsToEfTarget <= 12) {
    insights.push('You\'re on track to build a solid emergency fund within a year. This provides excellent financial security.');
  }

  // Housing analysis
  if (summary.hasOverCapHousing) {
    insights.push('Housing costs exceed recommended limits for your city tier. Consider relocating or finding ways to reduce housing expenses.');
  }

  // DTI analysis
  if (summary.hasHighDTI) {
    insights.push('High debt-to-income ratio detected. Focus on debt prepayment and avoid taking on additional debt until this improves.');
  }

  // Investing floor analysis
  if (summary.isInvestingAtFloor) {
    insights.push('Investment allocation is at minimum floor due to other priorities. Once debt is managed, consider increasing investments.');
  }

  // Default insight if no specific issues
  if (insights.length === 0) {
    insights.push('Your budget allocation looks well-balanced across essentials, investments, and lifestyle expenses.');
  }

  return insights.slice(0, 4); // Limit to 4 insights
}
