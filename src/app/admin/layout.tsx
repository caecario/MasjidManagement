import Sidebar from '@/components/admin/Sidebar'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-content" role="main">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  )
}
