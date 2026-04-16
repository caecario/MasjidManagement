import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DEFAULT_CONFIG = {
  mosque_name: 'MASJID AS-SYAMS',
  tagline: 'Menerangi Hati, Menghidupkan Sunnah',
  logo_url: null,
  qris_url: null,
  city: 'Jakarta',
  country: 'ID',
  latitude: -6.2088,
  longitude: 106.8456,
  method: 20,
}

// Try Supabase first, then local JSON
async function getConfigFromSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key)
  const { data } = await supabase.from('mosque_config').select('*').limit(1).single()
  if (!data) return null

  return {
    mosque_name: data.name,
    tagline: data.tagline,
    logo_url: data.logo_url,
    qris_url: data.qris_url,
    city: data.city,
    country: data.country,
    latitude: data.latitude,
    longitude: data.longitude,
    method: data.calculation_method,
  }
}

async function getConfigFromLocal() {
  try {
    const { readFile } = await import('fs/promises')
    const path = await import('path')
    const data = await readFile(path.join(process.cwd(), 'public', 'mosque-config.json'), 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function saveConfigToSupabase(config: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key)

  // Map config keys to DB columns
  const dbData: Record<string, unknown> = {}
  if (config.mosque_name !== undefined) dbData.name = config.mosque_name
  if (config.tagline !== undefined) dbData.tagline = config.tagline
  if (config.logo_url !== undefined) dbData.logo_url = config.logo_url
  if (config.qris_url !== undefined) dbData.qris_url = config.qris_url
  if (config.city !== undefined) dbData.city = config.city
  if (config.country !== undefined) dbData.country = config.country
  if (config.latitude !== undefined) dbData.latitude = config.latitude
  if (config.longitude !== undefined) dbData.longitude = config.longitude
  if (config.method !== undefined) dbData.calculation_method = config.method

  // Get existing config row
  const { data: existing } = await supabase.from('mosque_config').select('id').limit(1).single()

  if (existing) {
    const { error } = await supabase.from('mosque_config').update(dbData).eq('id', existing.id)
    return !error
  } else {
    const { error } = await supabase.from('mosque_config').insert(dbData)
    return !error
  }
}

async function saveConfigToLocal(config: Record<string, unknown>) {
  try {
    const { writeFile } = await import('fs/promises')
    const path = await import('path')
    await writeFile(path.join(process.cwd(), 'public', 'mosque-config.json'), JSON.stringify(config, null, 2))
    return true
  } catch {
    return false
  }
}

export async function GET() {
  // Try Supabase first
  const sbConfig = await getConfigFromSupabase()
  if (sbConfig) return NextResponse.json({ ...DEFAULT_CONFIG, ...sbConfig })

  // Then local
  const localConfig = await getConfigFromLocal()
  if (localConfig) return NextResponse.json({ ...DEFAULT_CONFIG, ...localConfig })

  return NextResponse.json(DEFAULT_CONFIG)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Try Supabase first
    const saved = await saveConfigToSupabase(body)
    if (saved) {
      const updated = await getConfigFromSupabase()
      return NextResponse.json(updated || body)
    }

    // Fallback to local
    const current = (await getConfigFromLocal()) || DEFAULT_CONFIG
    const updated = { ...current, ...body }
    await saveConfigToLocal(updated)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Config save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
