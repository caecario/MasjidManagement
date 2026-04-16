/* ──────────────────────────────────────────────
   Masjid TV App — Shared TypeScript Types
   ────────────────────────────────────────────── */

export interface MosqueConfig {
  id: string
  name: string
  tagline: string
  logo_url: string | null
  city: string
  country: string
  latitude: number
  longitude: number
  calculation_method: number
  created_at: string
}

export interface PrayerTime {
  id: string
  date: string
  subuh: string | null
  dzuhur: string | null
  ashar: string | null
  maghrib: string | null
  isya: string | null
  iqamah_subuh: number
  iqamah_dzuhur: number
  iqamah_ashar: number
  iqamah_maghrib: number
  iqamah_isya: number
  is_manual: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  speaker: string | null
  date: string
  time: string | null
  location: string | null
  template_type: 'kajian_rutin' | 'sholat_jumat' | 'kajian_spesial' | 'pengumuman'
  image_type: 'preset' | 'custom'
  image_url: string | null
  status: 'active' | 'draft'
  created_at: string
}

export interface Donation {
  id: string
  program_name: string
  image_url?: string | null
  target_amount: number
  collected_amount: number
  status: 'active' | 'completed' | 'draft'
  created_at: string
}

export interface Finance {
  id: string
  as_of_date: string
  label: string | null
  total_income: number
  total_expense: number
  created_at: string
}

export interface Announcement {
  id: string
  text: string
  icon: string
  sort_order: number
  status: 'active' | 'inactive'
  created_at: string
}

export interface Hadith {
  id: string
  content: string
  source: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface Profile {
  id: string
  name: string | null
  email: string | null
  role: 'admin' | 'treasurer'
  created_at: string
}

/* Prayer name mapping */
export type PrayerName = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'

export const PRAYER_LABELS: Record<PrayerName, string> = {
  subuh: 'SUBUH',
  dzuhur: 'DZUHUR',
  ashar: 'ASHAR',
  maghrib: 'MAGHRIB',
  isya: 'ISYA',
}

export const PRAYER_ICONS: Record<PrayerName, string> = {
  subuh: '🌅',
  dzuhur: '☀️',
  ashar: '🌤️',
  maghrib: '🌅',
  isya: '🌙',
}

/* Template types */
export type TemplateType = 'kajian_rutin' | 'sholat_jumat' | 'kajian_spesial' | 'pengumuman'

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  kajian_rutin: 'Kajian Rutin',
  sholat_jumat: "Sholat Jum'at",
  kajian_spesial: 'Kajian Spesial',
  pengumuman: 'Pengumuman',
}
