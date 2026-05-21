import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/types/database"

const protectedRoutes = ["/dashboard", "/ranking", "/chat", "/perfil"]
const adminRoutes = ["/admin"]

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (!user && (isProtectedRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user && isAdminRoute) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
    const profile = data as { is_admin: boolean } | null

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/admin",
    "/dashboard/:path*",
    "/ranking/:path*",
    "/chat/:path*",
    "/perfil/:path*",
    "/admin/:path*"
  ]
}
