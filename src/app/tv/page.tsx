import TVDisplay from './tv-display'
import type { Event, Donation, Finance, Announcement, Hadith } from '@/lib/types'

// Disable all caching — TV must always show latest data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Demo data for development (when Supabase is not connected)
const demoEvents: Event[] = [
  {
    id: '1',
    title: 'Tadabbur Surat Al-Mulk',
    speaker: 'Ust. Ahmad Fauzi, Lc.',
    date: new Date().toISOString().split('T')[0],
    time: "Ba'da Maghrib",
    location: 'Ruang Utama Masjid Lt. 2',
    template_type: 'kajian_rutin',
    image_type: 'preset',
    image_url: null,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: "Sholat Jum'at",
    speaker: 'Ust. Ahmad Fauzi, Lc.',
    date: new Date().toISOString().split('T')[0],
    time: '12.00 WIB',
    location: 'Area Utama Masjid',
    template_type: 'sholat_jumat',
    image_type: 'preset',
    image_url: null,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Fiqh Ibadah',
    speaker: 'Ust. Muhammad Nuzul',
    date: new Date().toISOString().split('T')[0],
    time: "Ba'da Isya",
    location: 'Ruang Utama Masjid Lt. 2',
    template_type: 'kajian_spesial',
    image_type: 'preset',
    image_url: null,
    status: 'active',
    created_at: new Date().toISOString(),
  },
]

const demoDonations: Donation[] = [
  {
    id: '1',
    program_name: 'Pembangunan Tempat Wudhu',
    target_amount: 75000000,
    collected_amount: 32500000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    program_name: 'Renovasi Toilet Masjid',
    target_amount: 50000000,
    collected_amount: 48000000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    program_name: 'Pengadaan Al-Quran & Iqra',
    target_amount: 15000000,
    collected_amount: 9200000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
]

const demoFinance: Finance = {
  id: '1',
  as_of_date: new Date().toISOString().split('T')[0],
  label: 'April 2026',
  total_income: 12500000,
  total_expense: 8200000,
  created_at: new Date().toISOString(),
}

const demoAnnouncements: Announcement[] = [
  { id: '1', text: "Kajian malam ini ba'da Maghrib bersama Ust. Ahmad Fauzi", icon: '📖', sort_order: 1, status: 'active', created_at: '' },
  { id: '2', text: 'Infak bisa melalui QRIS di samping', icon: '💳', sort_order: 2, status: 'active', created_at: '' },
  { id: '3', text: 'Jaga kebersihan masjid', icon: '🧹', sort_order: 3, status: 'active', created_at: '' },
  { id: '4', text: 'Matikan HP saat sholat', icon: '📵', sort_order: 4, status: 'active', created_at: '' },
]

const demoHadiths: Hadith[] = [
  {
    id: '1',
    content: 'Sesungguhnya setiap amalan tergantung pada niatnya. Dan sesungguhnya setiap orang akan mendapatkan apa yang ia niatkan.',
    source: 'HR. Bukhari & Muslim',
    status: 'active',
    created_at: '',
  },
  {
    id: '2',
    content: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.',
    source: 'HR. Ahmad',
    status: 'active',
    created_at: '',
  },
]

export default async function TVPage() {
  let events = demoEvents
  let donations = demoDonations
  let finance: Finance | null = demoFinance
  let announcements = demoAnnouncements
  let hadiths = demoHadiths

  // Read mosque config — try Supabase first, then local JSON
  let logoUrl: string | null = null
  let qrisUrl: string | null = null
  let mosqueName = 'MASJID AS-SYAMS'
  let tagline = 'Menerangi Hati, Menghidupkan Sunnah'
  let fullscreenInterval = 5
  let fullscreenDuration = 30
  let prayerDurations = {
    subuh: 15,
    dzuhur: 15,
    ashar: 15,
    maghrib: 10,
    isya: 15,
  } as Record<import('@/lib/types').PrayerName, number>

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: configData } = await supabase.from('mosque_config').select('*').limit(1).single()
    if (configData) {
      logoUrl = configData.logo_url || null
      qrisUrl = configData.qris_url || null
      mosqueName = configData.name || mosqueName
      tagline = configData.tagline || tagline
      fullscreenInterval = configData.fullscreen_interval ?? fullscreenInterval
      fullscreenDuration = configData.fullscreen_duration ?? fullscreenDuration
      prayerDurations = {
        subuh: configData.prayer_duration_subuh ?? 15,
        dzuhur: configData.prayer_duration_dzuhur ?? 15,
        ashar: configData.prayer_duration_ashar ?? 15,
        maghrib: configData.prayer_duration_maghrib ?? 10,
        isya: configData.prayer_duration_isya ?? 15,
      }
    }
  } catch {
    // Supabase not available, try local JSON
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const configPath = path.join(process.cwd(), 'public', 'mosque-config.json')
      const raw = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(raw)
      logoUrl = config.logo_url || null
      qrisUrl = config.qris_url || null
      mosqueName = config.mosque_name || mosqueName
      tagline = config.tagline || tagline
      fullscreenInterval = config.fullscreen_interval ?? fullscreenInterval
      fullscreenDuration = config.fullscreen_duration ?? fullscreenDuration
      if (config.prayer_durations) prayerDurations = config.prayer_durations
    } catch { /* no config */ }
  }

  // Try fetching from Supabase (gracefully fallback to demo data)
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const [eventsRes, donationsRes, financeRes, announcementsRes, hadithsRes] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true }),
      supabase
        .from('donations')
        .select('*')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false }),
      supabase
        .from('finances')
        .select('*')
        .order('as_of_date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('announcements')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true }),
      supabase
        .from('hadiths')
        .select('*')
        .eq('status', 'active'),
    ])

    if (eventsRes.data?.length) events = eventsRes.data
    if (donationsRes.data?.length) donations = donationsRes.data
    if (financeRes.data) finance = financeRes.data
    if (announcementsRes.data?.length) announcements = announcementsRes.data
    if (hadithsRes.data?.length) hadiths = hadithsRes.data
  } catch {
    // Supabase not configured yet, use demo data
    console.log('Using demo data (Supabase not configured)')
  }

  return (
    <TVDisplay
      initialEvents={events}
      initialDonations={donations}
      initialFinance={finance}
      initialAnnouncements={announcements}
      initialHadiths={hadiths}
      logoUrl={logoUrl}
      qrisUrl={qrisUrl}
      mosqueName={mosqueName}
      tagline={tagline}
      fullscreenInterval={fullscreenInterval}
      fullscreenDuration={fullscreenDuration}
      prayerDurations={prayerDurations}
    />
  )
}
