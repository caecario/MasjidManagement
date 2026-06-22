'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Finance } from '@/lib/types'
import { formatRupiah } from '@/lib/utils'

const demoFinances: Finance[] = [
  { id: '1', as_of_date: '2026-04-13', label: 'April 2026 - Minggu 2', total_income: 12500000, total_expense: 8200000, created_at: '' },
  { id: '2', as_of_date: '2026-04-06', label: 'April 2026 - Minggu 1', total_income: 9800000, total_expense: 6500000, created_at: '' },
  { id: '3', as_of_date: '2026-03-30', label: 'Maret 2026 - Minggu 4', total_income: 15200000, total_expense: 11800000, created_at: '' },
]

export default function FinancesPage() {
  const [items, setItems] = useState<Finance[]>(demoFinances)
  const [useSupabase, setUseSupabase] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formLabel, setFormLabel] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formIncome, setFormIncome] = useState('')
  const [formExpense, setFormExpense] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState('')

  const showMsg = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('finances').select('*').order('as_of_date', { ascending: false })
      if (!error && data?.length) {
        setItems(data)
        setUseSupabase(true)
      }
    } catch { /* not configured */ }
    setInitialLoading(false)
  }

  useEffect(() => {
    void fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setFormLabel('')
    setFormDate('')
    setFormIncome('')
    setFormExpense('')
    setEditId(null)
    setShowForm(false)
  }

  const startEdit = (f: Finance) => {
    setEditId(f.id)
    setFormLabel(f.label || '')
    setFormDate(f.as_of_date)
    setFormIncome(String(f.total_income))
    setFormExpense(String(f.total_expense))
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formLabel || !formDate || !formIncome || !formExpense) return
    setLoading(true)

    const payload = {
      label: formLabel,
      as_of_date: formDate,
      total_income: parseInt(formIncome),
      total_expense: parseInt(formExpense),
    }

    if (editId) {
      // Update
      if (useSupabase) {
        const supabase = createClient()
        await supabase.from('finances').update(payload).eq('id', editId)
        await fetchData()
      } else {
        setItems(prev => prev.map(f => f.id === editId ? { ...f, ...payload } : f))
      }
    } else {
      // Insert
      if (useSupabase) {
        const supabase = createClient()
        await supabase.from('finances').insert(payload)
        await fetchData()
      } else {
        setItems(prev => [{ id: String(Date.now()), ...payload, created_at: new Date().toISOString() }, ...prev])
      }
    }

    resetForm()
    setLoading(false)
    showMsg('✅ Laporan berhasil disimpan')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus laporan ini?')) return
    if (useSupabase) {
      const supabase = createClient()
      await supabase.from('finances').delete().eq('id', id)
      await fetchData()
    } else {
      setItems(prev => prev.filter(f => f.id !== id))
    }
  }

  const latestIncome = items[0]?.total_income || 0
  const latestExpense = items[0]?.total_expense || 0

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Laporan Keuangan</h1>
          <div className="admin-breadcrumb">
            <Link href="/admin">Dashboard</Link><span>›</span><span>Laporan Keuangan</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm && !editId ? '✕ Tutup' : '+ Tambah Laporan'}
        </button>
      </div>

      {message && (
        <div className={`toast ${message.includes('✅') ? 'toast-success' : 'toast-error'}`}>
          {message}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1rem', borderLeft: editId ? '4px solid var(--gold-500)' : '4px solid var(--green-600)' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            {editId ? '✏️ Edit Laporan' : '+ Tambah Laporan Baru'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Periode</label>
              <input className="form-input" placeholder="April 2026 - Minggu 2" value={formLabel} onChange={(e) => setFormLabel(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input className="form-input" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Pemasukan (Rp)</label>
              <input className="form-input" type="number" placeholder="12500000" value={formIncome} onChange={(e) => setFormIncome(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Pengeluaran (Rp)</label>
              <input className="form-input" type="number" placeholder="8200000" value={formExpense} onChange={(e) => setFormExpense(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? '⏳' : editId ? '💾 Update' : '💾 Simpan'}
            </button>
            <button className="btn btn-outline" onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: 'var(--green-600)' }}>{formatRupiah(latestIncome)}</div>
            <div className="stat-label">Pemasukan Periode Ini</div>
          </div>
          <div className="stat-icon">⬇️</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--danger)' }}>
          <div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{formatRupiah(latestExpense)}</div>
            <div className="stat-label">Pengeluaran Periode Ini</div>
          </div>
          <div className="stat-icon">⬆️</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--gold-500)' }}>
          <div>
            <div className="stat-value">{formatRupiah(latestIncome - latestExpense)}</div>
            <div className="stat-label">Saldo</div>
          </div>
          <div className="stat-icon">💰</div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Tanggal</th>
                <th>Pemasukan</th>
                <th>Pengeluaran</th>
                <th>Saldo</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {initialLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan={6}><div className="skeleton skeleton-line" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📊</div>
                      <div className="empty-state-text">Belum ada laporan keuangan</div>
                      <div className="empty-state-hint">Klik &quot;+ Tambah Laporan&quot; untuk mulai</div>
                    </div>
                  </td>
                </tr>
              ) : (
              items.map((f) => (
                <tr key={f.id} className="animate-fade-in">
                  <td style={{ fontWeight: 600 }}>{f.label}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{f.as_of_date}</td>
                  <td style={{ color: 'var(--green-600)', fontWeight: 600 }}>{formatRupiah(f.total_income)}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatRupiah(f.total_expense)}</td>
                  <td style={{ fontWeight: 700 }}>{formatRupiah(f.total_income - f.total_expense)}</td>
                  <td>
                    <div className="flex gap-xs">
                      <button className="btn-icon" style={{ color: 'var(--green-700)' }} onClick={() => startEdit(f)} title="Edit">✏️</button>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(f.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
