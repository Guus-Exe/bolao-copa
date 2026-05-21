"use client"

import { ListChecks, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, type ReactNode } from "react"

import {
  deleteUser,
  toggleUserAccess,
  toggleUserAdmin,
  type AdminUser
} from "@/app/actions/admin"
import { UserPredictionsModal } from "@/components/admin/UserPredictionsModal"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

type UserFilter = "todos" | "pagos" | "pendentes" | "admins"

type UserTableProps = {
  users: AdminUser[]
}

const FILTERS: { value: UserFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pagos", label: "Com acesso" },
  { value: "pendentes", label: "Sem acesso" },
  { value: "admins", label: "Admins" }
]

export function UserTable({ users }: UserTableProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<UserFilter>("todos")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filter === "pagos") return user.is_paid
      if (filter === "pendentes") return !user.is_paid
      if (filter === "admins") return user.is_admin
      return true
    })
  }, [filter, users])

  function showToast(message: string) {
    setToast(message)
    router.refresh()
    window.setTimeout(() => setToast(null), 3200)
  }

  async function handleAccessToggle(user: AdminUser) {
    setError(null)
    const nextValue = !user.is_paid
    const ok = window.confirm(
      `Marcar ${user.username} como ${nextValue ? "Com acesso" : "Pendente"}?`
    )

    if (!ok) return

    const result = await toggleUserAccess(user.id, nextValue)

    if (!result.success) {
      setError(result.error)
      return
    }

    showToast("Status de acesso atualizado.")
  }

  async function handleAdminToggle(user: AdminUser) {
    setError(null)
    const nextValue = !user.is_admin
    const ok = window.confirm(
      `${nextValue ? "Promover" : "Remover admin de"} ${user.username}?`
    )

    if (!ok) return

    const result = await toggleUserAdmin(user.id, nextValue)

    if (!result.success) {
      setError(result.error)
      return
    }

    showToast("Permissao admin atualizada.")
  }

  async function handleDelete(user: AdminUser) {
    setError(null)
    const first = window.confirm(`Excluir o usuario ${user.username}?`)

    if (!first) return

    const second = window.confirm(
      `Confirmacao final: excluir definitivamente ${user.email}?`
    )

    if (!second) return

    const result = await deleteUser(user.id)

    if (!result.success) {
      setError(result.error)
      return
    }

    showToast("Usuario excluido com sucesso.")
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gerenciar usuarios</h2>
          <p className="text-sm text-sky-200">
            Libere acessos, revise admins e acompanhe palpites.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={filter === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(item.value)}
              className={
                filter === item.value
                  ? "bg-sky-500 text-white hover:bg-sky-600"
                  : ""
              }
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-sky-500/20 bg-slate-950/55">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Apelido</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar user={user} />
                </TableCell>
                <TableCell className="font-semibold text-white">
                  {user.username}
                </TableCell>
                <TableCell className="max-w-[240px] truncate text-sky-100">
                  {user.email}
                </TableCell>
                <TableCell className="text-sky-100">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell>
                  <Toggle
                    checked={user.is_paid}
                    onClick={() => handleAccessToggle(user)}
                    label={user.is_paid ? "Pago" : "Pendente"}
                  />
                </TableCell>
                <TableCell>
                  <Toggle
                    checked={user.is_admin}
                    onClick={() => handleAdminToggle(user)}
                    label={user.is_admin ? "Admin" : "Nao admin"}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <IconButton
                      label="Ver palpites"
                      onClick={() => setSelectedUser(user)}
                    >
                      <ListChecks size={16} />
                    </IconButton>
                    <IconButton
                      label="Excluir usuario"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 ? (
          <p className="p-6 text-center text-sm text-sky-200">
            Nenhum usuario encontrado para este filtro.
          </p>
        ) : null}
      </div>

      <UserPredictionsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-sky-500/30 bg-sky-500/15 px-4 py-3 text-sm font-semibold text-sky-100 shadow-lg">
          {toast}
        </div>
      ) : null}
    </section>
  )
}

function Avatar({ user }: { user: AdminUser }) {
  const initials = user.username.slice(0, 2).toUpperCase()

  if (user.avatar_url) {
    return (
      <div
        aria-label={`Avatar de ${user.username}`}
        className="h-10 w-10 rounded-full bg-slate-800 ring-1 ring-sky-500/20"
        role="img"
        style={{
          backgroundImage: `url(${user.avatar_url})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white ring-1 ring-sky-500/20">
      {initials}
    </div>
  )
}

function Toggle({
  checked,
  label,
  onClick
}: {
  checked: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={label}
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-semibold text-sky-100"
    >
      <span
        className={`flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors ${
          checked
            ? "border-sky-400/40 bg-sky-500"
            : "border-slate-600 bg-slate-800"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
      {label}
    </button>
  )
}

function IconButton({
  label,
  className,
  onClick,
  children
}: {
  label: string
  className?: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sky-200 transition-colors hover:bg-sky-500/10 hover:text-white ${className ?? ""}`}
    >
      {children}
    </button>
  )
}
