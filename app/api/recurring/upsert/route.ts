import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const upsertSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['bill', 'subscription']),
  name: z.string().optional(),
  service: z.string().optional(),
  amount: z.number(),
  category: z.string().optional(),
  cycle: z.enum(['monthly', 'yearly']).optional(),
  due_date: z.string().optional(),
  next_renew: z.string().optional(),
  is_paid: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = upsertSchema.parse(body);

    const table = input.type === 'bill' ? 'bills' : 'subscriptions';
    const dataToInsert: any = { user_id: user.id, ...input };
    delete dataToInsert.type;

    let result;
    if (input.id) {
      const { data, error } = await supabase
        .from(table)
        .update(dataToInsert)
        .eq('id', input.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from(table)
        .insert(dataToInsert)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Upsert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save recurring payment' },
      { status: 500 }
    );
  }
}
