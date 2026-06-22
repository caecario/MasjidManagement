'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { MediaItem } from '@/lib/types'

/* ── Hijri month names for schedule display ───────── */
const HIJRI_MONTHS: Record<number, string> = {
  1: 'Muharram', 2: 'Safar', 3: 'Rabiul Awal', 4: 'Rabiul Akhir',
  5: 'Jumadil Awal', 6: 'Jumadil Akhir', 7: 'Rajab', 8: "Sya'ban",
  9: 'Ramadhan', 10: 'Syawwal', 11: "Dzulqa'dah", 12: 'Dzulhijjah',
}

const DEMO_ITEMS: MediaItem[] = [
  {
    id: '1', title: 'Murottal Juz 30 — Mishary Rashid',
    media_type: 'audio', source_type: 'youtube',
    source_url: 'https://www.youtube.com/watch?v=example1',
    status: 'active', autoplay: false, loop: true,
    schedule_type: 'always', schedule_start: null, schedule_end: null,
    sort_order: 1, created_at: '',
  },
]

/* ── Helper: extract YouTube video ID ────────────── */
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>(DEMO_ITEMS)
  const [useSupabase, setUseSupabase] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    media_type: 'audio' as 'audio' | 'video',
    source_type: 'upload' as 'upload' | 'youtube' | 'url',
    source_url: '',
    autoplay: false,
    loop: true,
    schedule_type: 'always' as 'always' | 'manual' | 'hijri_range' | 'prayer_time',
    schedule_start: '',
    schedule_end: '',
  })

  const showMsg = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  /* ── Fetch ───────────────────────────────────────── */
  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('sort_order', { ascending: true })
      if (!error && data) {
        setItems(data)
        setUseSupabase(true)
      }
    } catch { /* not configured */ }
    setInitialLoading(false)
  }

  useEffect(() => {
    void fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Upload file ─────────────────────────────────── */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'media')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })

    if (res.ok) {
      const data = await res.json()
      setForm(prev => ({ ...prev, source_url: data.url, source_type: 'upload' }))
      showMsg('✅ File berhasil diupload!')
    } else {
      const data = await res.json().catch(() => ({}))
      showMsg(`⚠️ Upload gagal: ${data.error || 'unknown error'}`)
    }
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ── Save new item ───────────────────────────────── */
  const handleSave = async () => {
    if (!form.title.trim() || !form.source_url.trim()) {
      showMsg('⚠️ Judul dan URL/file harus diisi')
      return
    }
    setLoading(true)

    const payload = {
      title: form.title.trim(),
      media_type: form.media_type,
      source_type: form.source_type,
      source_url: form.source_url.trim(),
      autoplay: form.autoplay,
      loop: form.loop,
      schedule_type: form.schedule_type,
      schedule_start: form.schedule_start || null,
      schedule_end: form.schedule_end || null,
      sort_order: items.length + 1,
      status: 'active',
    }

    if (useSupabase) {
      const supabase = createClient()
      const { error } = await supabase.from('media_items').insert(payload)
      if (error) {
        showMsg('⚠️ Gagal menyimpan: ' + error.message)
      } else {
        showMsg('✅ Media berhasil ditambahkan!')
        await fetchData()
      }
    } else {
      setItems(prev => [...prev, { ...payload, id: String(Date.now()), created_at: new Date().toISOString() } as MediaItem])
      showMsg('✅ Media ditambahkan (demo mode)')
    }

    setForm({
      title: '', media_type: 'audio', source_type: 'upload',
      source_url: '', autoplay: false, loop: true,
      schedule_type: 'always', schedule_start: '', schedule_end: '',
    })
    setShowForm(false)
    setLoading(false)
  }

  /* ── Toggle status ───────────────────────────────── */
  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    if (useSupabase) {
      const supabase = createClient()
      await supabase.from('media_items').update({ status: newStatus }).eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
    }
  }

  /* ── Toggle autoplay ─────────────────────────────── */
  const handleAutoplayToggle = async (id: string, current: boolean) => {
    if (useSupabase) {
      const supabase = createClient()
      await supabase.from('media_items').update({ autoplay: !current }).eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.map(m => m.id === id ? { ...m, autoplay: !m.autoplay } : m))
    }
  }

  /* ── Delete ──────────────────────────────────────── */
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus media ini?')) return
    if (useSupabase) {
      const supabase = createClient()
      await supabase.from('media_items').delete().eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.filter(m => m.id !== id))
    }
  }

  /* ── Schedule label ──────────────────────────────── */
  const getScheduleLabel = (item: MediaItem) => {
    switch (item.schedule_type) {
      case 'always': return '🔁 Selalu aktif'
      case 'manual': return '✋ Manual'
      case 'hijri_range': {
        if (!item.schedule_start || !item.schedule_end) return '📅 Hijri (belum diset)'
        const [sm, sd] = item.schedule_start.split('-').map(Number)
        const [em, ed] = item.schedule_end.split('-').map(Number)
        return `📅 ${sd} ${HIJRI_MONTHS[sm] || sm} — ${ed} ${HIJRI_MONTHS[em] || em}`
      }
      case 'prayer_time': return `🕌 Setelah ${item.schedule_start || '?'}`
      default: return item.schedule_type
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Media (Murottal / Takbeer)</h1>
          <div className="admin-breadcrumb">
            <Link href="/admin">Dashboard</Link><span>›</span><span>Media</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Batal' : '+ Tambah Media'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem',
          background: message.includes('✅') ? 'var(--green-50)' : '#FFEBEE',
          color: message.includes('✅') ? 'var(--green-700)' : 'var(--danger)',
        }}>
          {message}
        </div>
      )}

      {/* ── Add Form ─────────────────────────────── */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Tambah Media Baru</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Judul</label>
              <input
                className="form-input"
                placeholder="Murottal Juz 30, Takbeer Idul Adha..."
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div className="form-group">
              <label className="form-label">Tipe Media</label>
              <select
                className="form-input form-select"
                value={form.media_type}
                onChange={e => setForm(prev => ({ ...prev, media_type: e.target.value as 'audio' | 'video' }))}
              >
                <option value="audio">🎵 Audio</option>
                <option value="video">🎬 Video</option>
              </select>
            </div>

            {/* Source type */}
            <div className="form-group">
              <label className="form-label">Sumber</label>
              <select
                className="form-input form-select"
                value={form.source_type}
                onChange={e => setForm(prev => ({ ...prev, source_type: e.target.value as 'upload' | 'youtube' | 'url' }))}
              >
                <option value="upload">📎 Upload File</option>
                <option value="youtube">▶️ YouTube Link</option>
                <option value="url">🔗 URL Langsung</option>
              </select>
            </div>

            {/* Source URL or upload */}
            <div className="form-group">
              <label className="form-label">
                {form.source_type === 'upload' ? 'File' : form.source_type === 'youtube' ? 'YouTube URL' : 'URL'}
              </label>
              {form.source_type === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="flex gap-sm items-center">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                    >
                      {loading ? '⏳ Uploading...' : '📎 Pilih File'}
                    </button>
                    {form.source_url && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--green-700)' }}>✅ File uploaded</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
                    MP3, MP4, OGG, WAV — maks 100MB
                  </p>
                </div>
              ) : (
                <input
                  className="form-input"
                  placeholder={form.source_type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://example.com/audio.mp3'}
                  value={form.source_url}
                  onChange={e => setForm(prev => ({ ...prev, source_url: e.target.value }))}
                />
              )}
            </div>
          </div>

          {/* Options row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.autoplay} onChange={e => setForm(prev => ({ ...prev, autoplay: e.target.checked }))} />
              Auto-play saat TV load
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.loop} onChange={e => setForm(prev => ({ ...prev, loop: e.target.checked }))} />
              Loop (ulangi)
            </label>
          </div>

          {/* Schedule */}
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>📅 Jadwal</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="form-input form-select"
                value={form.schedule_type}
                onChange={e => setForm(prev => ({ ...prev, schedule_type: e.target.value as 'always' | 'manual' | 'hijri_range' | 'prayer_time' }))}
                style={{ width: 200 }}
              >
                <option value="always">🔁 Selalu aktif</option>
                <option value="manual">✋ Manual on/off</option>
                <option value="hijri_range">📅 Range Tanggal Hijriyah</option>
                <option value="prayer_time">🕌 Setelah Waktu Sholat</option>
              </select>

              {form.schedule_type === 'hijri_range' && (
                <>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Mulai (bulan-tanggal)</label>
                    <input
                      className="form-input"
                      placeholder="12-1"
                      value={form.schedule_start}
                      onChange={e => setForm(prev => ({ ...prev, schedule_start: e.target.value }))}
                      style={{ width: 100 }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Selesai (bulan-tanggal)</label>
                    <input
                      className="form-input"
                      placeholder="12-13"
                      value={form.schedule_end}
                      onChange={e => setForm(prev => ({ ...prev, schedule_end: e.target.value }))}
                      style={{ width: 100 }}
                    />
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--gray-400)', width: '100%' }}>
                    Contoh: Takbeer 1–13 Dzulhijjah → mulai: 12-1, selesai: 12-13
                  </p>
                </>
              )}

              {form.schedule_type === 'prayer_time' && (
                <select
                  className="form-input form-select"
                  value={form.schedule_start}
                  onChange={e => setForm(prev => ({ ...prev, schedule_start: e.target.value }))}
                  style={{ width: 150 }}
                >
                  <option value="">Pilih waktu...</option>
                  <option value="subuh">Ba&apos;da Subuh</option>
                  <option value="dzuhur">Ba&apos;da Dzuhur</option>
                  <option value="ashar">Ba&apos;da Ashar</option>
                  <option value="maghrib">Ba&apos;da Maghrib</option>
                  <option value="isya">Ba&apos;da Isya</option>
                </select>
              )}
            </div>
          </div>

          {/* YouTube preview */}
          {form.source_type === 'youtube' && extractYouTubeId(form.source_url) && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Preview:</p>
              <iframe
                width="320" height="180"
                src={`https://www.youtube.com/embed/${extractYouTubeId(form.source_url)}?rel=0`}
                style={{ borderRadius: 'var(--radius-md)', border: 'none' }}
                allow="autoplay; encrypted-media"
                title="YouTube preview"
              />
            </div>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? '⏳ Menyimpan...' : '💾 Simpan Media'}
            </button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      {/* ── Media List ───────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        {initialLoading ? (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton skeleton-card" style={{ height: 56 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎵</div>
            <div className="empty-state-text">Belum ada media</div>
            <div className="empty-state-hint">Klik &quot;+ Tambah Media&quot; untuk menambahkan murottal atau takbeer</div>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderBottom: i < items.length - 1 ? '1px solid var(--gray-100)' : 'none',
              }}
            >
              {/* Icon */}
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                {item.media_type === 'audio' ? '🎵' : '🎬'}
              </span>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
                  <span>
                    {item.source_type === 'youtube' ? '▶️ YouTube' : item.source_type === 'upload' ? '📎 Upload' : '🔗 URL'}
                  </span>
                  <span>{getScheduleLabel(item)}</span>
                  {item.loop && <span>🔁 Loop</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-xs items-center" style={{ flexShrink: 0 }}>
                <button
                  className={`badge ${item.autoplay ? 'badge-green' : 'badge-gray'}`}
                  onClick={() => handleAutoplayToggle(item.id, item.autoplay)}
                  style={{ cursor: 'pointer', fontSize: '0.6875rem' }}
                  title="Toggle autoplay"
                >
                  {item.autoplay ? '▶ Auto' : '⏸ Manual'}
                </button>
                <button
                  className={`badge ${item.status === 'active' ? 'badge-green' : 'badge-gray'}`}
                  onClick={() => handleToggle(item.id, item.status)}
                  style={{ cursor: 'pointer', fontSize: '0.6875rem' }}
                >
                  {item.status === 'active' ? 'Aktif' : 'Off'}
                </button>
                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item.id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info card */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>💡 Tips</h3>
        <ul style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>Hanya <strong>1 media aktif</strong> yang diputar di TV pada satu waktu (prioritas berdasarkan urutan)</li>
          <li><strong>YouTube</strong>: paste link langsung, audio/video akan diputar di TV tanpa iklan</li>
          <li><strong>Upload</strong>: file MP3/MP4 diupload ke storage, auto-play dari awal</li>
          <li><strong>Jadwal Hijriyah</strong>: cocok untuk takbeer Idul Adha (1–13 Dzulhijjah) atau murottal Ramadhan</li>
          <li>TV harus diklik sekali untuk mengaktifkan audio (kebijakan browser)</li>
        </ul>
      </div>
    </div>
  )
}
