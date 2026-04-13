import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const secretSchema = z.object({
  title: z.string(),
  type: z.enum(['password', 'note']),
  secret: z.object({
    iv: z.string(),
    cipher: z.string(),
    tag: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, secret } = secretSchema.parse(body);

    // Create vault item with encrypted secret
    const { data: vaultItem, error: dbError } = await supabase
      .from('vault_items')
      .insert({
        user_id: user.id,
        title,
        type,
        secret,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create vault item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vaultItem,
    });
  } catch (error) {
    console.error('Vault secret error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save secret' },
      { status: 500 }
    );
  }
}
