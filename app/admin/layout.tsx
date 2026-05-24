import Link from "next/link"
import { redirect } from "next/navigation"
import {
  CalendarDays,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  PanelLeftClose,
  UsersRound,
  AlertCircle
} from "lucide-react"
import type { ReactNode } from "react"

import { signOut } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"

export default async function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, username")
    .eq("id", user.id)
    .single()
  const adminProfile = profile as { is_admin: boolean; username: string } | null

  if (!adminProfile?.is_admin) {
    redirect("/dashboard")
  }

  const { count: pendingUsersCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_paid", false)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="sticky top-0 z-50 border-b border-sky-500/20 bg-slate-950 px-4 py-4 md:h-screen md:w-72 md:border-b-0 md:border-r md:px-5 md:py-6">
          <div className="flex items-center justify-between gap-4 md:block">
            <Link href="/admin" className="block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500/70">
                Admin
              </p>
              <h1 className="mt-1 text-xl md:text-2xl font-bold tracking-tight text-white">
                Bolão da Copa
              </h1>
            </Link>
            <form action={signOut} className="md:hidden">
              <Button type="submit" size="sm" variant="ghost" className="h-8 gap-2 border border-sky-500/20 text-sky-100 hover:bg-sky-500/10 hover:text-white">
                <LogOut size={14} />
                Sair
              </Button>
            </form>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2 md:flex-col md:overflow-visible md:pb-0">
            <AdminLink href="/admin" icon={<LayoutDashboard size={17} />}>
              Resumo
            </AdminLink>
            <AdminLink href="/admin/jogos" icon={<CalendarDays size={17} />}>
              Jogos
            </AdminLink>
            <AdminLink href="/admin/controle" icon={<LockKeyhole size={17} />}>
              Controle
            </AdminLink>
            <AdminLink href="/admin/usuarios" icon={<UsersRound size={17} />} badge={pendingUsersCount ?? 0}>
              Usuários
            </AdminLink>
            <AdminLink href="/dashboard" icon={<PanelLeftClose size={17} />}>
              Voltar ao dashboard
            </AdminLink>
          </nav>

          <div className="mt-8 hidden rounded-lg border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100 md:block">
            Logado como <strong className="text-white">{adminProfile.username}</strong>
          </div>

          <form action={signOut} className="mt-4 hidden md:block">
            <Button type="submit" variant="ghost" className="w-full gap-2 border border-sky-500/20 text-sky-100 hover:bg-sky-500/10 hover:text-white">
              <LogOut size={15} />
              Sair
            </Button>
          </form>
        </aside>

        <main className="w-full flex-1 px-4 py-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            {pendingUsersCount !== null && pendingUsersCount > 0 && (
              <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <AlertCircle className="text-amber-500 shrink-0 relative z-10" size={20} />
                    <span className="absolute -inset-1 animate-pulse rounded-full bg-amber-500/30 blur-sm"></span>
                  </div>
                  <p className="text-sm text-amber-100/90">
                    <strong className="text-amber-400">Atenção:</strong> Há {pendingUsersCount} {pendingUsersCount === 1 ? "usuário aguardando" : "usuários aguardando"} liberação de acesso.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-500/30 bg-amber-500/20 hover:bg-amber-500/30 text-amber-50 transition-colors">
                  <Link href="/admin/usuarios">Revisar Acessos</Link>
                </Button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function AdminLink({
  href,
  icon,
  badge,
  children
}: {
  href: string
  icon: ReactNode
  badge?: number
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 shrink-0 items-center justify-between rounded-md border border-sky-500/10 px-3 text-sm font-medium text-sky-100/80 transition-colors hover:bg-sky-500/10 hover:text-white md:w-full"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="whitespace-nowrap">{children}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="ml-3 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
          {badge}
        </span>
      )}
    </Link>
  )
}
