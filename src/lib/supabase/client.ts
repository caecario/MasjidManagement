import { createBrowserClient } from '@supabase/ssr'

// Singleton — reuse the same client across all components
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return safe no-op client during prerender or when env vars are missing
  if (!url || !key) {
    return createNoopClient()
  }

  if (!client) {
    client = createBrowserClient(url, key)
  }
  return client
}

// Minimal stub that won't crash during SSG/prerender
function createNoopClient(): any {
  const noop = () => ({ data: null, error: { message: 'Supabase not configured' } })
  const chain: any = {
    from: () => chain,
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    upsert: () => chain,
    eq: () => chain,
    neq: () => chain,
    in: () => chain,
    gte: () => chain,
    lte: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => noop(),
    then: (resolve: any) => resolve(noop()),
    channel: () => ({ on: () => chain, subscribe: () => {} }),
    removeChannel: () => {},
  }
  // Make chain thenable so `await supabase.from(...).select(...)` works
  chain.then = (resolve: any) => Promise.resolve(noop()).then(resolve)
  return chain
}
