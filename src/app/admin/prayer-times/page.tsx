'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const labels: Record<string, string> = {
  subuh: '🌅 Subuh',
  dzuhur: '☀️ Dzuhur',
  ashar: '🌤️ Ashar',
  maghrib: '🌅 Maghrib',
  isya: '🌙 Isya',
}

interface PrayerEntry {
  time: string
  iqamah: number
}

type PrayerMap = Record<string, PrayerEntry>

export default function PrayerTimesPage() {
  const [prayers, setPrayers] = useState<PrayerMap>({
    subuh: { time: '--:--', iqamah: 10 },
    dzuhur: { time: '--:--', iqamah: 10 },
    ashar: { time: '--:--', iqamah: 10 },
    maghrib: { time: '--:--', iqamah: 5 },
    isya: { time: '--:--', iqamah: 10 },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // On mount: fetch config → call eQuran.id with same provinsi/kabkota as TV
  useEffect(() => {
    async function load() {
      try {
        // 1. Get mosque config (provinsi/kabkota + iqamah offsets)
        const cfgRes = await fetch('/api/config')
        const cfg = await cfgRes.json()
        const provinsi = cfg.provinsi ?? 'DKI Jakarta'
        const kabkota = cfg.kabkota ?? 'Kota Jakarta'

        // Load iqamah offsets from config
        const iqamahDefaults: Record<string, number> = {
          subuh: cfg.iqamah_subuh ?? 10,
          dzuhur: cfg.iqamah_dzuhur ?? 10,
          ashar: cfg.iqamah_ashar ?? 10,
          maghrib: cfg.iqamah_maghrib ?? 5,
          isya: cfg.iqamah_isya ?? 10,
        }

        // 2. Call eQuran.id API (same as TV)
        const today = new Date()
        const bulan = today.getMonth() + 1
        const tahun = today.getFullYear()
        const todayDate = today.getDate()

        const res = await fetch('https://equran.id/api/v2/shalat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provinsi, kabkota, bulan, tahun }),
        })
        const data = await res.json()

        if (data.code === 200 && data.data?.jadwal) {
          const todaySchedule = data.data.jadwal.find(
            (j: { tanggal: number }) => j.tanggal === todayDate
          )
          if (todaySchedule) {
            setPrayers({
              subuh: { time: todaySchedule.subuh, iqamah: iqamahDefaults.subuh },
              dzuhur: { time: todaySchedule.dzuhur, iqamah: iqamahDefaults.dzuhur },
              ashar: { time: todaySchedule.ashar, iqamah: iqamahDefaults.ashar },
              maghrib: { time: todaySchedule.maghrib, iqamah: iqamahDefaults.maghrib },
              isya: { time: todaySchedule.isya, iqamah: iqamahDefaults.isya },
            })
          }
        }

        // Iqamah offsets are now centralized in mosque_config
      } catch (err) {
        console.error('Failed to load prayer times:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateIqamah = (key: string, value: number) => {
    setPrayers(prev => ({ ...prev, [key]: { ...prev[key], iqamah: value } }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      // Save iqamah offsets to mosque_config via /api/config
      const iqamahConfig: Record<string, number> = {}
      for (const [name, data] of Object.entries(prayers)) {
        iqamahConfig[`iqamah_${name}`] = data.iqamah
      }
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(iqamahConfig),
      })
      if (res.ok) {
        setMessage('✅ Jeda iqamah berhasil disimpan! Refresh TV untuk melihat perubahan.')
      } else {
        setMessage('⚠️ Gagal menyimpan')
      }
    } catch {
      setMessage('⚠️ Gagal menyimpan')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Jadwal Sholat</h1>
          <div className="admin-breadcrumb">
            <Link href="/admin">Dashboard</Link><span>›</span><span>Jadwal Sholat</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', background: 'var(--green-50)', border: '1px solid var(--green-200)' }}>
        <div className="flex items-center gap-sm">
          <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--green-800)' }}>
              Waktu sholat otomatis diambil dari eQuran.id (Kemenag RI) sesuai setting lokasi
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--green-700)' }}>
              Waktu di bawah sama persis dengan yang ditampilkan di TV. Anda bisa mengatur jeda iqamah.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          background: message.includes('✅') ? 'var(--green-50)' : '#FFEBEE',
          color: message.includes('✅') ? 'var(--green-700)' : 'var(--danger)',
        }}>
          {message}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>📅 Jadwal Hari Ini</h2>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
            ⏳ Mengambil waktu sholat dari eQuran.id...
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Sholat</th>
                  <th>Waktu Adzan (eQuran.id)</th>
                  <th>Jeda Iqamah (menit)</th>
                  <th>Waktu Iqamah</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(prayers).map(([key, val]) => {
                  const [h, m] = val.time.split(':').map(Number)
                  const iqM = m + val.iqamah
                  const iqH = h + Math.floor(iqM / 60)
                  const iqTime = isNaN(h) ? '--:--' : `${String(iqH).padStart(2, '0')}:${String(iqM % 60).padStart(2, '0')}`
                  return (
                    <tr key={key}>
                      <td style={{ fontWeight: 600, fontSize: '1rem' }}>{labels[key]}</td>
                      <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                        {val.time}
                      </td>
                      <td>
                        <input
                          className="form-input"
                          type="number"
                          value={val.iqamah}
                          onChange={(e) => updateIqamah(key, parseInt(e.target.value) || 0)}
                          style={{ width: 80, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ color: 'var(--green-600)', fontWeight: 600 }}>{iqTime}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Jeda Iqamah'}
          </button>
        </div>
      </div>
    </div>
  )
}
