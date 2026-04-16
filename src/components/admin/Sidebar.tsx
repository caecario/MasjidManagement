'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MENU_SECTIONS = [
  {
    label: 'MENU UTAMA',
    items: [
      { href: '/admin', icon: '📊', label: 'Dashboard' },
      { href: '/admin/events', icon: '📅', label: 'Kajian / Event' },
      { href: '/admin/prayer-times', icon: '🕐', label: 'Jadwal Sholat' },
      { href: '/admin/donations', icon: '💰', label: 'Donasi / Program' },
      { href: '/admin/finances', icon: '📈', label: 'Laporan Keuangan' },
      { href: '/admin/announcements', icon: '📢', label: 'Pengumuman (Running Text)' },
      { href: '/admin/hadiths', icon: '📖', label: 'Ayat & Hadits' },
    ],
  },
  {
    label: 'PENGATURAN',
    items: [
      { href: '/admin/settings', icon: '⚙️', label: 'Pengaturan Masjid' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="admin-sidebar-logo">
        <div className="admin-sidebar-logo-icon">🕌</div>
        <div>
          <div className="admin-sidebar-title">MASJID</div>
          <div className="admin-sidebar-title" style={{ color: 'var(--gold-400)' }}>
            AS-SYAMS
          </div>
        </div>
      </div>

      {/* Nav sections */}
      {MENU_SECTIONS.map((section) => (
        <div key={section.label}>
          <div className="admin-sidebar-section">{section.label}</div>
          <nav className="admin-sidebar-nav">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <span className="admin-sidebar-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}

      {/* User */}
      <div className="admin-sidebar-user">
        <div className="admin-sidebar-avatar">A</div>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Admin Utama</div>
          <div style={{ fontSize: '0.6875rem', opacity: 0.6 }}>admin@assyams.id</div>
        </div>
      </div>
    </aside>
  )
}
