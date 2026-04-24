import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Upload to Supabase Storage
async function uploadToSupabase(buffer: Buffer, filename: string, contentType: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prefer service role key for storage uploads (bypasses RLS)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key)

  // Ensure bucket exists (only works with service role key)
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.find(b => b.name === 'uploads')) {
      await supabase.storage.createBucket('uploads', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
        fileSizeLimit: 5 * 1024 * 1024,
      })
    }
  } catch (err) {
    console.error('Bucket check failed:', err)
  }

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filename, buffer, { contentType, upsert: true })

  if (error) {
    console.error('Supabase upload error:', error.message)
    return null
  }

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filename)
  return urlData.publicUrl
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only images allowed' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() || 'png'
    const filename = `${type || 'file'}-${Date.now()}.${ext}`

    const url = await uploadToSupabase(buffer, filename, file.type)
    if (!url) {
      return NextResponse.json({ error: 'Upload gagal. Pastikan Supabase Storage bucket "uploads" sudah dibuat dan SUPABASE_SERVICE_ROLE_KEY sudah di-set.' }, { status: 500 })
    }

    return NextResponse.json({ url, filename })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
