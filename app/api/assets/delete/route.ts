import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
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

    // Delete associated documents from storage first
    const { data: asset } = await supabase
      .from('assets')
      .select('documents')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (asset?.documents && asset.documents.length > 0) {
      // Delete files from storage
      const { error: storageError } = await supabase.storage
        .from('assets-docs')
        .remove(asset.documents);

      if (storageError) {
        console.error('Error deleting asset documents:', storageError);
      }
    }

    // Delete the asset record
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Asset delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
