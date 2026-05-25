import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  CalendarDays,
  LockKeyhole,
  MessageCircle,
  Trophy,
  UserRound,
  LogOut
} from "lucide-react"
import type { ReactNode } from "react"

import { signOut } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { OnboardingModal } from "@/components/onboarding/OnboardingModal"
import { PageTitle } from "@/components/layout/PageTitle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getRankingEntries } from "@/lib/ranking"

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

  // Busca perfil e ranking em paralelo após a verificação de autenticação
  const [profileResult, rankingResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, avatar_url, is_admin")
      .eq("id", user.id)
      .single(),
    getRankingEntries()
  ])

  const profile = profileResult.data as {
    username: string
    avatar_url: string | null
    is_admin: boolean
  } | null
  const username = profile?.username ?? "participante"

  const { ranking } = rankingResult
  const currentUserEntry = ranking.find((r) => r.user_id === user.id)
  const userPosition = currentUserEntry?.position ?? 0
  const isTopPosition = userPosition > 0 && userPosition <= 4

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border-strong)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <PageTitle />
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] py-1 pl-4 pr-1 ring-offset-[var(--bg-base)] transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--green-500)]">
                <span className="max-w-[100px] truncate text-sm font-medium text-[var(--text-secondary)] sm:max-w-[150px] md:max-w-[200px]">
                  {username}
                </span>
                {isTopPosition && (
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
                      userPosition === 1 ? "bg-yellow-400 text-yellow-950" : "",
                      userPosition === 2 ? "bg-slate-300 text-slate-900" : "",
                      userPosition === 3 ? "bg-amber-600 text-amber-50" : "",
                      userPosition === 4 ? "bg-[var(--green-500)] text-white" : ""
                    )}
                  >
                    {userPosition}º
                  </span>
                )}
                <Avatar username={username} url={profile?.avatar_url ?? null} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-strong)]">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{username}</p>
                    <p className="text-xs leading-none text-[var(--text-secondary)]">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--border-strong)]" />
                <DropdownMenuItem className="p-0 hover:bg-transparent focus:bg-transparent">
                  <form action={signOut} className="w-full">
                    <button type="submit" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-[var(--bg-surface)] text-red-400 hover:text-red-300">
                      <LogOut size={16} />
                      <span>Sair</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navegação Desktop */}
        <div className="hidden border-t border-[var(--border-strong)] md:block">
          <nav className="mx-auto flex max-w-6xl overflow-x-auto px-4 py-2">
            <div className="flex gap-2">
              <NavItem href="/dashboard" icon={<CalendarDays size={16} />} label="Jogos" />
              <NavItem href="/ranking" icon={<Trophy size={16} />} label="Ranking" />
              <NavItem href="/regras" icon={<BookOpen size={16} />} label="Regras" />
              <NavItem href="/chat" icon={<MessageCircle size={16} />} label="Chat" />
              <NavItem href="/perfil" icon={<UserRound size={16} />} label="Perfil" />
              {profile?.is_admin ? (
                <AdminControlLink
                  href="/admin/controle"
                  icon={<LockKeyhole size={16} />}
                  label="Controle"
                />
              ) : null}
            </div>
          </nav>
        </div>
      </header>

      {/* Main content, padding bottom para não cobrir a bottom bar no mobile */}
      <main className="mx-auto w-full max-w-6xl px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Navegação Mobile (Bottom Bar) */}
      <div className="fixed bottom-0 z-50 w-full border-t border-[var(--border-strong)] bg-[var(--bg-surface)] pb-safe md:hidden">
        <nav className="flex items-center justify-around px-2 py-2">
          <MobileNavItem href="/dashboard" icon={<CalendarDays size={20} />} label="Jogos" />
          <MobileNavItem href="/ranking" icon={<Trophy size={20} />} label="Ranking" />
          <MobileNavItem href="/regras" icon={<BookOpen size={20} />} label="Regras" />
          <MobileNavItem href="/chat" icon={<MessageCircle size={20} />} label="Chat" />
          <MobileNavItem href="/perfil" icon={<UserRound size={20} />} label="Perfil" />
          {profile?.is_admin ? (
            <MobileNavItem
              href="/admin/controle"
              icon={<LockKeyhole size={20} />}
              label="Controle"
            />
          ) : null}
        </nav>
      </div>

      <OnboardingModal />
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
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-transparent px-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
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
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-transparent px-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
    >
      {icon}
      {label}
    </a>
  )
}

function MobileNavItem({
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
      className="flex flex-col items-center gap-1 rounded-md px-2 py-1 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] active:bg-[var(--bg-elevated)]"
    >
      {icon}
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  )
}

function Avatar({ username, url }: { username: string; url: string | null }) {
  const initials = username.slice(0, 2).toUpperCase()

  if (url) {
    return (
      <div
        aria-label={`Avatar de ${username}`}
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[var(--border-strong)] md:h-12 md:w-12"
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
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--green-700)] md:h-12 md:w-12",
        "text-sm md:text-base font-semibold text-white ring-1 ring-[var(--border-strong)]"
      )}
    >
      {initials}
    </div>
  )
}
