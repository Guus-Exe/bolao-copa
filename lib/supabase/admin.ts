import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

let adminInstance: ReturnType<typeof createClient<Database>> | null = null

function getClient() {
  if (!adminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      // Retorna cliente placeholder durante o build se as vars estivem ausentes
      return createClient<Database>(
        url || "https://placeholder-url.supabase.co",
        key || "placeholder-key",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }

    adminInstance = createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return adminInstance
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop)
    if (typeof value === "function") {
      return value.bind(client)
    }
    return value
  }
})

