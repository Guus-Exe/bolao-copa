import { Trophy } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-8">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing rings */}
        <div className="absolute h-32 w-32 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-[var(--green-500)]/20"></div>
        <div className="absolute h-24 w-24 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-[var(--green-500)]/30"></div>
        
        {/* Center circle */}
        <div className="relative flex h-20 w-20 animate-bounce items-center justify-center rounded-full border-2 border-[var(--green-500)] bg-[var(--bg-surface)] shadow-[0_0_30px_var(--green-glow)]">
          <Trophy className="h-10 w-10 text-[var(--yellow-400)] drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h3 className="animate-pulse text-lg font-bold tracking-tight text-[var(--text-primary)]">
          Preparando o campo...
        </h3>
        <p className="text-sm font-medium text-[var(--text-muted)]">
          Carregando os dados da Copa
        </p>
      </div>
    </div>
  )
}
