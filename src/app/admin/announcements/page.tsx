'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Announcement } from '@/lib/types'

const demoAnnouncements: Announcement[] = [
  { id: '1', text: "Kajian malam ini ba'da Maghrib bersama Ust. Ahmad Fauzi", icon: '📖', sort_order: 1, status: 'active', created_at: '' },
  { id: '2', text: 'Infak bisa melalui QRIS di samping', icon: '💳', sort_order: 2, status: 'active', created_at: '' },
  { id: '3', text: 'Jaga kebersihan masjid', icon: '🧹', sort_order: 3, status: 'active', created_at: '' },
  { id: '4', text: 'Matikan HP saat sholat', icon: '📵', sort_order: 4, status: 'active', created_at: '' },
]

const ICON_OPTIONS = ['📢', '📖', '💳', '🧹', '📵', '⚠️', '🕌', '❤️', '🎤', '🌙', '💡', '🤲']

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>(demoAnnouncements)
  const [newText, setNewText] = useState('')
  const [newIcon, setNewIcon] = useState('📢')
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editIcon, setEditIcon] = useState('📢')
  const [loading, setLoading] = useState(false)
  const [useSupabase, setUseSupabase] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('sort_order', { ascending: true })
      if (!error && data?.length) {
        setItems(data)
        setUseSupabase(true)
      }
    } catch { /* not configured */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Add
  const handleAdd = async () => {
    if (!newText.trim()) return
    setLoading(true)
    if (useSupabase) {
      await supabase.from('announcements').insert({ text: newText.trim(), icon: newIcon, sort_order: items.length + 1, status: 'active' })
      await fetchData()
    } else {
      setItems(prev => [...prev, { id: String(Date.now()), text: newText.trim(), icon: newIcon, sort_order: prev.length + 1, status: 'active', created_at: new Date().toISOString() }])
    }
    setNewText('')
    setNewIcon('📢')
    setLoading(false)
  }

  // Start edit
  const startEdit = (ann: Announcement) => {
    setEditId(ann.id)
    setEditText(ann.text)
    setEditIcon(ann.icon)
  }

  // Save edit
  const saveEdit = async () => {
    if (!editText.trim() || !editId) return
    if (useSupabase) {
      await supabase.from('announcements').update({ text: editText.trim(), icon: editIcon }).eq('id', editId)
      await fetchData()
    } else {
      setItems(prev => prev.map(a => a.id === editId ? { ...a, text: editText.trim(), icon: editIcon } : a))
    }
    setEditId(null)
  }

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return
    if (useSupabase) {
      await supabase.from('announcements').delete().eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.filter(a => a.id !== id))
    }
  }

  // Toggle status
  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    if (useSupabase) {
      await supabase.from('announcements').update({ status: newStatus }).eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Pengumuman (Running Text)</h1>
          <div className="admin-breadcrumb">
            <Link href="/admin">Dashboard</Link><span>›</span><span>Pengumuman</span>
          </div>
        </div>
      </div>

      {/* Add new */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem' }}>Tambah Pengumuman Baru</h2>
        <div className="flex gap-sm items-center">
          <select className="form-input form-select" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} style={{ width: 80 }}>
            {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
          <input
            className="form-input"
            placeholder="Ketik pengumuman..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
            {loading ? '⏳' : '+ Tambah'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0 }}>
        {items.map((ann, i) => (
          <div key={ann.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.625rem 1rem',
            borderBottom: i < items.length - 1 ? '1px solid var(--gray-100)' : 'none',
          }}>
            {/* Number */}
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', width: 20, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>

            {/* Icon */}
            {editId === ann.id ? (
              <select className="form-input form-select" value={editIcon} onChange={(e) => setEditIcon(e.target.value)} style={{ width: 55, padding: '0.25rem', flexShrink: 0 }}>
                {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            ) : (
              <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{ann.icon}</span>
            )}

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editId === ann.id ? (
                <div className="flex gap-sm items-center">
                  <input
                    className="form-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={saveEdit}>💾</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>✕</button>
                </div>
              ) : (
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{ann.text}</span>
              )}
            </div>

            {/* Status + Actions */}
            {editId !== ann.id && (
              <div className="flex gap-xs items-center" style={{ flexShrink: 0 }}>
                <button
                  className={`badge ${ann.status === 'active' ? 'badge-green' : 'badge-gray'}`}
                  onClick={() => handleToggle(ann.id, ann.status)}
                  style={{ cursor: 'pointer', fontSize: '0.6875rem' }}
                >
                  {ann.status === 'active' ? 'Aktif' : 'Off'}
                </button>
                <button className="btn-icon" style={{ color: 'var(--green-700)' }} onClick={() => startEdit(ann)}>✏️</button>
                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(ann.id)}>🗑️</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="card" style={{ marginTop: '1rem', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gray-200)' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>👁️ Preview Running Text di TV</span>
        </div>
        <div style={{ background: 'linear-gradient(135deg, var(--green-800), var(--green-700))', padding: '0.625rem 0', overflow: 'hidden' }}>
          <div className="tv-ticker">
            <span className="tv-ticker-label">📢 PENGUMUMAN</span>
            <div className="tv-ticker-track">
              <div className="tv-ticker-content">
                {[...items.filter(a => a.status === 'active'), ...items.filter(a => a.status === 'active')].map((ann, i) => (
                  <span key={i} className="tv-ticker-item">
                    <span>{ann.icon}</span><span>{ann.text}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
