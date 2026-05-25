import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Verifies that the request comes from an authenticated user.
 * Returns the user if authenticated, or an error NextResponse.
 */
export async function requireAuth(): Promise<
  | { authenticated: true; userId: string }
  | { authenticated: false; response: NextResponse }
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: { code: 'AUTH_UNAVAILABLE', message: 'Auth service not configured' } },
        { status: 503 }
      ),
    }
  }

  try {
    const { createServerClient } = await import('@supabase/ssr')
    const cookieStore = await cookies()
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only in API routes
        },
      },
    })

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        ),
      }
    }

    return { authenticated: true, userId: user.id }
  } catch (error: unknown) {
    console.error('Auth check failed:', error)
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication check failed' } },
        { status: 500 }
      ),
    }
  }
}
