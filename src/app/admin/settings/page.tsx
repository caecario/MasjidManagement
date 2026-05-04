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
  provinsi: string
  kabkota: string
  fullscreen_interval: number
  fullscreen_duration: number
  prayer_duration_subuh: number
  prayer_duration_dzuhur: number
  prayer_duration_ashar: number
  prayer_duration_maghrib: number
  prayer_duration_isya: number
}

const prayerLabels: Record<string, string> = {
  subuh: '🌅 Subuh',
  dzuhur: '☀️ Dzuhur',
  ashar: '🌤️ Ashar',
  maghrib: '🌅 Maghrib',
  isya: '🌙 Isya',
}

export default function SettingsPage() {
  const [config, setConfig] = useState<MosqueConfig>({
    mosque_name: 'MASJID AS-SYAMS',
    tagline: 'Menerangi Hati, Menghidupkan Sunnah',
    logo_url: null,
    qris_url: null,
    city: 'Jakarta',
    country: 'ID',
    provinsi: 'DKI Jakarta',
    kabkota: 'Kota Jakarta',
    fullscreen_interval: 5,
    fullscreen_duration: 30,
    prayer_duration_subuh: 15,
    prayer_duration_dzuhur: 15,
    prayer_duration_ashar: 15,
    prayer_duration_maghrib: 10,
    prayer_duration_isya: 15,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const qrisInputRef = useRef<HTMLInputElement>(null)

  // Province / City lists from eQuran API
  const [provinsiList, setProvinsiList] = useState<string[]>([])
  const [kabkotaList, setKabkotaList] = useState<string[]>([])
  const [loadingProvinsi, setLoadingProvinsi] = useState(true)
  const [loadingKabkota, setLoadingKabkota] = useState(false)

  // Load config on mount
  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(data => setConfig(prev => ({ ...prev, ...data }))).catch(() => {})
  }, [])

  // Fetch province list on mount
  useEffect(() => {
    fetch('https://equran.id/api/v2/shalat/provinsi')
      .then(r => r.json())
      .then(data => {
        if (data.code === 200) setProvinsiList(data.data)
      })
      .catch(() => {})
      .finally(() => setLoadingProvinsi(false))
  }, [])

  // Fetch kabkota list when provinsi changes
  useEffect(() => {
    if (!config.provinsi) return
    setLoadingKabkota(true)
    fetch('https://equran.id/api/v2/shalat/kabkota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi: config.provinsi }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.code === 200) {
          setKabkotaList(data.data)
          // Auto-select first kabkota if current one is not in list
          if (!data.data.includes(config.kabkota) && data.data.length > 0) {
            setConfig(prev => ({ ...prev, kabkota: data.data[0] }))
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingKabkota(false))
  }, [config.provinsi]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const updatePrayerDuration = (prayer: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      [`prayer_duration_${prayer}`]: value,
    }))
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
              <label className="form-label">Provinsi</label>
              <select
                className="form-input form-select"
                value={config.provinsi}
                onChange={(e) => setConfig(prev => ({ ...prev, provinsi: e.target.value }))}
                disabled={loadingProvinsi}
              >
                {loadingProvinsi ? (
                  <option>Memuat provinsi...</option>
                ) : (
                  provinsiList.map(p => <option key={p} value={p}>{p}</option>)
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Kabupaten / Kota</label>
              <select
                className="form-input form-select"
                value={config.kabkota}
                onChange={(e) => setConfig(prev => ({ ...prev, kabkota: e.target.value }))}
                disabled={loadingKabkota}
              >
                {loadingKabkota ? (
                  <option>Memuat kab/kota...</option>
                ) : (
                  kabkotaList.map(k => <option key={k} value={k}>{k}</option>)
                )}
              </select>
            </div>
            <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--green-700)' }}>
                💡 Data jadwal sholat dari <strong>Kemenag RI</strong> via eQuran.id API. Pilih provinsi dan kab/kota untuk menentukan jadwal waktu sholat yang ditampilkan di TV.
              </p>
            </div>
          </div>
        </div>

        {/* TV Display Settings */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📺 Pengaturan Tampilan TV</h2>
          <div className="flex flex-col gap-md">
            <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--green-700)' }}>
                TV akan masuk mode <strong>fullscreen slideshow</strong> secara berkala. Saat fullscreen, tampilan TV hanya menampilkan slide kajian & hadist tanpa sidebar.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Interval Fullscreen</label>
                <div className="flex items-center gap-sm">
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    max={60}
                    value={config.fullscreen_interval}
                    onChange={(e) => setConfig(prev => ({ ...prev, fullscreen_interval: parseInt(e.target.value) || 5 }))}
                    style={{ width: 80, textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>menit</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  Setiap berapa menit masuk mode fullscreen
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Durasi Fullscreen</label>
                <div className="flex items-center gap-sm">
                  <input
                    className="form-input"
                    type="number"
                    min={10}
                    max={300}
                    value={config.fullscreen_duration}
                    onChange={(e) => setConfig(prev => ({ ...prev, fullscreen_duration: parseInt(e.target.value) || 30 }))}
                    style={{ width: 80, textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>detik</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  Berapa lama tampilan fullscreen ditampilkan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prayer Blank Duration */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🕐 Durasi Waktu Sholat</h2>
          <div className="flex flex-col gap-md">
            <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--green-700)' }}>
                Saat <strong>adzan</strong> → suara beep + countdown iqamah. Saat <strong>iqamah</strong> → beep + layar hitam selama durasi di bawah.
              </p>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sholat</th>
                    <th>Durasi Blank (menit)</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((prayer) => (
                    <tr key={prayer}>
                      <td style={{ fontWeight: 600 }}>{prayerLabels[prayer]}</td>
                      <td>
                        <input
                          className="form-input"
                          type="number"
                          min={5}
                          max={60}
                          value={(config as unknown as Record<string, number>)[`prayer_duration_${prayer}`]}
                          onChange={(e) => updatePrayerDuration(prayer, parseInt(e.target.value) || 15)}
                          style={{ width: 80, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
                        Layar blank setelah iqamah
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
