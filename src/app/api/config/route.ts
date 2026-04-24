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
  fullscreen_interval: 5,
  fullscreen_duration: 30,
  prayer_duration_subuh: 15,
  prayer_duration_dzuhur: 15,
  prayer_duration_ashar: 15,
  prayer_duration_maghrib: 10,
  prayer_duration_isya: 15,
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
    fullscreen_interval: data.fullscreen_interval,
    fullscreen_duration: data.fullscreen_duration,
    prayer_duration_subuh: data.prayer_duration_subuh,
    prayer_duration_dzuhur: data.prayer_duration_dzuhur,
    prayer_duration_ashar: data.prayer_duration_ashar,
    prayer_duration_maghrib: data.prayer_duration_maghrib,
    prayer_duration_isya: data.prayer_duration_isya,
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
  if (config.fullscreen_interval !== undefined) dbData.fullscreen_interval = config.fullscreen_interval
  if (config.fullscreen_duration !== undefined) dbData.fullscreen_duration = config.fullscreen_duration
  if (config.prayer_duration_subuh !== undefined) dbData.prayer_duration_subuh = config.prayer_duration_subuh
  if (config.prayer_duration_dzuhur !== undefined) dbData.prayer_duration_dzuhur = config.prayer_duration_dzuhur
  if (config.prayer_duration_ashar !== undefined) dbData.prayer_duration_ashar = config.prayer_duration_ashar
  if (config.prayer_duration_maghrib !== undefined) dbData.prayer_duration_maghrib = config.prayer_duration_maghrib
  if (config.prayer_duration_isya !== undefined) dbData.prayer_duration_isya = config.prayer_duration_isya

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
