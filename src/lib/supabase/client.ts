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

interface NoopResult {
  data: null
  error: { message: string }
}

interface NoopChannel {
  on: () => NoopChannel
  subscribe: () => void
}

interface NoopChain {
  from: () => NoopChain
  select: () => NoopChain
  insert: () => NoopChain
  update: () => NoopChain
  delete: () => NoopChain
  upsert: () => NoopChain
  eq: () => NoopChain
  neq: () => NoopChain
  in: () => NoopChain
  gte: () => NoopChain
  lte: () => NoopChain
  order: () => NoopChain
  limit: () => NoopChain
  single: () => NoopResult
  then: (resolve: (value: NoopResult) => unknown) => Promise<unknown>
  channel: () => NoopChannel
  removeChannel: () => void
}

// Minimal stub that won't crash during SSG/prerender
function createNoopClient(): NoopChain {
  const noop = (): NoopResult => ({ data: null, error: { message: 'Supabase not configured' } })
  const chain: NoopChain = {
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
    then: (resolve: (value: NoopResult) => unknown) => Promise.resolve(noop()).then(resolve),
    channel: () => ({ on: () => chain.channel(), subscribe: () => {} }),
    removeChannel: () => {},
  }
  return chain
}
