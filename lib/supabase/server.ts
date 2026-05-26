import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions
} from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database"

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co"
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
  return createSupabaseServerClient<Database>(
    url,
    key,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
          return cookieStore.getAll()
        },
        async setAll(cookiesToSet: CookieToSet[]) {
          try {
            const cookieStore = await cookies()
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components nao podem gravar cookies; middleware/actions cuidam disso.
          }
        }
      }
    }
  )
}
