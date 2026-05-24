"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Info } from "lucide-react"
import type { RankingEntry } from "@/types"

export function TiebreakerInfo({ entry }: { entry: RankingEntry }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const handleScroll = () => {
      setOpen(false)
    }

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true })
    window.addEventListener("touchmove", handleScroll, { passive: true, capture: true })

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true })
      window.removeEventListener("touchmove", handleScroll, { capture: true })
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          type="button" 
          className="text-[var(--text-secondary)] hover:text-green-300 active:text-green-300 transition-colors" 
          aria-label="Ver critérios de desempate"
        >
          <Info size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        className="w-[280px] p-4 text-sm bg-[var(--bg-elevated)] border-[var(--border-strong)] shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <p className="font-semibold mb-2 text-[var(--text-primary)] text-left">Critérios de Desempate:</p>
        <ul className="space-y-1 text-[var(--text-secondary)] text-left">
          <li>1. Exatos (Geral): <strong className="text-[var(--text-primary)]">{entry.exact_scores}</strong></li>
          <li>2. Exatos (Anfitriões): <strong className="text-[var(--text-primary)]">{entry.exact_scores_hosts}</strong></li>
          <li>3. Exatos (Brasil): <strong className="text-[var(--text-primary)]">{entry.exact_scores_brazil}</strong></li>
          <li>4. 1º Palpite: <strong className="text-[var(--text-primary)]">{new Date(entry.first_prediction_at).toLocaleDateString('pt-BR')}</strong></li>
        </ul>
      </PopoverContent>
    </Popover>
  )
}
