import { redirect } from "next/navigation"
import Link from "next/link"
import {
  CalendarDays,
  LockKeyhole,
  MessageCircle,
  Trophy,
  UserRound
} from "lucide-react"
import type { ReactNode } from "react"

import { signOut } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("username, avatar_url, is_admin")
    .eq("id", user.id)
    .single()

  const profile = profileData as {
    username: string
    avatar_url: string | null
    is_admin: boolean
  } | null
  const username = profile?.username ?? "participante"

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-strong)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar username={username} url={profile?.avatar_url ?? null} />
            <div>
              <span className="block font-[family-name:var(--font-display)] text-3xl tracking-wide">
                Bolão da Copa
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                Ola, {username}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <nav className="flex flex-wrap gap-2">
              <NavItem href="/dashboard" icon={<CalendarDays size={16} />} label="Jogos" />
              <NavItem href="/ranking" icon={<Trophy size={16} />} label="Ranking" />
              <NavItem href="/chat" icon={<MessageCircle size={16} />} label="Chat" />
              <NavItem href="/perfil" icon={<UserRound size={16} />} label="Perfil" />
              {profile?.is_admin ? (
                <AdminControlLink
                  href="/admin/controle"
                  icon={<LockKeyhole size={16} />}
                  label="Controle"
                />
              ) : null}
            </nav>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label
}: {
  href: string
  icon: ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-strong)] px-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
    >
      {icon}
      {label}
    </Link>
  )
}

function AdminControlLink({
  href,
  icon,
  label
}: {
  href: string
  icon: ReactNode
  label: string
}) {
  return (
    <a
      href={href}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-strong)] px-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
    >
      {icon}
      {label}
    </a>
  )
}

function Avatar({ username, url }: { username: string; url: string | null }) {
  const initials = username.slice(0, 2).toUpperCase()

  if (url) {
    return (
      <div
        aria-label={`Avatar de ${username}`}
        className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--border-strong)]"
        role="img"
        style={{
          backgroundImage: `url(${url})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-[var(--green-700)]",
        "font-semibold text-white ring-1 ring-[var(--border-strong)]"
      )}
    >
      {initials}
    </div>
  )
}
