'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const defaultPrayers = {
  subuh: { time: '04:45', iqamah: 10 },
  dzuhur: { time: '12:03', iqamah: 10 },
  ashar: { time: '15:20', iqamah: 10 },
  maghrib: { time: '18:05', iqamah: 5 },
  isya: { time: '19:15', iqamah: 10 },
}

const labels: Record<string, string> = {
  subuh: '🌅 Subuh',
  dzuhur: '☀️ Dzuhur',
  ashar: '🌤️ Ashar',
  maghrib: '🌅 Maghrib',
  isya: '🌙 Isya',
}

export default function PrayerTimesPage() {
  const [prayers, setPrayers] = useState(defaultPrayers)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const updateTime = (key: string, value: string) => {
    setPrayers(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof prev], time: value } }))
  }

  const updateIqamah = (key: string, value: number) => {
    setPrayers(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof prev], iqamah: value } }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const supabase = createClient()
      // Upsert each prayer time
      for (const [name, data] of Object.entries(prayers)) {
        await supabase.from('prayer_times').upsert({
          prayer_name: name,
          time: data.time,
          iqamah_offset: data.iqamah,
        }, { onConflict: 'prayer_name' })
      }
      setMessage('✅ Berhasil disimpan!')
    } catch {
      setMessage('⚠️ Supabase belum dikonfigurasi.')
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
              Waktu sholat otomatis diambil dari API AlAdhan (Kemenag RI)
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--green-700)' }}>
              Override manual di bawah akan menggantikan waktu dari API.
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
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sholat</th>
                <th>Waktu Adzan</th>
                <th>Jeda Iqamah (menit)</th>
                <th>Waktu Iqamah</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(prayers).map(([key, val]) => {
                const [h, m] = val.time.split(':').map(Number)
                const iqM = m + val.iqamah
                const iqH = h + Math.floor(iqM / 60)
                const iqTime = `${String(iqH).padStart(2, '0')}:${String(iqM % 60).padStart(2, '0')}`
                return (
                  <tr key={key}>
                    <td style={{ fontWeight: 600, fontSize: '1rem' }}>{labels[key]}</td>
                    <td>
                      <input
                        className="form-input"
                        type="time"
                        value={val.time}
                        onChange={(e) => updateTime(key, e.target.value)}
                        style={{ width: 120, textAlign: 'center', fontWeight: 700 }}
                      />
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
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
