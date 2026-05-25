import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--green-500)]" />
      <p className="text-sm font-medium text-[var(--text-secondary)]">Carregando...</p>
    </div>
  )
}
