'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

/** Strip timezone suffix e.g. "04:45 (WIB)" → "04:45" */
function cleanTime(s: string): string {
  return s.replace(/\s*\(.*\)$/, '').trim()
}

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

  // On mount: fetch config → call AlAdhan with same lat/long/method as TV
  useEffect(() => {
    async function load() {
      try {
        // 1. Get mosque config (lat/long/method)
        const cfgRes = await fetch('/api/config')
        const cfg = await cfgRes.json()
        const lat = cfg.latitude ?? -6.2088
        const lng = cfg.longitude ?? 106.8456
        const method = cfg.method ?? 20

        // 2. Call AlAdhan API (same as TV)
        const today = new Date()
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`
        const res = await fetch(url)
        const data = await res.json()

        if (data.code === 200) {
          const t = data.data.timings
          setPrayers(prev => ({
            subuh: { time: cleanTime(t.Fajr), iqamah: prev.subuh.iqamah },
            dzuhur: { time: cleanTime(t.Dhuhr), iqamah: prev.dzuhur.iqamah },
            ashar: { time: cleanTime(t.Asr), iqamah: prev.ashar.iqamah },
            maghrib: { time: cleanTime(t.Maghrib), iqamah: prev.maghrib.iqamah },
            isya: { time: cleanTime(t.Isha), iqamah: prev.isya.iqamah },
          }))
        }

        // 3. Load iqamah overrides from Supabase prayer_times table
        const supabase = createClient()
        const { data: ptData } = await supabase.from('prayer_times').select('*')
        if (ptData?.length) {
          setPrayers(prev => {
            const updated = { ...prev }
            for (const row of ptData) {
              const name = row.prayer_name as string
              if (updated[name]) {
                updated[name] = {
                  ...updated[name],
                  iqamah: row.iqamah_offset ?? updated[name].iqamah,
                }
              }
            }
            return updated
          })
        }
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
      const supabase = createClient()
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
              Waktu sholat otomatis diambil dari API AlAdhan sesuai setting lokasi
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
            ⏳ Mengambil waktu sholat dari AlAdhan...
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Sholat</th>
                  <th>Waktu Adzan (AlAdhan)</th>
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
