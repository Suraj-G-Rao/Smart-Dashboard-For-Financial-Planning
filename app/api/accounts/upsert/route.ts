import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const accountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(['bank', 'wallet', 'card']),
  balance: z.number().default(0),
  card_number: z.string().optional(),
  expiry_date: z.string().optional(),
  credit_limit: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = accountSchema.parse(body);

    if (input.id) {
      // Update
      const { data, error } = await supabase
        .from('accounts')
        .update({
          name: input.name,
          type: input.type,
          balance: input.balance,
          card_number: input.card_number,
          expiry_date: input.expiry_date,
          credit_limit: input.credit_limit,
        })
        .eq('id', input.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else {
      // Create
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: input.name,
          type: input.type,
          balance: input.balance,
          card_number: input.card_number,
          expiry_date: input.expiry_date,
          credit_limit: input.credit_limit,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
  } catch (error: any) {
    console.error('Account upsert error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save account' },
      { status: 500 }
    );
  }
}
