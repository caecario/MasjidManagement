import type { Metadata } from 'next'
import { Inter, Amiri } from 'next/font/google'
import './globals.css'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${inter.variable} ${amiri.variable}`}>
      <body>{children}</body>
    </html>
  )
}
