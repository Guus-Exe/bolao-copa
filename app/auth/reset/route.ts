import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host") // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/reset-password`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/reset-password`)
      } else {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
    }
  }

  // Se der erro ou não tiver código
  return NextResponse.redirect(`${origin}/login?message=Link+inválido+ou+expirado`)
}
