import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest, NextResponse } from 'next/server'
import { cookies as nextCookies } from 'next/headers'
import type { Database } from '@/types/database'

type CookieGetter = typeof nextCookies

let browserClient: SupabaseClient<Database> | null = null

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return { supabaseUrl, supabaseAnonKey }
}

function createServerSupabaseClient<Db = Database>(cookieGetter: CookieGetter = nextCookies) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  return createServerClient<Db>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: async () => (await cookieGetter()).getAll(),
      setAll: async (cookiesToSet) => {
        try {
          const cookieStore = await cookieGetter()
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
