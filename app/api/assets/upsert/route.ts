import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const assetSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['land', 'flat', 'house', 'building', 'gold', 'silver', 'vehicle', 'stock', 'other']),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  purchase_price: z.number().positive('Purchase price must be positive'),
  purchase_date: z.string(), // ISO date string
  quantity: z.number().positive().default(1),
  unit: z.string().optional(),
  current_value: z.number().optional(),
  documents: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = assetSchema.parse(body);

    const assetData = {
      type: input.type,
      name: input.name,
      description: input.description,
      location: input.location,
      purchase_price: input.purchase_price,
      purchase_date: input.purchase_date,
      quantity: input.quantity,
      unit: input.unit,
      current_value: input.current_value || input.purchase_price,
      documents: input.documents || [],
      value_last_updated: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      // Update existing asset
      const { data, error } = await supabase
        .from('assets')
        .update(assetData)
        .eq('id', input.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else {
      // Create new asset
      const { data, error } = await supabase
        .from('assets')
        .insert({
          ...assetData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
  } catch (error: any) {
    console.error('Asset upsert error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save asset' },
      { status: 500 }
    );
  }
}
