import { createServerClient } from '@/lib/supabaseServer';
import { z } from 'zod';

const tipSchema = z.object({
  tip: z.object({
    title: z.string(),
    action: z.string(),
    impactINR: z.number(),
  }),
});

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = tipSchema.parse(body);

    // Save tip to insights
    const { error } = await supabase
      .from('insights')
      .insert({
        user_id: user.id,
        kind: 'coach_tip',
        content: validated.tip,
      });

    if (error) throw error;

    return Response.json({ success: true });

  } catch (error: any) {
    console.error('Save tip error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
