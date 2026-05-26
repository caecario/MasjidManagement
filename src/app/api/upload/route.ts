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
  // Determine bucket based on content type
  const isMedia = contentType.startsWith('audio/') || contentType.startsWith('video/')
  const bucketName = isMedia ? 'media' : 'uploads'
  const sizeLimit = isMedia ? 100 * 1024 * 1024 : 5 * 1024 * 1024
  const allowedTypes = isMedia
    ? ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'video/mp4', 'video/webm']
    : ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.find(b => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: allowedTypes,
        fileSizeLimit: sizeLimit,
      })
    }
  } catch (err) {
    console.error('Bucket check failed:', err)
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filename, buffer, { contentType, upsert: true })

  if (error) {
    console.error('Supabase upload error:', error.message)
    return null
  }

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filename)
  return urlData.publicUrl
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard — only authenticated users can upload
    const { requireAuth } = await import('@/lib/auth-guard')
    const auth = await requireAuth()
    if (!auth.authenticated) return auth.response

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const isImage = file.type.startsWith('image/')
    const isAudio = file.type.startsWith('audio/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isAudio && !isVideo) {
      return NextResponse.json({ error: 'Only images, audio, and video files allowed' }, { status: 400 })
    }

    const maxSize = (isAudio || isVideo) ? 100 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `Max ${(isAudio || isVideo) ? '100MB' : '5MB'}` }, { status: 400 })
    }

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
