"use client"

import { CalendarPlus, Download, Edit3, FileText, ListChecks, Loader2, Trash2, RefreshCw, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState, type ReactNode } from "react"

import { deleteAllGames, deleteGame, importWorldCupGames, importGamesFromUploadedPDF } from "@/app/actions/admin-games"
import { syncGameScore } from "@/app/actions/admin-results"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
  const [importing, setImporting] = useState(false)
  const [uploadingPDF, setUploadingPDF] = useState(false)
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deletingAll, setDeletingAll] = useState(false)

  const pdfInputRef = useRef<HTMLInputElement>(null)

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

  async function handleSync(game: Game) {
    if (!game.api_fixture_id) return
    setError(null)
    setToast("Sincronizando...")

    const result = await syncGameScore(game.id)

    if (!result.success) {
      setError(result.error)
      setToast(null)
      return
    }

    showToast("Placar sincronizado e pontos calculados!")
  }

  async function handleImport() {
    setError(null)
    setImporting(true)
    setToast("Importando jogos da Copa do Mundo...")

    try {
      const result = await importWorldCupGames()

      if (!result.success) {
        setError(result.error)
        setToast(null)
        return
      }

      const { imported, skipped, total } = result.data

      if (imported === 0) {
        showToast(`Nenhum jogo novo para importar. (${skipped} já cadastrados)`)
      } else {
        showToast(
          `${imported} jogo(s) importado(s) com sucesso! (${skipped} já existiam, ${total} total na API)`
        )
      }
    } catch {
      setError("Erro inesperado ao importar jogos.")
      setToast(null)
    } finally {
      setImporting(false)
    }
  }



  async function handleDeleteAll() {
    if (confirmText !== "Confirmar") return

    setError(null)
    setDeletingAll(true)
    setToast("Excluindo todos os jogos...")

    const result = await deleteAllGames()

    if (!result.success) {
      setError(result.error)
      setToast(null)
    } else {
      showToast("Todos os jogos foram excluídos.")
      setIsDeleteAllOpen(false)
      setConfirmText("")
    }

    setDeletingAll(false)
  }

  async function handleUploadPDF(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reseta o input para permitir selecionar o mesmo arquivo de novo
    e.target.value = ""

    setError(null)
    setUploadingPDF(true)
    setToast(`Processando "${file.name}"...`)

    try {
      const formData = new FormData()
      formData.append("pdf", file)

      const result = await importGamesFromUploadedPDF(formData)

      if (!result.success) {
        setError(result.error)
        setToast(null)
        return
      }

      const { imported, skipped, total, warnings } = result.data

      if (warnings.length > 0) {
        console.warn("[PDF Import] Avisos:", warnings)
      }

      if (imported === 0) {
        showToast(`Nenhum jogo novo encontrado no PDF. (${skipped} já existiam)`)
      } else {
        showToast(
          `✅ ${imported} jogo(s) importado(s) do PDF! (${skipped} já existiam, ${total} total)`
        )
      }
    } catch {
      setError("Erro inesperado ao processar o PDF.")
      setToast(null)
    } finally {
      setUploadingPDF(false)
    }
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
        <div className="flex flex-wrap gap-2">
          {/* Input oculto para seleção de PDF */}
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUploadPDF}
          />

          {/* Botão de upload de PDF (FBref inglês) */}
          <Button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            disabled={uploadingPDF || importing}
            className="gap-2 border border-violet-500/30 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25"
          >
            {uploadingPDF ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploadingPDF ? "Processando..." : "Enviar PDF"}
          </Button>


          <Button
            type="button"
            disabled={true}
            className="gap-2 border border-slate-500/30 bg-slate-500/15 text-slate-400 opacity-50 cursor-not-allowed hover:bg-slate-500/15"
            title="Importação via API desativada temporariamente"
          >
            <Download size={16} />
            Importar da API
          </Button>
          <Button
            type="button"
            onClick={openCreateForm}
            className="gap-2 bg-sky-500 text-white hover:bg-sky-600"
          >
            <CalendarPlus size={16} />
            Novo jogo
          </Button>
          <Button
            type="button"
            onClick={() => setIsDeleteAllOpen(true)}
            className="gap-2 border border-red-500/30 bg-red-500/15 text-red-200 hover:bg-red-500/25"
          >
            <Trash2 size={16} />
            Remover todos
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="hidden md:block overflow-hidden rounded-lg border border-sky-500/20 bg-slate-950/55">
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
              <TableHead className="text-right">Ações</TableHead>
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
                    {game.api_fixture_id && !game.is_finished ? (
                      <IconButton label="Sincronizar da API" onClick={() => handleSync(game)} className="text-emerald-400 hover:text-emerald-300">
                        <RefreshCw size={16} />
                      </IconButton>
                    ) : null}
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

      <div className="md:hidden space-y-4">
        {orderedGames.map((game) => (
          <div
            key={game.id}
            className="flex flex-col gap-4 rounded-lg border border-sky-500/20 bg-slate-950/55 p-4"
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  game.is_finished
                    ? "rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300"
                    : "rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300"
                }
              >
                {game.is_finished ? "Encerrado" : "Futuro"}
              </span>
              <div className="flex gap-1">
                <IconButton label="Editar" onClick={() => openEditForm(game)} className="bg-sky-500/10 text-sky-300">
                  <Edit3 size={16} />
                </IconButton>
                {game.api_fixture_id && !game.is_finished ? (
                  <IconButton label="Sincronizar da API" onClick={() => handleSync(game)} className="bg-emerald-500/10 text-emerald-400 hover:text-emerald-300">
                    <RefreshCw size={16} />
                  </IconButton>
                ) : null}
                <IconButton label="Resultado" onClick={() => setResultGame(game)} className="bg-sky-500/10 text-sky-300">
                  <ListChecks size={16} />
                </IconButton>
                <IconButton
                  label="Excluir"
                  className="bg-red-500/10 text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(game)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 border-y border-sky-500/20 py-4">
              <div className="text-xs font-semibold text-sky-200">
                {STAGE_LABELS[game.stage] ?? game.stage}
                {game.group_name ? ` - ${game.group_name}` : ""}
              </div>
              <div className="flex w-full items-center justify-between px-2">
                <div className="flex w-1/3 flex-col items-center gap-1 text-center font-semibold text-white">
                  <span className="text-xl">{game.home_flag}</span>
                  <span className="truncate w-full">{game.home_team}</span>
                </div>
                <div className="flex w-1/3 flex-col items-center justify-center font-bold text-sky-100">
                  <span className="text-xl">{formatScore(game.home_score, game.away_score)}</span>
                  <span className="text-xs text-sky-500">X</span>
                </div>
                <div className="flex w-1/3 flex-col items-center gap-1 text-center font-semibold text-white">
                  <span className="text-xl">{game.away_flag}</span>
                  <span className="truncate w-full">{game.away_team}</span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-sky-100">
              {formatDate(game.match_date)}
            </div>
          </div>
        ))}
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

      <Dialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <DialogContent className="border-sky-500/20 bg-slate-950 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-white">Remover todos os jogos</DialogTitle>
            <DialogDescription className="text-sky-200">
              Esta ação excluirá todos os jogos e palpites vinculados. Para continuar, digite <strong className="text-red-400">Confirmar</strong> abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Digite Confirmar"
              className="border-sky-500/30 bg-slate-900 text-white" />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteAllOpen(false)
                setConfirmText("")
              }}
              className="border-sky-500/30 text-sky-200 hover:bg-sky-500/10 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeleteAll}
              disabled={confirmText !== "Confirmar" || deletingAll}
              className="bg-red-500 text-white hover:bg-red-600 gap-2"
            >
              {deletingAll ? <Loader2 size={16} className="animate-spin" /> : null}
              Excluir Tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
