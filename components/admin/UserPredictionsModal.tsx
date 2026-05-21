"use client"

import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  getUserPredictionsForAdmin,
  type AdminPrediction,
  type AdminUser
} from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatScore } from "@/lib/utils"

type UserPredictionsModalProps = {
  user: AdminUser | null
  onClose: () => void
}

export function UserPredictionsModal({
  user,
  onClose
}: UserPredictionsModalProps) {
  const [predictions, setPredictions] = useState<AdminPrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      return
    }

    setLoading(true)
    setError(null)
    getUserPredictionsForAdmin(user.id).then((result) => {
      if (result.success) {
        setPredictions(result.data)
      } else {
        setError(result.error)
      }
      setLoading(false)
    })
  }, [user])

  const totalPoints = useMemo(() => {
    return predictions.reduce(
      (total, prediction) => total + (prediction.points_earned ?? 0),
      0
    )
  }, [predictions])

  if (!user) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-sky-500/20 bg-slate-950 p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">
              Palpites do usuario
            </p>
            <h2 className="mt-1 text-2xl font-bold">{user.username}</h2>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onClose}>
            <X size={18} />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-sky-500/20">
          {loading ? (
            <p className="p-6 text-center text-sm text-sky-200">
              Carregando palpites...
            </p>
          ) : error ? (
            <p className="p-6 text-center text-sm text-red-300">{error}</p>
          ) : predictions.length === 0 ? (
            <p className="p-6 text-center text-sm text-sky-200">
              Este usuario ainda nao fez palpites.
            </p>
          ) : (
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Jogo</TableHead>
                  <TableHead>Palpite</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell className="font-semibold text-white">
                      {prediction.game
                        ? `${prediction.game.home_flag} ${prediction.game.home_team} x ${prediction.game.away_team} ${prediction.game.away_flag}`
                        : "Jogo removido"}
                    </TableCell>
                    <TableCell className="text-sky-100">
                      {prediction.predicted_home_score} x{" "}
                      {prediction.predicted_away_score}
                    </TableCell>
                    <TableCell className="text-sky-100">
                      {prediction.game?.is_finished
                        ? formatScore(
                            prediction.game.home_score,
                            prediction.game.away_score
                          )
                        : "Pendente"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {prediction.points_earned ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <div className="rounded-md border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100">
            Total: {totalPoints} pontos
          </div>
        </div>
      </div>
    </div>
  )
}
