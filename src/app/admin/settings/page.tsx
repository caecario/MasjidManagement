'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface MosqueConfig {
  mosque_name: string
  tagline: string
  logo_url: string | null
  qris_url: string | null
  city: string
  country: string
  latitude: number
  longitude: number
  method: number
}

export default function SettingsPage() {
  const [config, setConfig] = useState<MosqueConfig>({
    mosque_name: 'MASJID AS-SYAMS',
    tagline: 'Menerangi Hati, Menghidupkan Sunnah',
    logo_url: null,
    qris_url: null,
    city: 'Jakarta',
    country: 'ID',
    latitude: -6.2088,
    longitude: 106.8456,
    method: 20,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const qrisInputRef = useRef<HTMLInputElement>(null)

  // Load config on mount
  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(data => setConfig(prev => ({ ...prev, ...data }))).catch(() => {})
  }, [])

  const showMsg = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const uploadFile = async (file: File, type: string): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) return null
    const data = await res.json()
    return data.url
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile(file, 'logo')
    if (url) {
      setConfig(prev => ({ ...prev, logo_url: url }))
      showMsg('✅ Logo berhasil diupload!')
    } else {
      showMsg('⚠️ Gagal upload logo')
    }
    setUploading(false)
  }

  const handleQrisChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile(file, 'qris')
    if (url) {
      setConfig(prev => ({ ...prev, qris_url: url }))
      showMsg('✅ QRIS berhasil diupload!')
    } else {
      showMsg('⚠️ Gagal upload QRIS')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        showMsg('✅ Pengaturan berhasil disimpan! Refresh TV untuk melihat perubahan.')
      } else {
        showMsg('⚠️ Gagal menyimpan')
      }
    } catch {
      showMsg('⚠️ Gagal menyimpan')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Pengaturan Masjid</h1>
          <div className="admin-breadcrumb">
            <Link href="/admin">Dashboard</Link><span>›</span><span>Pengaturan</span>
          </div>
        </div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Identity */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🕌 Identitas Masjid</h2>
          <div className="flex flex-col gap-md">
            <div className="form-group">
              <label className="form-label">Nama Masjid</label>
              <input className="form-input" value={config.mosque_name} onChange={(e) => setConfig(prev => ({ ...prev, mosque_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="form-input" value={config.tagline} onChange={(e) => setConfig(prev => ({ ...prev, tagline: e.target.value }))} />
            </div>

            {/* Logo */}
            <div className="form-group">
              <label className="form-label">Logo Masjid</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', border: '2px solid var(--gray-200)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', flexShrink: 0 }}>
                  {config.logo_url ? (
                    <img src={config.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>🕌</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                  <button className="btn btn-outline btn-sm" onClick={() => logoInputRef.current?.click()} disabled={uploading}>
                    {uploading ? '⏳ Uploading...' : '📎 Upload Logo'}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.375rem' }}>
                    PNG, JPG, maks 2MB. Rasio 1:1.
                  </p>
                </div>
              </div>
            </div>

            {/* QRIS */}
            <div className="form-group">
              <label className="form-label">QRIS Donasi</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 100, height: 100, borderRadius: 'var(--radius-md)', border: '2px dashed var(--gray-300)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', flexShrink: 0 }}>
                  {config.qris_url ? (
                    <img src={config.qris_url} alt="QRIS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>📱</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input ref={qrisInputRef} type="file" accept="image/*" onChange={handleQrisChange} style={{ display: 'none' }} />
                  <button className="btn btn-outline btn-sm" onClick={() => qrisInputRef.current?.click()} disabled={uploading}>
                    {uploading ? '⏳ Uploading...' : '📎 Upload QRIS'}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.375rem' }}>
                    Upload gambar QRIS — ditampilkan di TV
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📍 Lokasi & Waktu Sholat</h2>
          <div className="flex flex-col gap-md">
            <div className="form-group">
              <label className="form-label">Kota</label>
              <input className="form-input" value={config.city} onChange={(e) => setConfig(prev => ({ ...prev, city: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Negara</label>
              <input className="form-input" value={config.country} onChange={(e) => setConfig(prev => ({ ...prev, country: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" type="number" step="0.0001" value={config.latitude} onChange={(e) => setConfig(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" type="number" step="0.0001" value={config.longitude} onChange={(e) => setConfig(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Metode Perhitungan</label>
              <select className="form-input form-select" value={config.method} onChange={(e) => setConfig(prev => ({ ...prev, method: parseInt(e.target.value) }))}>
                <option value={20}>Kemenag RI</option>
                <option value={11}>JAKIM (Malaysia)</option>
                <option value={3}>MWL</option>
                <option value={2}>ISNA</option>
                <option value={4}>Umm al-Qura</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Menyimpan...' : '💾 Simpan Pengaturan'}
        </button>
      </div>
    </div>
  )
}
