import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServer()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, fileType } = await req.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing fileName or fileType' }, { status: 400 })
    }

    // Generate unique file path
    const timestamp = Date.now()
    const filePath = `${user.id}/${timestamp}-${fileName}`

    // Create signed upload URL (valid for 60 seconds)
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUploadUrl(filePath)

    if (error) {
      console.error('Signed URL error:', error)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    // Create receipt record in pending status
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: user.id,
        file_path: filePath,
        status: 'pending',
      })
      .select()
      .single()

    if (receiptError) {
      console.error('Receipt record error:', receiptError)
      return NextResponse.json({ error: 'Failed to create receipt record' }, { status: 500 })
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      filePath,
      receiptId: receipt.id,
    })
  } catch (error) {
    console.error('Upload URL generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
