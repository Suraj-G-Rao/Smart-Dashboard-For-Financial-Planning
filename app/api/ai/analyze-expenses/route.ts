import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { expenses, period } = await request.json();

    if (!expenses || expenses.length === 0) {
      return NextResponse.json({
        analysis: {
          summary: "No expenses found for analysis.",
          insights: [],
          recommendations: ["Start tracking your expenses to get personalized insights."],
          spending_patterns: [],
          risk_flags: []
        }
      });
    }

    // Prepare expense data for analysis
    const expenseData = expenses.map((expense: any) => ({
      amount: expense.amount,
      category: expense.category,
      subcategory: expense.subcategory,
      description: expense.description,
      date: expense.date
    }));

    // Calculate basic statistics
    const totalSpent = expenseData.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const avgExpense = totalSpent / expenseData.length;
    
    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    expenseData.forEach((exp: any) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Create prompt for Gemini
    const prompt = `
Analyze the following expense data and provide financial insights:

EXPENSE SUMMARY:
- Total expenses: ₹${totalSpent.toLocaleString()}
- Number of transactions: ${expenseData.length}
- Average expense: ₹${avgExpense.toFixed(2)}
- Analysis period: ${period}

TOP SPENDING CATEGORIES:
${topCategories.map(([cat, amount]) => `- ${cat}: ₹${(amount as number).toLocaleString()}`).join('\n')}

RECENT TRANSACTIONS:
${expenseData.slice(0, 10).map((exp: any) => 
  `- ${exp.date}: ₹${exp.amount} - ${exp.category} (${exp.description})`
).join('\n')}

Please provide a comprehensive financial analysis in the following JSON format:
{
  "summary": "Brief overview of spending patterns (2-3 sentences)",
  "insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"],
  "spending_patterns": ["Pattern observation 1", "Pattern observation 2"],
  "risk_flags": ["Risk flag 1 if any", "Risk flag 2 if any"]
}

Focus on:
1. Spending patterns and trends
2. Category-wise analysis
3. Potential areas for cost optimization
4. Financial health indicators
5. Budgeting recommendations
6. Any concerning spending behaviors

Provide practical, actionable advice suitable for Indian financial context.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysis = {
        summary: "Analysis completed successfully. Your spending patterns show areas for potential optimization.",
        insights: [
          `Total spending: ₹${totalSpent.toLocaleString()} across ${expenseData.length} transactions`,
          `Top spending category: ${topCategories[0]?.[0] || 'Various'} (₹${(topCategories[0]?.[1] as number || 0).toLocaleString()})`,
          `Average transaction: ₹${avgExpense.toFixed(2)}`
        ],
        recommendations: [
          "Review your top spending categories for optimization opportunities",
          "Set monthly budgets for each expense category",
          "Track recurring expenses and look for subscription optimization"
        ],
        spending_patterns: [
          `Most frequent category: ${topCategories[0]?.[0] || 'Various'}`,
          `${expenseData.length} transactions in the analysis period`
        ],
        risk_flags: totalSpent > 50000 ? ["High monthly spending detected"] : []
      };
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Error analyzing expenses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze expenses',
        analysis: {
          summary: "Unable to complete analysis at this time.",
          insights: [],
          recommendations: ["Please try again later or check your expense data."],
          spending_patterns: [],
          risk_flags: []
        }
      },
      { status: 500 }
    );
  }
}
