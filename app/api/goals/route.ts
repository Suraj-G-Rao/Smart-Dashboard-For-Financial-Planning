import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  target_amount: z.number().positive('Target amount must be positive'),
  target_date: z.string().refine((date) => new Date(date) > new Date(), 'Target date must be in the future'),
  saved_amount: z.number().min(0, 'Saved amount cannot be negative').optional().default(0),
  priority: z.number().int().min(1).max(3).optional().default(2),
  monthly_sip_required: z.number().min(0).optional().default(0),
  description: z.string().optional(),
  category: z.string().optional().default('General'),
});

const updateGoalSchema = goalSchema.partial();

// GET - Fetch all goals for the authenticated user
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: true })
      .order('target_date', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }

    return Response.json({ goals: goals || [] });

  } catch (error: any) {
    console.error('Goals fetch error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new goal
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = goalSchema.parse(body);

    const { data: goal, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        ...validatedData,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to create goal' }, { status: 500 });
    }

    return Response.json({ goal }, { status: 201 });

  } catch (error: any) {
    console.error('Goal creation error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update an existing goal
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return Response.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const validatedData = updateGoalSchema.parse(updateData);

    const { data: goal, error } = await supabase
      .from('goals')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to update goal' }, { status: 500 });
    }

    if (!goal) {
      return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    return Response.json({ goal });

  } catch (error: any) {
    console.error('Goal update error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a goal
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to delete goal' }, { status: 500 });
    }

    return Response.json({ message: 'Goal deleted successfully' });

  } catch (error: any) {
    console.error('Goal deletion error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
