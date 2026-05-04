import type { Metadata } from 'next'
import { Inter, Amiri } from 'next/font/google'
import './globals.css'
import { getThemeById, themeToStyleString } from '@/lib/themes'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri',
})

export const metadata: Metadata = {
  title: 'Masjid TV — Sistem Digital Masjid',
  description: 'Sistem informasi digital masjid modern untuk menampilkan jadwal sholat, kajian, donasi, dan pengumuman.',
}

async function getThemeId(): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return 'ruby_red'

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key)
    const { data } = await supabase.from('mosque_config').select('theme').limit(1).single()
    return data?.theme || 'ruby_red'
  } catch {
    return 'ruby_red'
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeId = await getThemeId()
  const theme = getThemeById(themeId)
  const themeCSS = `:root { ${themeToStyleString(theme)} }`

  return (
    <html lang="id" className={`${inter.variable} ${amiri.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
