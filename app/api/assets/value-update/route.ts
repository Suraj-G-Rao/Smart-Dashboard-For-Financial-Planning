import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

// Fallback growth rates when AI is unavailable
const FALLBACK_RATES: Record<string, number> = {
  gold: 0.08, // 8% annual
  silver: 0.07, // 7% annual
  land: 0.10, // 10% annual
  flat: 0.08, // 8% annual
  house: 0.08, // 8% annual
  building: 0.09, // 9% annual
  vehicle: -0.15, // -15% annual (depreciation)
  stock: 0.12, // 12% annual
  other: 0.05, // 5% annual
};

async function getAIValuation(asset: any): Promise<{ estimated_value: number; growth_rate_annual: number; notes: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    const prompt = `You are a finance assistant. Estimate updated asset valuation in INR.

Inputs:
- Asset type: ${asset.type}
- Purchase price: ₹${asset.purchase_price}
- Purchase date: ${asset.purchase_date}
- Location: ${asset.location || 'Not specified'}
- Quantity: ${asset.quantity} ${asset.unit || 'units'}
- Description: ${asset.description || 'No description'}

Calculate the current estimated value based on:
- Time elapsed since purchase
- Asset type appreciation/depreciation trends in India
- Location factors (if applicable)

Return ONLY a JSON object with this exact format:
{
  "estimated_value": <number>,
  "growth_rate_annual": <number between -1 and 1>,
  "notes": "<brief explanation>"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
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
        estimated_value: Number(parsed.estimated_value),
        growth_rate_annual: Number(parsed.growth_rate_annual),
        notes: parsed.notes || 'AI estimated value',
      };
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('AI valuation error:', error);
    // Fall back to simple calculation
    return getFallbackValuation(asset);
  }
}

function getFallbackValuation(asset: any): { estimated_value: number; growth_rate_annual: number; notes: string } {
  const purchaseDate = new Date(asset.purchase_date);
  const now = new Date();
  const yearsSincePurchase = (now.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  const growthRate = FALLBACK_RATES[asset.type] || 0.05;
  const estimatedValue = asset.purchase_price * Math.pow(1 + growthRate, yearsSincePurchase);
  
  return {
    estimated_value: Math.round(estimatedValue * 100) / 100,
    growth_rate_annual: growthRate,
    notes: `Estimated using ${growthRate > 0 ? 'appreciation' : 'depreciation'} rate of ${Math.abs(growthRate * 100)}% per year`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Fetch the asset
    const { data: asset, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Get AI valuation
    const valuation = await getAIValuation(asset);

    // Update the asset with new valuation
    const { data: updatedAsset, error: updateError } = await supabase
      .from('assets')
      .update({
        current_value: valuation.estimated_value,
        value_last_updated: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: updatedAsset,
      valuation: {
        ...valuation,
        previous_value: asset.current_value || asset.purchase_price,
      },
    });
  } catch (error: any) {
    console.error('Value update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update asset value' },
      { status: 500 }
    );
  }
}
