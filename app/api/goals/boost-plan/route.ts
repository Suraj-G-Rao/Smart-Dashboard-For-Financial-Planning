import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { callGemini } from '@/lib/llm';

const boostPlanSchema = z.object({
  goal: z.string(),
  remaining: z.number(),
  monthlySavings: z.number(),
  topCategories: z.array(z.tuple([z.string(), z.number()])),
});

interface BoostRecommendation {
  change: string;
  estMonthlyImpact: number;
  reason: string;
}

interface BoostResponse {
  recommendations: BoostRecommendation[];
}

async function getBoostPlan(goal: string, remaining: number, monthlySavings: number, topCategories: [string, number][]): Promise<BoostResponse> {
  try {
    const systemPrompt = `You are a highly specific, data-driven financial advisor for India. Currency is INR (₹).

Your job is to analyze spending patterns and provide ULTRA-SPECIFIC, ACTIONABLE recommendations with exact numbers and realistic alternatives.

CRITICAL RULES:
1. Be EXTREMELY SPECIFIC - mention exact daily/weekly amounts, specific alternatives, real brands/services
2. Use REAL INDIAN context - Swiggy, Zomato, Ola, Uber, local alternatives
3. Calculate REALISTIC savings - break down monthly to daily/weekly for clarity
4. Provide CONCRETE actions - not "reduce spending" but "cook 3 meals/week instead of ordering"
5. Include SPECIFIC alternatives - "Switch from Uber (₹200/trip) to Metro (₹40/trip)"

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "change": "Ultra-specific action with exact numbers and alternatives",
      "estMonthlyImpact": realistic_positive_number_in_INR,
      "reason": "Detailed breakdown showing daily/weekly impact with specific examples"
    }
  ]
}

EXAMPLE GOOD RECOMMENDATIONS:
❌ BAD: "Reduce food spending by 20%"
✅ GOOD: "You spend ₹400/day on food delivery. Cook dinner 4 nights/week instead of ordering → Save ₹6,400/month"

❌ BAD: "Optimize travel expenses"
✅ GOOD: "Switch from Ola/Uber (avg ₹180/trip) to Metro for work commute (₹40/trip) → Save ₹2,800/month on 20 trips"

❌ BAD: "Cancel unused subscriptions"
✅ GOOD: "Your Netflix (₹649) + Prime (₹299) + Spotify (₹119) = ₹1,067/month. Share family plans or use free alternatives → Save ₹800/month"

Rules:
- Provide exactly 3 recommendations
- Each must be ULTRA-SPECIFIC with exact amounts and alternatives
- Focus on highest-impact changes first
- Be motivational but realistic
- Use Indian brands, services, and context`;

    const userPayload = {
      goal: goal,
      remainingAmount: remaining,
      currentMonthlySavings: monthlySavings,
      topSpendingCategories: topCategories,
      context: `User needs to save ₹${remaining.toLocaleString('en-IN')} more for their goal "${goal}". They currently save ₹${monthlySavings.toLocaleString('en-IN')} per month. 

Their top spending categories are:
${topCategories.map(([cat, amt], idx) => `${idx + 1}. ${cat}: ₹${amt.toLocaleString('en-IN')}/month (₹${Math.round(amt / 30)}/day)`).join('\n')}

Provide ULTRA-SPECIFIC recommendations with exact daily/weekly breakdowns and realistic Indian alternatives.`
    };

    const response = await callGemini(systemPrompt, userPayload);

    if (response && response.recommendations && Array.isArray(response.recommendations)) {
      return {
        recommendations: response.recommendations.slice(0, 3) // Ensure max 3 recommendations
      };
    }

    throw new Error('Invalid response format from Gemini');

  } catch (error) {
    console.error('Gemini API error:', error);

    // ENHANCED fallback recommendations with specific details
    const fallbackRecommendations: BoostRecommendation[] = [];

    // Recommendation 1: Specific reduction in top category (more realistic)
    if (topCategories && topCategories.length > 0) {
      const [topCategory, topAmount] = topCategories[0];
      const dailyAmount = Math.round(topAmount / 30);
      // More conservative: 15-20% reduction instead of 25%
      const reduction = Math.max(Math.round(topAmount * 0.15), 800);

      let specificAdvice = '';
      let specificReason = '';

      if (topCategory.toLowerCase().includes('food') || topCategory.toLowerCase().includes('dining')) {
        specificAdvice = `Cook at home 2-3 times/week instead of ordering`;
        specificReason = `You spend ₹${dailyAmount.toLocaleString('en-IN')}/day on food (₹${topAmount.toLocaleString('en-IN')}/month). Cooking just 2-3 dinners/week saves ₹150-200/meal = ₹${reduction.toLocaleString('en-IN')}/month. Start small and build the habit!`;
      } else if (topCategory.toLowerCase().includes('travel') || topCategory.toLowerCase().includes('transport')) {
        specificAdvice = `Use Metro/bus 2-3 days/week for commute`;
        specificReason = `You spend ₹${topAmount.toLocaleString('en-IN')}/month on travel. Switching from cab (₹150-200) to Metro (₹40) even 2-3 days/week saves ₹${reduction.toLocaleString('en-IN')}/month.`;
      } else if (topCategory.toLowerCase().includes('shopping') || topCategory.toLowerCase().includes('retail')) {
        specificAdvice = `Wait 48 hours before non-essential purchases over ₹500`;
        specificReason = `You spend ₹${topAmount.toLocaleString('en-IN')}/month on shopping. The 48-hour rule helps avoid impulse buys, saving 15-20% = ₹${reduction.toLocaleString('en-IN')}/month.`;
      } else {
        specificAdvice = `Reduce ${topCategory} by finding one cheaper alternative`;
        specificReason = `${topCategory} costs ₹${dailyAmount.toLocaleString('en-IN')}/day. Finding just ONE cheaper alternative or reducing frequency slightly saves ₹${reduction.toLocaleString('en-IN')}/month.`;
      }

      fallbackRecommendations.push({
        change: specificAdvice,
        estMonthlyImpact: reduction,
        reason: specificReason
      });
    }

    // Recommendation 2: Specific action for second category (realistic)
    if (topCategories && topCategories.length > 1) {
      const [secondCategory, secondAmount] = topCategories[1];
      // Conservative: 10-15% reduction
      const reduction = Math.max(Math.round(secondAmount * 0.12), 500);
      const dailyAmount = Math.round(secondAmount / 30);

      let specificAdvice = '';
      let specificReason = '';

      if (secondCategory.toLowerCase().includes('subscription') || secondCategory.toLowerCase().includes('entertainment')) {
        specificAdvice = `Review and cancel 1-2 unused subscriptions`;
        specificReason = `Check Netflix, Prime, Spotify, gym memberships. Most people have 1-2 they rarely use. Canceling even one saves ₹${reduction.toLocaleString('en-IN')}/month.`;
      } else if (secondCategory.toLowerCase().includes('coffee') || secondCategory.toLowerCase().includes('cafe')) {
        specificAdvice = `Bring coffee from home 2 days/week`;
        specificReason = `Café coffee costs ₹150-200. Making it at home (₹20) just 2 days/week saves ₹130 × 8 = ₹${Math.min(reduction, 1000).toLocaleString('en-IN')}/month.`;
      } else {
        specificAdvice = `Look for one discount/cashback opportunity in ${secondCategory}`;
        specificReason = `You spend ₹${dailyAmount.toLocaleString('en-IN')}/day on ${secondCategory}. Using coupons, cashback apps, or buying during sales saves 10-15% = ₹${reduction.toLocaleString('en-IN')}/month.`;
      }

      fallbackRecommendations.push({
        change: specificAdvice,
        estMonthlyImpact: reduction,
        reason: specificReason
      });
    }

    // Recommendation 3: Automated savings (realistic and achievable)
    // More conservative: spread over 15-18 months instead of 10
    const targetIncrease = Math.max(Math.round(remaining / 15), 1000);
    const monthlyTarget = Math.min(targetIncrease, 3000); // Cap at ₹3000 to be realistic

    fallbackRecommendations.push({
      change: `Auto-save ₹${monthlyTarget.toLocaleString('en-IN')} on salary day (start small!)`,
      estMonthlyImpact: monthlyTarget,
      reason: `Set up auto-transfer for ₹${monthlyTarget.toLocaleString('en-IN')} every month. It's easier to save what you don't see. You'll reach ₹${remaining.toLocaleString('en-IN')} in ${Math.ceil(remaining / monthlyTarget)} months. Start with this amount and increase later!`
    });

    console.log('Using enhanced fallback recommendations:', fallbackRecommendations);

    return {
      recommendations: fallbackRecommendations.slice(0, 3)
    };
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Boost plan request body:', body);

    const validated = boostPlanSchema.parse(body);
    console.log('Validated data:', validated);

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return Response.json({
        error: 'Configuration error',
        message: 'AI service not configured'
      }, { status: 500 });
    }

    console.log('Calling getBoostPlan with:', {
      goal: validated.goal,
      remaining: validated.remaining,
      monthlySavings: validated.monthlySavings,
      topCategories: validated.topCategories
    });

    const boostPlan = await getBoostPlan(
      validated.goal,
      validated.remaining,
      validated.monthlySavings,
      validated.topCategories
    );

    console.log('Generated boost plan:', boostPlan);
    return Response.json(boostPlan);

  } catch (error: any) {
    console.error('Boost plan error:', error);
    console.error('Error stack:', error.stack);

    if (error instanceof z.ZodError) {
      return Response.json({
        error: 'Invalid input',
        details: error.errors,
        message: 'Please check the request format'
      }, { status: 400 });
    }

    // Return more detailed error for debugging
    return Response.json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
