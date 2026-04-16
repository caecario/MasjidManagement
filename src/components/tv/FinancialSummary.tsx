'use client'

import type { Finance } from '@/lib/types'
import { formatRupiah } from '@/lib/utils'

interface FinancialSummaryProps {
  finance: Finance | null
}

export default function FinancialSummary({ finance }: FinancialSummaryProps) {
  if (!finance) return null

  const balance = finance.total_income - finance.total_expense

  return (
    <div className="tv-financial">
      {/* Header spanning all columns */}
      <div style={{
        gridColumn: '1 / -1',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--gray-200)',
        marginBottom: '0.25rem',
      }}>
        <span style={{ fontSize: '1rem' }}>📊</span>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--gray-600)',
        }}>
          Laporan Keuangan {finance.label || ''}
        </span>
      </div>

      {/* Income */}
      <div className="tv-financial-item">
        <div className="tv-financial-label">
          ⬇️ Pemasukan
        </div>
        <div className="tv-financial-amount income">
          {formatRupiah(finance.total_income)}
        </div>
      </div>

      {/* Expense */}
      <div className="tv-financial-item">
        <div className="tv-financial-label">
          ⬆️ Pengeluaran
        </div>
        <div className="tv-financial-amount expense">
          {formatRupiah(finance.total_expense)}
        </div>
      </div>

      {/* Balance */}
      <div className="tv-financial-item">
        <div className="tv-financial-label">
          💰 Saldo
        </div>
        <div className="tv-financial-amount balance">
          {formatRupiah(balance)}
        </div>
      </div>
    </div>
  )
}
