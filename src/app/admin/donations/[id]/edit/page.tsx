'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'

export default function EditDonationPage() {
  const router = useRouter()
  const params = useParams()
  const donationId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [collected, setCollected] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'active' | 'completed' | 'draft'>('active')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('donations').select('*').eq('id', donationId).single()
        if (data) {
          setName(data.program_name)
          setTarget(String(data.target_amount))
          setCollected(String(data.collected_amount))
          setImageUrl(data.image_url || null)
          setStatus(data.status)
        }
      } catch { /* not configured */ }
      setFetching(false)
    }
    fetchDonation()
  }, [donationId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'donation')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setImageUrl(data.url)
      }
    } catch { /* ignore */ }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!name.trim() || !target) {
      setError('Nama program dan target wajib diisi')
      return
    }
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('donations').update({
        program_name: name.trim(),
        target_amount: parseInt(target),
        collected_amount: parseInt(collected) || 0,
        image_url: imageUrl,
        status,
      }).eq('id', donationId)

      if (dbError) {
        setError(dbError.message)
      } else {
        setMessage('✅ Berhasil disimpan!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch {
      setError('Supabase belum dikonfigurasi.')
    } finally {
      setLoading(false)
    }
  }

  const pct = target && collected ? Math.min(100, Math.round((parseInt(collected) / parseInt(target)) * 100)) : 0

  if (fetching) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>⏳ Memuat data...</div>
  }

  return (
    <div>
      <div className="admin-topbar">
        <div className="flex items-center gap-md">
          <Link href="/admin/donations" className="btn btn-outline btn-sm">← Kembali</Link>
          <h1 className="admin-page-title">Edit Program Donasi</h1>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFEBEE', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div style={{ background: 'var(--green-50)', color: 'var(--green-700)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* Left: Form */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Detail Program</h2>
          <div className="flex flex-col gap-md">
            <div className="form-group">
              <label className="form-label">Nama Program *</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Dana (Rp) *</label>
                <input className="form-input" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dana Terkumpul (Rp)</label>
                <input className="form-input" type="number" value={collected} onChange={(e) => setCollected(e.target.value)} />
              </div>
            </div>

            {/* Progress preview */}
            <div style={{ background: 'var(--green-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex justify-between" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                <span style={{ color: 'var(--gray-600)' }}>Progress</span>
                <span style={{ fontWeight: 700, color: 'var(--green-600)' }}>{pct}%</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                <span>{formatRupiah(parseInt(collected) || 0)}</span>
                <span>{formatRupiah(parseInt(target) || 0)}</span>
              </div>
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Gambar Program</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              {imageUrl ? (
                <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={imageUrl} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm" style={{ background: 'var(--white)', borderRadius: 'var(--radius-sm)' }} onClick={() => fileInputRef.current?.click()}>🔄</button>
                    <button className="btn btn-sm" style={{ background: 'var(--white)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }} onClick={() => setImageUrl(null)}>🗑️</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{ width: '100%', border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent' }}
                >
                  {uploading ? '⏳ Uploading...' : '📎 Upload gambar program'}
                </button>
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="flex gap-md" style={{ marginTop: '0.25rem' }}>
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="radio" name="status" checked={status === 'active'} onChange={() => setStatus('active')} />
                  <span>🟢 Aktif</span>
                </label>
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="radio" name="status" checked={status === 'completed'} onChange={() => setStatus('completed')} />
                  <span>✅ Selesai</span>
                </label>
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="radio" name="status" checked={status === 'draft'} onChange={() => setStatus('draft')} />
                  <span>Draft</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading}>
                {loading ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
              </button>
              <Link href="/admin/donations" className="btn btn-outline btn-lg">Kembali</Link>
            </div>
          </div>
        </div>

        {/* Right: TV Preview */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gray-200)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>👁️ Preview di TV</span>
          </div>
          <div style={{ background: 'var(--green-50)', padding: '0' }}>
            {imageUrl && (
              <div style={{ height: 120, overflow: 'hidden' }}>
                <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--green-600)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Program Donasi</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>{name || 'Nama Program'}</div>
              <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Terkumpul</span>
                <span style={{ fontWeight: 700, color: 'var(--green-600)' }}>{formatRupiah(parseInt(collected) || 0)}</span>
              </div>
              <div className="progress-bar" style={{ height: 6, marginBottom: '0.25rem' }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span className="badge badge-green" style={{ fontSize: '0.6875rem' }}>{pct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
