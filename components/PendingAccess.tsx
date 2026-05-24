"use client"

import { Clock, ShieldAlert } from "lucide-react"

export function PendingAccess() {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[100px]" />

      {/* Animated icon container */}
      <div className="relative mb-8">
        {/* Outer dashed spinning rings */}
        <div className="absolute -inset-6 animate-[spin_4s_linear_infinite] rounded-full border-2 border-dashed border-sky-500/30" />
        <div className="absolute -inset-6 animate-[spin_5s_linear_infinite_reverse] rounded-full border-2 border-dashed border-emerald-500/20" />
        
        {/* Glowing backdrop */}
        <div className="absolute -inset-2 animate-pulse rounded-full bg-sky-500/20 blur-xl" />
        
        {/* Center icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-sky-500/30 bg-gradient-to-br from-sky-500/20 to-emerald-500/10 shadow-lg shadow-sky-500/20">
          <Clock className="h-8 w-8 animate-pulse text-sky-400" />
        </div>
      </div>

      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-400/80">
        Acesso pendente
      </p>
      
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-white sm:text-5xl">
        Aguarde a liberação
      </h1>
      
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
        Sua conta já foi criada, mas ainda não confirmamos o seu pagamento. 
        Assim que o admin liberar, os jogos e seus palpites aparecerão aqui.
      </p>

      <div className="mt-8 flex items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200 sm:text-sm">
        <ShieldAlert size={16} className="shrink-0" />
        <span>Você poderá fazer seus palpites assim que for liberado.</span>
      </div>
    </div>
  )
}
