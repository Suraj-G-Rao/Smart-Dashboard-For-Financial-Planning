import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const addFundsSchema = z.object({
  goalId: z.string().uuid('Invalid goal ID'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { goalId, amount, description } = addFundsSchema.parse(body);

    // First, get the current goal to verify ownership and get current saved amount
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (goalError || !goal) {
      return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Calculate new saved amount
    const newSavedAmount = Number(goal.saved_amount || 0) + amount;

    // Update the goal with new saved amount
    const { data: updatedGoal, error: updateError } = await supabase
      .from('goals')
      .update({ 
        saved_amount: newSavedAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return Response.json({ error: 'Failed to add funds to goal' }, { status: 500 });
    }

    // Create a transaction record for this fund addition
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        amount: amount,
        category: 'Goal Contribution',
        description: description || `Added funds to ${goal.name}`,
        merchant: 'Goal Savings',
      });

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      // Don't fail the request if transaction creation fails, just log it
    }

    // Create an insight record for this achievement
    const progress = Math.min((newSavedAmount / Number(goal.target_amount)) * 100, 100);
    
    if (progress >= 100) {
      await supabase
        .from('insights')
        .insert({
          user_id: user.id,
          kind: 'goal_achievement',
          content: {
            goalId: goalId,
            goalName: goal.name,
            targetAmount: goal.target_amount,
            achievedAmount: newSavedAmount,
            message: `Congratulations! You've achieved your goal: ${goal.name}!`,
          },
        });
    } else if (progress >= 50 && (Number(goal.saved_amount || 0) / Number(goal.target_amount)) * 100 < 50) {
      await supabase
        .from('insights')
        .insert({
          user_id: user.id,
          kind: 'goal_milestone',
          content: {
            goalId: goalId,
            goalName: goal.name,
            progress: progress,
            message: `Great progress! You're halfway to your ${goal.name} goal!`,
          },
        });
    }

    return Response.json({ 
      goal: updatedGoal,
      message: 'Funds added successfully',
      newProgress: progress
    });

  } catch (error: any) {
    console.error('Add funds error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
