import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type CookieOptions = {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: 'lax' | 'strict' | 'none' | boolean
  secure?: boolean
}

type CookieStore = {
  getAll: () => Array<{ name: string; value: string }>
  set?: (name: string, value: string, options?: CookieOptions) => void
}

type CookieGetter = () => CookieStore | Promise<CookieStore>

let browserClient: SupabaseClient<Database> | null = null

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return { supabaseUrl, supabaseAnonKey }
}

function createServerSupabaseClient<Db = Database>(cookieGetter: CookieGetter) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  return createServerClient<Db>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: async () => {
        const cookieStore = await cookieGetter()
        return cookieStore.getAll()
      },
      setAll: async (cookiesToSet) => {
        try {
          const cookieStore = await cookieGetter()
          if (!cookieStore.set) {
            return
          }

          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options)
          }
        } catch {
          // Server Components can't mutate cookies. This is expected in read-only contexts.
        }
      },
    },
  })
}

export function createClientComponentClient<Db = Database>() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return browserClient as unknown as SupabaseClient<Db>
}

export function createRouteHandlerClient<Db = Database>({ cookies }: { cookies: CookieGetter }) {
  return createServerSupabaseClient<Db>(cookies)
}

export function createServerComponentClient<Db = Database>({ cookies }: { cookies: CookieGetter }) {
  return createServerSupabaseClient<Db>(cookies)
}

export function createMiddlewareClient<Db = Database>({
  req,
  res,
}: {
  req: NextRequest
  res: NextResponse
}) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  return createServerClient<Db>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () =>
        req.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        })),
      setAll: (cookiesToSet) => {
        for (const cookie of cookiesToSet) {
          req.cookies.set(cookie.name, cookie.value)
          res.cookies.set(cookie.name, cookie.value, cookie.options)
        }
      },
    },
  })
}
