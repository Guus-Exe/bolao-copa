import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Download, Trash2, Upload } from "lucide-react"

export default function AdminGamesLoading() {
  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
          Painel administrativo
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">Jogos</h1>
      </header>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Gerenciar jogos</h2>
            <p className="text-sm text-sky-200">
              Cadastre partidas, edite dados e publique resultados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled className="gap-2 border border-violet-500/30 bg-violet-500/15 text-violet-200">
              <Upload size={16} />
              Enviar PDF
            </Button>
            <Button disabled className="gap-2 border border-emerald-500/30 bg-emerald-500/15 text-emerald-200">
              <Download size={16} />
              Importar da API
            </Button>
            <Button disabled className="gap-2 bg-sky-500 text-white opacity-50">
              <CalendarPlus size={16} />
              Novo jogo
            </Button>
            <Button disabled className="gap-2 border border-red-500/30 bg-red-500/15 text-red-200">
              <Trash2 size={16} />
              Remover todos
            </Button>
          </div>
        </div>

        <div className="hidden md:block overflow-hidden rounded-lg border border-sky-500/20 bg-slate-950/55">
          <div className="border-b border-sky-500/20 p-4">
            <Skeleton className="h-6 w-1/3 bg-sky-500/20" />
          </div>
          <div className="divide-y divide-sky-500/10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-5 w-[150px] bg-sky-500/20" />
                <Skeleton className="h-5 w-4 bg-sky-500/20" />
                <Skeleton className="h-5 w-[150px] bg-sky-500/20" />
                <Skeleton className="h-5 w-[100px] bg-sky-500/20 ml-auto" />
                <Skeleton className="h-5 w-[80px] bg-sky-500/20" />
                <Skeleton className="h-6 w-16 rounded-full bg-sky-500/20" />
                <div className="flex gap-2 ml-auto">
                  <Skeleton className="h-8 w-8 rounded-md bg-sky-500/20" />
                  <Skeleton className="h-8 w-8 rounded-md bg-sky-500/20" />
                  <Skeleton className="h-8 w-8 rounded-md bg-sky-500/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
