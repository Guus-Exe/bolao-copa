"use client"

import { useEffect } from "react"
import { RefreshCcw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App group error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8">
      <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500">
        <AlertTriangle className="h-8 w-8" />
      </div>
      
      <h3 className="text-xl font-bold mb-2">Erro ao carregar a página</h3>
      
      <p className="text-[var(--text-secondary)] max-w-md mb-6 text-sm">
        Ocorreu um erro ao carregar as informações desta seção. Nossa equipe técnica já foi notificada.
        Por favor, tente recarregar o conteúdo.
      </p>

      <Button 
        variant="outline" 
        className="border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]"
        onClick={() => reset()}
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  )
}
