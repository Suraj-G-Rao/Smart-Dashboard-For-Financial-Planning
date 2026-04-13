import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getPeriodRange } from '@/lib/period';
import { z } from 'zod';

const forecastSchema = z.object({
  goalId: z.string().uuid(),
  extraMonthly: z.number().optional().default(0),
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const systemPrompt = `You are a motivational finance planner. Currency INR.
Return JSON only:
{ "recommendations": [ { "change": "string", "estMonthlyImpact": number, "reason": "string" } ] }
Rules: 3 items max. estMonthlyImpact is a positive integer in INR.`;

  const payload = {
    goal,
    remaining,
    monthlySavings,
    topCategories,
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: JSON.stringify(payload) }
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Gemini API request failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      recommendations: parsed.recommendations || [],
    };
  }
  
  // Fallback recommendations
  return {
    recommendations: [
      {
        change: `Reduce ${topCategories[0]?.[0] || 'Food'} spending by 15%`,
        estMonthlyImpact: Math.round((topCategories[0]?.[1] || 5000) * 0.15),
        reason: 'Small daily cuts add up fast',
      },
      {
        change: 'Cancel unused subscriptions',
        estMonthlyImpact: 1000,
        reason: 'Review monthly recurring charges',
      },
      {
        change: 'Cook at home 3 more times per week',
        estMonthlyImpact: 2000,
        reason: 'Home-cooked meals save significantly',
      },
    ],
  };
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { goalId, extraMonthly } = forecastSchema.parse(body);

    // Get goal details
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (goalError || !goal) {
      return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Calculate 90-day averages
    const ninetyDayRange = getPeriodRange('90d');
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', user.id)
      .gte('date', ninetyDayRange.from)
      .lte('date', ninetyDayRange.to);

    const monthlyIncome = (transactions || [])
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0) / 3; // 90 days = ~3 months

    const monthlyExpense = Math.abs(
      (transactions || [])
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0) / 3
    );

    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense) + extraMonthly;
    
    const targetAmount = Number(goal.target_amount);
    const savedAmount = Number(goal.saved_amount || 0);
    const remaining = Math.max(0, targetAmount - savedAmount);
    
    const etaMonths = remaining <= 0 ? 0 : Math.ceil(remaining / Math.max(100, monthlySavings));

    const forecastData = {
      monthlyIncome,
      monthlyExpense,
      monthlySavings,
      remaining,
      etaMonths,
    };

    // Save forecast to insights
    await supabase
      .from('insights')
      .insert({
        user_id: user.id,
        kind: 'goal_forecast',
        content: {
          goalId: goalId,
          ...forecastData,
        },
      });

    return Response.json(forecastData);

  } catch (error: any) {
    console.error('Goal forecast error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
