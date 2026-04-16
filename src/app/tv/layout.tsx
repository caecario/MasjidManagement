export default function TVLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
      {children}
    </div>
  )
}
