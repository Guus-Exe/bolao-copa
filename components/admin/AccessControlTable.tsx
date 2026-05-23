"use client"

import { AlertTriangle, CheckCircle2, Clock3, Search, UsersRound } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react"

import { toggleUserAccess, type AdminUser } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

type AccessFilter = "todos" | "liberados" | "pendentes"

type AccessControlTableProps = {
  users: AdminUser[]
}

type AccessDialog = {
  user: AdminUser
  nextValue: boolean
}

type ToastState = {
  message: string
  tone: "success" | "danger"
}

const FILTERS: { value: AccessFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "liberados", label: "Liberados" },
  { value: "pendentes", label: "Pendentes" }
]

export function AccessControlTable({ users }: AccessControlTableProps) {
  const router = useRouter()
  const [rows, setRows] = useState<AdminUser[]>(users)
  const [filter, setFilter] = useState<AccessFilter>("todos")
  const [query, setQuery] = useState("")
  const [dialog, setDialog] = useState<AccessDialog | null>(null)
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRows(users)
  }, [users])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return rows.filter((user) => {
      const matchesFilter =
        filter === "todos" ||
        (filter === "liberados" && user.is_paid) ||
        (filter === "pendentes" && !user.is_paid)
      const matchesQuery =
        normalizedQuery.length === 0 ||
        user.username.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery)

      return matchesFilter && matchesQuery
    })
  }, [filter, query, rows])

  const paidCount = rows.filter((user) => user.is_paid).length
  const pendingCount = rows.length - paidCount

  function showToast(message: string, tone: ToastState["tone"]) {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 3200)
  }

  function getMention(username: string) {
    return username.startsWith("@") ? username : `@${username}`
  }

  function openAccessDialog(user: AdminUser) {
    setError(null)
    setDialog({ user, nextValue: !user.is_paid })
  }

  async function confirmAccessToggle() {
    if (!dialog) {
      return
    }

    const { user, nextValue } = dialog
    const mention = getMention(user.username)

    setDialog(null)
    setError(null)
    setPendingIds((current) => [...current, user.id])

    // Atualizacao otimista: a linha muda na hora e volta atras se a action falhar.
    setRows((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, is_paid: nextValue } : item
      )
    )

    const result = await toggleUserAccess(user.id, nextValue)

    setPendingIds((current) => current.filter((id) => id !== user.id))

    if (!result.success) {
      setRows((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, is_paid: user.is_paid } : item
        )
      )
      setError(result.error)
      showToast(result.error, "danger")
      return
    }

    showToast(
      nextValue
        ? `Acesso liberado para ${mention}`
        : `Acesso revogado de ${mention}`,
      nextValue ? "success" : "danger"
    )
    router.refresh()
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<UsersRound size={18} aria-hidden="true" />}
          label="Total de usuários cadastrados"
          value={rows.length}
          tone="sky"
        />
        <SummaryCard
          icon={<CheckCircle2 size={18} aria-hidden="true" />}
          label="Com acesso liberado"
          value={paidCount}
          tone="green"
        />
        <SummaryCard
          icon={<Clock3 size={18} aria-hidden="true" />}
          label="Aguardando liberacao"
          value={pendingCount}
          tone="yellow"
        />
      </div>

      <div className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Usuários</h2>
            <p className="text-sm text-sky-200">
              Filtre, busque e altere a liberacao manual dos participantes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-300"
                aria-hidden="true"
              />
              <span className="sr-only">Buscar por apelido ou email</span>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar apelido ou email"
                className="pl-9"
              />
            </label>
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
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-sky-500/20 bg-slate-950/55">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead>Avatar + Apelido</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const isPending = pendingIds.includes(user.id)

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar user={user} />
                      <div>
                        <p className="font-semibold text-white">
                          {getMention(user.username)}
                        </p>
                        {user.is_admin ? (
                          <p className="text-xs font-semibold text-sky-300">
                            Admin
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate text-sky-100">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-sky-100">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <AccessBadge isPaid={user.is_paid} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant={user.is_paid ? "outline" : "default"}
                      size="sm"
                      disabled={isPending}
                      onClick={() => openAccessDialog(user)}
                      className={
                        user.is_paid
                          ? "border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                          : "bg-green-500 text-slate-950 hover:bg-green-600"
                      }
                    >
                      {isPending
                        ? "Atualizando..."
                        : user.is_paid
                          ? "Revogar acesso"
                          : "Liberar acesso"}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 ? (
          <p className="p-6 text-center text-sm text-sky-200">
            Nenhum participante encontrado.
          </p>
        ) : null}
      </div>

      <ConfirmationDialog
        dialog={dialog}
        getMention={getMention}
        onCancel={() => setDialog(null)}
        onConfirm={confirmAccessToggle}
      />

      {toast ? <Toast toast={toast} /> : null}
    </section>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  tone
}: {
  icon: ReactNode
  label: string
  value: number
  tone: "sky" | "green" | "yellow"
}) {
  const toneClass = {
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-300",
    green: "border-green-500/20 bg-green-500/10 text-green-300",
    yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
  }[tone]

  return (
    <article className="rounded-lg border border-sky-500/20 bg-slate-950/55 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-200">{label}</p>
        </div>
        <span className={`rounded-md border p-2 ${toneClass}`}>{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </article>
  )
}

function AccessBadge({ isPaid }: { isPaid: boolean }) {
  return (
    <span
      className={
        isPaid
          ? "rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300"
          : "rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-300"
      }
    >
      {isPaid ? "✓ Liberado" : "⏳ Pendente"}
    </span>
  )
}

function ConfirmationDialog({
  dialog,
  getMention,
  onCancel,
  onConfirm
}: {
  dialog: AccessDialog | null
  getMention: (username: string) => string
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!dialog) {
    return null
  }

  const mention = getMention(dialog.user.username)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-sky-500/20 bg-[var(--bg-surface)] p-5 text-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start gap-3">
          <span
            className={
              dialog.nextValue
                ? "rounded-md border border-green-500/20 bg-green-500/10 p-2 text-green-300"
                : "rounded-md border border-red-500/20 bg-red-500/10 p-2 text-red-300"
            }
          >
            {dialog.nextValue ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : (
              <AlertTriangle size={18} aria-hidden="true" />
            )}
          </span>
          <div>
            <h2 className="text-lg font-bold">
              {dialog.nextValue
                ? `Liberar acesso para ${mention}?`
                : `Revogar acesso de ${mention}?`}
            </h2>
            <p className="mt-2 text-sm leading-6 text-sky-100">
              {dialog.nextValue
                ? "O participante podera acessar dashboard, palpites e chat."
                : "O usuário perderá acesso ao dashboard, palpites e chat imediatamente."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={
              dialog.nextValue
                ? "bg-green-500 text-slate-950 hover:bg-green-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      className={
        toast.tone === "success"
          ? "fixed bottom-5 right-5 z-50 rounded-lg border border-green-500/30 bg-green-500/15 px-4 py-3 text-sm font-semibold text-green-100 shadow-lg"
          : "fixed bottom-5 right-5 z-50 rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100 shadow-lg"
      }
      role="status"
    >
      {toast.message}
    </div>
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
