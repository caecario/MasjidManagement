'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Hadith } from '@/lib/types'

const demoHadiths: Hadith[] = [
  { id: '1', content: 'Sesungguhnya setiap amalan tergantung pada niatnya. Dan sesungguhnya setiap orang akan mendapatkan apa yang ia niatkan.', source: 'HR. Bukhari & Muslim', status: 'active', created_at: '' },
  { id: '2', content: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.', source: 'HR. Ahmad', status: 'active', created_at: '' },
  { id: '3', content: 'Barangsiapa beriman kepada Allah dan hari akhir, maka hendaklah ia berkata baik atau diam.', source: 'HR. Bukhari & Muslim', status: 'active', created_at: '' },
]

export default function HadithsPage() {
  const [items, setItems] = useState<Hadith[]>(demoHadiths)
  const [newContent, setNewContent] = useState('')
  const [newSource, setNewSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [useSupabase, setUseSupabase] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('hadiths').select('*').order('created_at', { ascending: false })
      if (!error && data?.length) {
        setItems(data)
        setUseSupabase(true)
      }
    } catch { /* not configured */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdd = async () => {
    if (!newContent.trim() || !newSource.trim()) return
    setLoading(true)

    if (useSupabase) {
      const { error } = await supabase.from('hadiths').insert({
        content: newContent.trim(),
        source: newSource.trim(),
        status: 'active',
      })
      if (!error) await fetchData()
    } else {
      setItems(prev => [{
        id: String(Date.now()),
        content: newContent.trim(),
        source: newSource.trim(),
        status: 'active',
        created_at: new Date().toISOString(),
      }, ...prev])
    }

    setNewContent('')
    setNewSource('')
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus hadits ini?')) return
    if (useSupabase) {
      await supabase.from('hadiths').delete().eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.filter(h => h.id !== id))
    }
  }

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    if (useSupabase) {
      await supabase.from('hadiths').update({ status: newStatus }).eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h))
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Ayat & Hadits</h1>
          <div className="admin-breadcrumb">
            <Link href="/admin">Dashboard</Link><span>›</span><span>Ayat & Hadits</span>
          </div>
        </div>
      </div>

      {/* Add new */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem' }}>Tambah Hadits / Ayat Baru</h2>
        <div className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Konten *</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Isi hadits atau ayat..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>
          <div className="flex gap-md items-center">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Sumber *</label>
              <input className="form-input" placeholder="HR. Bukhari & Muslim" value={newSource} onChange={(e) => setNewSource(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={handleAdd} disabled={loading}>
              {loading ? '⏳' : '+ Tambah'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-md">
        {items.map((h) => (
          <div key={h.id} className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
              <button
                className={`badge ${h.status === 'active' ? 'badge-green' : 'badge-gray'}`}
                onClick={() => handleToggle(h.id, h.status)}
                style={{ cursor: 'pointer' }}
              >
                {h.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </button>
              <div className="flex gap-xs">
                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(h.id)}>🗑️</button>
              </div>
            </div>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--gray-800)',
              fontStyle: 'italic',
              marginBottom: '0.5rem',
            }}>
              &ldquo;{h.content}&rdquo;
            </p>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gold-600)' }}>
              — {h.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
