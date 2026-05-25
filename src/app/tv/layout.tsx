import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function TVLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
        {children}
      </div>
    </ErrorBoundary>
  )
}
