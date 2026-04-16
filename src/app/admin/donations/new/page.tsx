'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewDonationPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
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
      setError('Nama program dan target dana wajib diisi')
      return
    }
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('donations').insert({
        program_name: name.trim(),
        target_amount: parseInt(target),
        collected_amount: 0,
        image_url: imageUrl,
        status: 'active',
      })
      if (dbError) {
        setError(dbError.message)
      } else {
        router.push('/admin/donations')
      }
    } catch {
      setError('Supabase belum dikonfigurasi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div className="flex items-center gap-md">
          <Link href="/admin/donations" className="btn btn-outline btn-sm">← Kembali</Link>
          <h1 className="admin-page-title">Tambah Program Donasi</h1>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFEBEE', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Nama Program *</label>
            <input className="form-input" placeholder="Pembangunan Tempat Wudhu" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Dana (Rp) *</label>
            <input className="form-input" type="number" placeholder="75000000" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Gambar Program (opsional)</label>
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
                {uploading ? '⏳ Uploading...' : '📎 Upload gambar program'}<br />
                <span style={{ fontSize: '0.75rem' }}>PNG, JPG — ditampilkan di TV</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? '⏳ Menyimpan...' : '💾 Simpan'}
            </button>
            <Link href="/admin/donations" className="btn btn-outline">Batal</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
