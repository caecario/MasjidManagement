import Link from 'next/link'
import { formatRupiah, formatDate } from '@/lib/utils'

// Demo data
const stats = [
  { label: 'Total Kajian / Event', value: '12', icon: '📅', color: 'var(--green-600)' },
  { label: 'Donasi Aktif', value: '3', icon: '💰', color: 'var(--gold-500)' },
  { label: 'Saldo Bulan Ini', value: formatRupiah(4300000), icon: '💵', color: 'var(--green-700)' },
]

const upcomingEvent = {
  title: 'Tadabbur Surat Al-Mulk',
  speaker: 'Ust. Ahmad Fauzi, Lc.',
  date: 'Hari ini',
  time: "Ba'da Maghrib",
  location: 'Ruang Utama Masjid Lt. 2',
}

export default function AdminDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            Selamat datang kembali, Admin Utama
          </p>
        </div>
        <div style={{
          background: 'var(--white)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '0.875rem',
          color: 'var(--gray-600)',
        }}>
          📅 {formatDate(new Date())}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
            <div className="stat-icon">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Event */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>📌 Kajian Terdekat</h2>
        </div>
        <div className="flex gap-lg items-center">
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--green-800), var(--green-700))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            flexShrink: 0,
          }}>
            🕌
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {upcomingEvent.title}
            </h3>
            <div className="flex gap-lg" style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
              <span>🎤 {upcomingEvent.speaker}</span>
              <span>🕐 {upcomingEvent.time}</span>
              <span>📍 {upcomingEvent.location}</span>
            </div>
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--green-700)',
            fontWeight: 600,
          }}>
            {upcomingEvent.date}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>⚡ Quick Action</h2>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <Link href="/admin/events/new" className="btn btn-primary">
            + Tambah Kajian / Event
          </Link>
          <Link href="/admin/donations/new" className="btn btn-gold">
            + Tambah Donasi / Program
          </Link>
          <Link href="/admin/announcements" className="btn btn-outline">
            📢 Kelola Pengumuman
          </Link>
        </div>
      </div>
    </div>
  )
}
