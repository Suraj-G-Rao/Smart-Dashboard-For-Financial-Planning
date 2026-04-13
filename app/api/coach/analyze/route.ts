import { createServerClient } from '@/lib/supabaseServer';
import { getPeriodRange } from '@/lib/period';
import { getIncomeExpenseByDay, zScoreAnomalies } from '@/lib/agg';
import { z } from 'zod';

const analyzeSchema = z.object({
  period: z.enum(['7d', '30d', '90d']),
});

interface CoachTip {
  title: string;
  action: string;
  impactINR: number;
}

interface CoachResponse {
  headline: string;
  tips: CoachTip[];
  riskFlags: string[];
}

async function callGeminiWithCoachData(payload: any): Promise<CoachResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const systemPrompt = `You are FinanceAI Coach for India. Be concise, numeric, and actionable.
Always respond with valid JSON only, no prose.

JSON schema:
{
  "headline": "string",
  "tips": [
    { "title": "string", "action": "string", "impactINR": number }
  ],
  "riskFlags": ["string"]
}
Rules:
- Use INR amounts formatted as integers (no commas in JSON).
- Prefer reductions in the top 1–2 overspent categories.
- If income < expenses, include a runway warning.`;

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
      headline: parsed.headline || 'Financial Analysis Complete',
      tips: parsed.tips || [],
      riskFlags: parsed.riskFlags || [],
    };
  }
  
  throw new Error('Invalid AI response format');
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = analyzeSchema.parse(body);
    
    // Get current period range
    const currentRange = getPeriodRange(validated.period);
    
    // Get previous period range for comparison
    const daysBack = validated.period === '7d' ? 7 : validated.period === '30d' ? 30 : 90;
    const previousFrom = new Date(currentRange.from);
    previousFrom.setDate(previousFrom.getDate() - daysBack);
    const previousTo = new Date(currentRange.from);
    previousTo.setDate(previousTo.getDate() - 1);
    
    const previousRange = {
      from: previousFrom.toISOString().split('T')[0],
      to: previousTo.toISOString().split('T')[0],
    };

    // Fetch data for current period
    const currentData = await getIncomeExpenseByDay(
      user.id,
      currentRange.from,
      currentRange.to
    );

    // Fetch data for previous period
    const previousData = await getIncomeExpenseByDay(
      user.id,
      previousRange.from,
      previousRange.to
    );

    // Calculate totals
    const currentIncome = currentData.income.reduce((sum, val) => sum + val, 0);
    const currentExpenses = currentData.expense.reduce((sum, val) => sum + val, 0);
    const previousIncome = previousData.income.reduce((sum, val) => sum + val, 0);
    const previousExpenses = previousData.expense.reduce((sum, val) => sum + val, 0);

    // Calculate overspend percentage
    const overspendPct = previousExpenses > 0 
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
      : 0;

    // Get top categories
    const topCategories = Object.entries(currentData.byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => [category, amount]);

    // Find anomalies
    const dailyTotals = currentData.expense.map((val, idx) => val);
    const anomalies = zScoreAnomalies(dailyTotals);
    
    const anomalyData = anomalies.map(anomaly => ({
      date: currentData.days[anomaly.index],
      amount: anomaly.value,
      category: 'Uncategorized', // Would need category data for precise mapping
      z: anomaly.z,
    }));

    // Prepare payload for Gemini
    const payload = {
      period: validated.period,
      income: currentIncome,
      expenses: currentExpenses,
      overspendPct: Math.round(overspendPct * 10) / 10,
      topCategories,
      anomalies: anomalyData,
    };

    // Call Gemini for analysis
    let coachResponse: CoachResponse;
    try {
      coachResponse = await callGeminiWithCoachData(payload);
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      // Fallback response
      coachResponse = {
        headline: 'Financial Analysis Complete',
        tips: [
          {
            title: 'Review Top Spending',
            action: `Focus on reducing ${topCategories[0]?.[0] || 'expenses'} by 10%`,
            impactINR: Math.round((Number(topCategories[0]?.[1]) || 1000) * 0.1),
          }
        ],
        riskFlags: currentIncome < currentExpenses ? ['Low runway - expenses exceed income'] : [],
      };
    }

    // Save to insights
    await supabase
      .from('insights')
      .insert({
        user_id: user.id,
        kind: 'coach_tip',
        content: coachResponse,
      });

    return Response.json(coachResponse);

  } catch (error: any) {
    console.error('Coach analysis error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
