import { getAdminUsers } from "@/app/actions/admin"
import { AccessControlTable } from "@/components/admin/AccessControlTable"

export default async function AdminControlPage() {
  const result = await getAdminUsers()

  if (!result.success) {
    return (
      <section className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-100">
        {result.error}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
          Painel administrativo
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">
          Controle de Acesso
        </h1>
        <p className="mt-2 max-w-2xl text-sky-100">
          Gerencie quem pode interagir com o bolao.
        </p>
      </header>

      <AccessControlTable users={result.data} />
    </section>
  )
}
