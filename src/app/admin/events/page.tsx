'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/lib/types'
import { TEMPLATE_LABELS } from '@/lib/types'
import { formatShortDate } from '@/lib/utils'

const demoEvents: Event[] = [
  { id: '1', title: 'Tadabbur Surat Al-Mulk', speaker: 'Ust. Ahmad Fauzi, Lc.', date: '2026-04-15', time: "Ba'da Maghrib", location: 'Ruang Utama Masjid Lt. 2', template_type: 'kajian_rutin', image_type: 'preset', image_url: null, status: 'active', created_at: '' },
  { id: '2', title: "Sholat Jum'at", speaker: 'Ust. Ahmad Fauzi, Lc.', date: '2026-04-16', time: '12.00 WIB', location: 'Area Utama Masjid', template_type: 'sholat_jumat', image_type: 'preset', image_url: null, status: 'active', created_at: '' },
  { id: '3', title: 'Fiqh Ibadah', speaker: 'Ust. Muhammad Nuzul', date: '2026-04-18', time: "Ba'da Isya", location: 'Ruang Utama Masjid Lt. 2', template_type: 'kajian_rutin', image_type: 'preset', image_url: null, status: 'draft', created_at: '' },
  { id: '4', title: 'Wanita Shalihah Penjaga Surga', speaker: 'Ustadzah Halimah', date: '2026-04-20', time: '09.00 WIB', location: 'Ruang Utama Masjid Lt. 2', template_type: 'kajian_spesial', image_type: 'preset', image_url: null, status: 'active', created_at: '' },
]

export default function EventsPage() {
  const [items, setItems] = useState<Event[]>(demoEvents)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [useSupabase, setUseSupabase] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true })
      if (!error && data?.length) {
        setItems(data)
        setUseSupabase(true)
      }
    } catch { /* not configured */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus event ini?')) return
    if (useSupabase) {
      await supabase.from('events').delete().eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.filter(e => e.id !== id))
    }
  }

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active'
    if (useSupabase) {
      await supabase.from('events').update({ status: newStatus }).eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
    }
  }

  const filtered = items.filter((e) => {
    if (filter !== 'all' && e.status !== filter) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.speaker?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Kajian / Event</h1>
          <div className="admin-breadcrumb">
            <Link href="/admin">Dashboard</Link><span>›</span><span>Kajian / Event</span>
          </div>
        </div>
        <Link href="/admin/events/new" className="btn btn-primary">+ Tambah Kajian / Event</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="flex items-center justify-between gap-md">
          <input
            type="text"
            className="form-input"
            placeholder="Cari judul kajian, ustadz, lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 500 }}
          />
          <div className="flex gap-sm items-center">
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Filter:</span>
            <select className="form-input form-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 140 }}>
              <option value="all">Semua</option>
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Judul Kajian</th>
                <th>Ustadz</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Template</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      <span style={{ fontSize: '1.25rem' }}>
                        {event.template_type === 'kajian_rutin' ? '📖' :
                         event.template_type === 'sholat_jumat' ? '🕌' :
                         event.template_type === 'kajian_spesial' ? '⭐' : '📢'}
                      </span>
                      <span style={{ fontWeight: 600 }}>{event.title}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray-600)' }}>{event.speaker}</td>
                  <td>{formatShortDate(event.date)}</td>
                  <td style={{ color: 'var(--gray-600)' }}>{event.time}</td>
                  <td>
                    <span className={`badge ${event.template_type === 'sholat_jumat' ? 'badge-red' : event.template_type === 'kajian_spesial' ? 'badge-gold' : 'badge-green'}`}>
                      {TEMPLATE_LABELS[event.template_type]}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${event.status === 'active' ? 'badge-green' : 'badge-gray'}`}
                      onClick={() => handleToggle(event.id, event.status)}
                      style={{ cursor: 'pointer' }}
                    >
                      {event.status === 'active' ? 'Aktif' : 'Draft'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-xs">
                      <Link href={`/admin/events/${event.id}/edit`} className="btn-icon" style={{ color: 'var(--green-700)' }} title="Edit">✏️</Link>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(event.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between" style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--gray-100)' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
            Menampilkan {filtered.length} dari {items.length} data
          </span>
        </div>
      </div>
    </div>
  )
}
