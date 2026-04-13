import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const addPolicySchema = z.object({
  type: z.string(),
  provider: z.string(),
  coverage: z.number(),
  premium: z.number(),
  premiumFrequency: z.enum(['monthly', 'yearly']),
  startDate: z.string(),
  endDate: z.string(),
  policyNumber: z.string().optional(),
  status: z.enum(['Active', 'Planned', 'Expired']).default('Planned'),
  attachmentPath: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const policyData = addPolicySchema.parse(body);

    const { data, error } = await supabase
      .from('insurance_policies')
      .insert({
        user_id: user.id,
        ...policyData,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Add policy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add policy' },
      { status: 500 }
    );
  }
}
