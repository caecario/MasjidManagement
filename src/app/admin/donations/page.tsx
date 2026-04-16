'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Donation } from '@/lib/types'
import { formatRupiah, getPercentage } from '@/lib/utils'

const demoDonations: Donation[] = [
  { id: '1', program_name: 'Pembangunan Tempat Wudhu', image_url: null, target_amount: 75000000, collected_amount: 32500000, status: 'active', created_at: '' },
  { id: '2', program_name: 'Renovasi Toilet Masjid', image_url: null, target_amount: 50000000, collected_amount: 48000000, status: 'active', created_at: '' },
  { id: '3', program_name: 'Pengadaan Al-Quran', image_url: null, target_amount: 15000000, collected_amount: 15000000, status: 'completed', created_at: '' },
]

export default function DonationsPage() {
  const [items, setItems] = useState<Donation[]>(demoDonations)
  const [useSupabase, setUseSupabase] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false })
      if (!error && data?.length) {
        setItems(data)
        setUseSupabase(true)
      }
    } catch { /* not configured */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus program donasi ini?')) return
    if (useSupabase) {
      await supabase.from('donations').delete().eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.filter(d => d.id !== id))
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Donasi / Program</h1>
          <div className="admin-breadcrumb">
            <Link href="/admin">Dashboard</Link><span>›</span><span>Donasi / Program</span>
          </div>
        </div>
        <Link href="/admin/donations/new" className="btn btn-gold">+ Tambah Program Donasi</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {items.map((d) => {
          const pct = getPercentage(d.collected_amount, d.target_amount)
          return (
            <div key={d.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Image */}
              {d.image_url ? (
                <div style={{ height: 140, overflow: 'hidden' }}>
                  <img src={d.image_url} alt={d.program_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ height: 60, background: 'linear-gradient(135deg, var(--green-100), var(--green-50))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>💰</span>
                </div>
              )}

              <div style={{ padding: '1rem' }}>
                {/* Header */}
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <span className={`badge ${d.status === 'active' ? 'badge-green' : d.status === 'completed' ? 'badge-gold' : 'badge-gray'}`}>
                    {d.status === 'active' ? '🟢 Aktif' : d.status === 'completed' ? '✅ Selesai' : 'Draft'}
                  </span>
                  <div className="flex gap-xs">
                    <Link href={`/admin/donations/${d.id}/edit`} className="btn-icon" style={{ color: 'var(--green-700)' }} title="Edit">✏️</Link>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(d.id)}>🗑️</button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.75rem' }}>{d.program_name}</h3>

                <div className="flex justify-between" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Terkumpul</span>
                  <span style={{ fontWeight: 700, color: 'var(--green-600)' }}>{formatRupiah(d.collected_amount)}</span>
                </div>

                <div className="progress-bar" style={{ marginBottom: '0.375rem' }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>

                <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  <span>{pct}%</span>
                  <span>Target: {formatRupiah(d.target_amount)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
