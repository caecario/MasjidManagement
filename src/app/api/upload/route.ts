import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Try Supabase Storage first, fallback to local filesystem
async function uploadToSupabase(buffer: Buffer, filename: string, contentType: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key)

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find(b => b.name === 'uploads')) {
    await supabase.storage.createBucket('uploads', { public: true })
  }

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filename, buffer, { contentType, upsert: true })

  if (error) return null

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filename)
  return urlData.publicUrl
}

async function uploadToLocal(buffer: Buffer, filename: string): Promise<string> {
  const { writeFile, mkdir } = await import('fs/promises')
  const path = await import('path')
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, filename), buffer)
  return `/uploads/${filename}`
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

    // Try Supabase Storage first, fallback to local
    let url = await uploadToSupabase(buffer, filename, file.type)
    if (!url) {
      url = await uploadToLocal(buffer, filename)
    }

    return NextResponse.json({ url, filename })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
