import { getAdminSummary, getAdminUsers } from "@/lib/queries/admin"
import { StatCards } from "@/components/admin/StatCards"
import { UserTable } from "@/components/admin/UserTable"

export default async function AdminUsersPage() {
  const [summaryResult, usersResult] = await Promise.all([
    getAdminSummary(),
    getAdminUsers()
  ])

  if (!summaryResult.success) {
    return <AdminError message={summaryResult.error} />
  }

  if (!usersResult.success) {
    return <AdminError message={usersResult.error} />
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
          Painel administrativo
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">Usuários</h1>
      </header>

      <StatCards summary={summaryResult.data} />
      <UserTable users={usersResult.data} />
    </section>
  )
}

function AdminError({ message }: { message: string }) {
  return (
    <section className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-100">
      {message}
    </section>
  )
}
