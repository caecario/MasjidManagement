'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { TemplateType } from '@/lib/types'
import { TEMPLATE_LABELS } from '@/lib/types'

const TEMPLATE_OPTIONS: { type: TemplateType; icon: string }[] = [
  { type: 'kajian_rutin', icon: '📖' },
  { type: 'sholat_jumat', icon: '🕌' },
  { type: 'kajian_spesial', icon: '⭐' },
  { type: 'pengumuman', icon: '📢' },
]

export default function NewEventPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [speaker, setSpeaker] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [templateType, setTemplateType] = useState<TemplateType>('kajian_rutin')
  const [imageType, setImageType] = useState<'preset' | 'custom'>('preset')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'active' | 'draft'>('active')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'event')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setImageUrl(data.url)
      }
    } catch { /* ignore */ }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!title.trim() || !date) {
      setError('Judul dan Tanggal wajib diisi')
      return
    }
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('events').insert({
        title: title.trim(),
        speaker: speaker.trim() || null,
        date,
        time: time.trim() || null,
        location: location.trim() || null,
        template_type: templateType,
        image_type: imageType,
        image_url: imageUrl,
        status,
      })
      if (dbError) {
        setError(dbError.message)
      } else {
        router.push('/admin/events')
      }
    } catch {
      setError('Supabase belum dikonfigurasi. Data tidak disimpan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div className="flex items-center gap-md">
          <Link href="/admin/events" className="btn btn-outline btn-sm">← Kembali</Link>
          <h1 className="admin-page-title">Tambah Kajian / Event</h1>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFEBEE', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px 380px', gap: '1.5rem' }}>
        {/* Form */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Informasi Kajian</h2>
          <div className="flex flex-col gap-md">
            <div className="form-group">
              <label className="form-label">Judul Kajian *</label>
              <input className="form-input" placeholder="Tadabbur Surat Al-Mulk" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ustadz *</label>
              <input className="form-input" placeholder="Ust. Ahmad Fauzi, Lc." value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Tanggal *</label>
                <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Waktu *</label>
                <input className="form-input" placeholder="Ba'da Maghrib" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Lokasi *</label>
              <input className="form-input" placeholder="Ruang Utama Masjid Lt. 2" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            {/* Image type */}
            <div className="form-group">
              <div className="flex gap-md" style={{ marginTop: '0.5rem' }}>
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="radio" name="imageType" checked={imageType === 'preset'} onChange={() => { setImageType('preset'); setImageUrl(null) }} />
                  <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>● Gunakan Template Default</span>
                </label>
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="radio" name="imageType" checked={imageType === 'custom'} onChange={() => setImageType('custom')} />
                  <span>Upload Gambar Sendiri</span>
                </label>
              </div>
            </div>

            {imageType === 'custom' && (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                {imageUrl ? (
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <img src={imageUrl} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm" style={{ background: 'var(--white)', borderRadius: 'var(--radius-sm)' }} onClick={() => fileInputRef.current?.click()}>🔄 Ganti</button>
                      <button className="btn btn-sm" style={{ background: 'var(--white)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }} onClick={() => setImageUrl(null)}>🗑️</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      width: '100%', border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-md)',
                      padding: '2rem', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.875rem',
                      cursor: 'pointer', background: 'transparent',
                    }}
                  >
                    {uploading ? '⏳ Uploading...' : '📎 Klik untuk upload gambar'}<br />
                    <span style={{ fontSize: '0.75rem' }}>PNG, JPG, maks 5MB</span>
                  </button>
                )}
              </div>
            )}

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="flex gap-md" style={{ marginTop: '0.25rem' }}>
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="radio" name="status" checked={status === 'active'} onChange={() => setStatus('active')} />
                  <span>Tampilkan di TV</span>
                </label>
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="radio" name="status" checked={status === 'draft'} onChange={() => setStatus('draft')} />
                  <span>Draft</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Template Picker */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Pilih Template</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {TEMPLATE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setTemplateType(opt.type)}
                style={{
                  padding: '1rem', borderRadius: 'var(--radius-md)',
                  border: templateType === opt.type ? '2px solid var(--green-600)' : '2px solid var(--gray-200)',
                  background: templateType === opt.type ? 'var(--green-50)' : 'var(--white)',
                  cursor: 'pointer', textAlign: 'center', transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>{opt.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: templateType === opt.type ? 'var(--green-700)' : 'var(--gray-600)' }}>
                  {TEMPLATE_LABELS[opt.type]}
                </div>
                {templateType === opt.type && <div style={{ color: 'var(--green-600)', marginTop: '0.25rem', fontSize: '0.75rem' }}>✓</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex items-center justify-between" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gray-200)' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Preview (Tampilan di TV)</h2>
            <span style={{ fontSize: '0.6875rem', color: 'var(--green-600)' }}>● Live</span>
          </div>
          <div style={{ height: 400, position: 'relative' }}>
            {imageType === 'custom' && imageUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img src={imageUrl} alt="Custom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem' }}>
                  <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{title || 'Judul Kajian'}</h2>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8125rem', display: 'flex', gap: '1rem' }}>
                    <span>🎤 {speaker || 'Ustadz'}</span>
                    <span>🕐 {time || 'Waktu'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`template-slide template-${templateType.replace('_', '-')}`} style={{ position: 'relative' }}>
                <div className="template-arch" />
                <div className="template-content">
                  <span className="template-badge">
                    {templateType === 'kajian_rutin' ? 'KAJIAN HARI INI' :
                     templateType === 'sholat_jumat' ? "SHOLAT JUM'AT" :
                     templateType === 'kajian_spesial' ? 'KAJIAN SPESIAL' : 'PENGUMUMAN'}
                  </span>
                  <h2 className="template-title" style={{ fontSize: '1.5rem' }}>{title || 'Judul Kajian'}</h2>
                  <div className="template-meta">
                    <div className="template-meta-item" style={{ fontSize: '0.8125rem' }}><span>🎤</span><span>{speaker || 'Nama Ustadz'}</span></div>
                    <div className="template-meta-item" style={{ fontSize: '0.8125rem' }}><span>🕐</span><span>{time || 'Waktu'}</span></div>
                    <div className="template-meta-item" style={{ fontSize: '0.8125rem' }}><span>📍</span><span>{location || 'Lokasi'}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading}>
          {loading ? '⏳ Menyimpan...' : '💾 Simpan'}
        </button>
        <Link href="/admin/events" className="btn btn-outline btn-lg">Batal</Link>
      </div>
    </div>
  )
}
