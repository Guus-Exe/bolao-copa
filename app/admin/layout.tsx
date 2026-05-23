import Link from "next/link"
import { redirect } from "next/navigation"
import {
  CalendarDays,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  PanelLeftClose,
  UsersRound
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
        <aside className="border-b border-sky-500/20 bg-slate-950 px-4 py-4 md:sticky md:top-0 md:h-screen md:w-72 md:border-b-0 md:border-r md:px-5 md:py-6">
          <div className="flex items-center justify-between gap-4 md:block">
            <Link href="/admin" className="block">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                Admin
              </p>
              <h1 className="mt-1 text-2xl font-bold">Bolão da Copa</h1>
            </Link>
            <form action={signOut} className="md:hidden">
              <Button type="submit" size="sm" variant="outline" className="gap-2">
                <LogOut size={15} />
                Sair
              </Button>
            </form>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
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
            Logado como <strong>{adminProfile.username}</strong>
          </div>

          <form action={signOut} className="mt-4 hidden md:block">
            <Button type="submit" variant="outline" className="w-full gap-2">
              <LogOut size={15} />
              Sair
            </Button>
          </form>
        </aside>

        <main className="w-full flex-1 px-4 py-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            {pendingUsersCount !== null && pendingUsersCount > 0 && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
                <div className="flex items-center gap-3">
                  <UsersRound className="text-amber-500 shrink-0" size={20} />
                  <p className="text-sm">
                    <strong>Atenção:</strong> Há {pendingUsersCount} {pendingUsersCount === 1 ? "usuário aguardando" : "usuários aguardando"} liberação de acesso.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-100 hover:text-amber-50">
                  <Link href="/admin/usuarios">Ver Usuários</Link>
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
      className="inline-flex h-10 shrink-0 items-center justify-between rounded-md border border-sky-500/20 px-3 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/10 hover:text-white md:w-full"
    >
      <div className="flex items-center gap-2">
        {icon}
        {children}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-slate-950">
          {badge}
        </span>
      )}
    </Link>
  )
}
