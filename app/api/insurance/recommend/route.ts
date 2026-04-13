import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const recommendSchema = z.object({
  annualIncome: z.number(),
  dependents: z.number().default(0),
  age: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { annualIncome, dependents, age } = recommendSchema.parse(body);

    // Calculate recommendations
    const recommendations = [];

    // Term Life Insurance
    const termCoverage = annualIncome * 12; // 10-15x annual income
    const termPremiumEstimate = termCoverage * 0.006; // ~0.5-1% of coverage
    recommendations.push({
      type: 'Term Life',
      coverage: termCoverage,
      premium: Math.round(termPremiumEstimate / 12), // monthly
      premiumYearly: Math.round(termPremiumEstimate),
      reason: 'Covers 12x annual income for family protection',
      priority: 'High',
      ageImpact: age > 40 ? 'Premium increases with age. Act soon.' : 'Good time to lock in low premiums.',
    });

    // Health Insurance
    const baseHealthCoverage = 500000; // 5L base
    const dependentCoverage = dependents * 300000; // 3L per dependent
    const totalHealthCoverage = baseHealthCoverage + dependentCoverage;
    const healthPremium = 15000 + dependents * 8000; // Heuristic
    recommendations.push({
      type: 'Health',
      coverage: totalHealthCoverage,
      premium: Math.round(healthPremium / 12),
      premiumYearly: healthPremium,
      reason: `₹${(baseHealthCoverage / 100000).toFixed(0)}L base + ₹${((dependentCoverage / 100000) || 0).toFixed(0)}L for ${dependents} dependent(s)`,
      priority: 'High',
      deductible: 'Consider ₹25K deductible for lower premium',
    });

    // Motor Insurance (if applicable)
    if (annualIncome > 300000) {
      recommendations.push({
        type: 'Motor',
        coverage: 'Comprehensive',
        premium: 8000, // yearly estimate
        premiumYearly: 8000,
        reason: 'Protects your vehicle and third-party liability',
        priority: 'Medium',
        note: 'Required by law for vehicle owners',
      });
    }

    // Travel Insurance
    if (annualIncome > 600000) {
      recommendations.push({
        type: 'Travel',
        coverage: 'Multi-trip Annual',
        premium: 1500,
        premiumYearly: 1500,
        reason: 'Covers medical emergencies and trip cancellations abroad',
        priority: 'Low',
        note: 'Optional, for frequent travelers',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        totalMonthly: recommendations.reduce((sum, r) => sum + (r.premium || 0), 0),
        totalYearly: recommendations.reduce((sum, r) => sum + (r.premiumYearly || 0), 0),
        summary: {
          lifeCoverage: termCoverage,
          healthCoverage: totalHealthCoverage,
          affordabilityCheck: (recommendations.reduce((sum, r) => sum + (r.premiumYearly || 0), 0) / annualIncome * 100).toFixed(1) + '% of annual income',
        },
      },
    });
  } catch (error) {
    console.error('Insurance recommend error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
