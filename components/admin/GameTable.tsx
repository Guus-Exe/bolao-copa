"use client"

import { CalendarPlus, Edit3, ListChecks, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, type ReactNode } from "react"

import { deleteGame } from "@/app/actions/admin"
import { GameForm } from "@/components/admin/GameForm"
import { ResultModal } from "@/components/admin/ResultModal"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatDate, formatScore } from "@/lib/utils"
import type { Game } from "@/types"

type GameTableProps = {
  games: Game[]
}

const STAGE_LABELS: Record<string, string> = {
  grupo: "Grupo",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semi: "Semifinal",
  final: "Final"
}

export function GameTable({ games }: GameTableProps) {
  const router = useRouter()
  const [formGame, setFormGame] = useState<Game | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [resultGame, setResultGame] = useState<Game | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const orderedGames = useMemo(() => {
    return [...games].sort(
      (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    )
  }, [games])

  function showToast(message: string) {
    setToast(message)
    router.refresh()
    window.setTimeout(() => setToast(null), 3200)
  }

  function openCreateForm() {
    setFormGame(null)
    setIsFormOpen(true)
  }

  function openEditForm(game: Game) {
    setFormGame(game)
    setIsFormOpen(true)
  }

  async function handleDelete(game: Game) {
    setError(null)
    const first = window.confirm(
      `Excluir o jogo ${game.home_team} x ${game.away_team}?`
    )

    if (!first) {
      return
    }

    const second = window.confirm(
      "Confirmacao final: os palpites vinculados a este jogo tambem serao removidos."
    )

    if (!second) {
      return
    }

    const result = await deleteGame(game.id)

    if (!result.success) {
      setError(result.error)
      return
    }

    showToast("Jogo excluido com sucesso.")
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gerenciar jogos</h2>
          <p className="text-sm text-sky-200">
            Cadastre partidas, edite dados e publique resultados.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateForm}
          className="gap-2 bg-sky-500 text-white hover:bg-sky-600"
        >
          <CalendarPlus size={16} />
          Novo jogo
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-sky-500/20 bg-slate-950/55">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Time casa</TableHead>
              <TableHead className="text-center">x</TableHead>
              <TableHead>Time fora</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Fase</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedGames.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-semibold text-white">
                  {game.home_flag} {game.home_team}
                </TableCell>
                <TableCell className="text-center text-sky-200">x</TableCell>
                <TableCell className="font-semibold text-white">
                  {game.away_team} {game.away_flag}
                </TableCell>
                <TableCell className="text-sky-100">
                  {formatDate(game.match_date)}
                </TableCell>
                <TableCell className="text-sky-100">
                  {STAGE_LABELS[game.stage] ?? game.stage}
                  {game.group_name ? ` ${game.group_name}` : ""}
                </TableCell>
                <TableCell className="font-semibold text-white">
                  {formatScore(game.home_score, game.away_score)}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      game.is_finished
                        ? "rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300"
                        : "rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300"
                    }
                  >
                    {game.is_finished ? "Encerrado" : "Futuro"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <IconButton label="Editar" onClick={() => openEditForm(game)}>
                      <Edit3 size={16} />
                    </IconButton>
                    <IconButton label="Resultado" onClick={() => setResultGame(game)}>
                      <ListChecks size={16} />
                    </IconButton>
                    <IconButton
                      label="Excluir"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(game)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orderedGames.length === 0 ? (
          <p className="p-6 text-center text-sm text-sky-200">
            Nenhum jogo cadastrado ainda.
          </p>
        ) : null}
      </div>

      <GameForm
        open={isFormOpen}
        game={formGame}
        onClose={() => setIsFormOpen(false)}
        onSaved={showToast}
      />
      <ResultModal
        game={resultGame}
        onClose={() => setResultGame(null)}
        onSaved={showToast}
      />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-sky-500/30 bg-sky-500/15 px-4 py-3 text-sm font-semibold text-sky-100 shadow-lg">
          {toast}
        </div>
      ) : null}
    </section>
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
