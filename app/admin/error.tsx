"use client"

import { useEffect } from "react"
import { RefreshCcw, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin area error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center rounded-xl border border-red-500/20 bg-red-500/5 p-8">
      <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-400">
        <ShieldAlert className="h-8 w-8" />
      </div>
      
      <h3 className="text-xl font-bold mb-2 text-red-200">Erro no painel administrativo</h3>
      
      <p className="text-[var(--text-secondary)] max-w-md mb-6 text-sm">
        Houve um erro ao processar os dados administrativos. Verifique se os serviços do banco de dados estão ativos ou se há inconsistência nos dados de jogos e palpites.
      </p>

      <Button 
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white"
        onClick={() => reset()}
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  )
}
