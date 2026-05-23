import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="field-pattern relative isolate overflow-hidden bg-[var(--bg-base)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,var(--green-glow),transparent_30%),radial-gradient(circle_at_80%_10%,var(--yellow-glow),transparent_28%),linear-gradient(180deg,rgba(10,15,13,0.2),var(--bg-base))]" />
      <div className="mx-auto grid min-h-[92vh] w-full max-w-7xl items-center gap-10 px-6 pb-16 pt-8 sm:px-8 lg:grid-cols-[1fr_0.86fr] lg:px-10">
        <div className="max-w-3xl pt-10 text-center sm:pt-14 lg:text-left">
          {/* Chamada principal da landing publica, sem dependencia de autenticacao. */}
          <p className="animate-fade-slide text-sm font-bold uppercase tracking-[0.22em] text-[var(--yellow-400)]">
            Copa do Mundo 2026
          </p>
          <h1 className="animate-fade-slide mt-4 font-[family-name:var(--font-display)] text-6xl leading-none tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 sm:text-7xl md:text-8xl" style={{ animationDelay: "90ms" }}>
            Bolão da Copa 2026
          </h1>
          <p className="animate-fade-slide mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg lg:mx-0" style={{ animationDelay: "180ms" }}>
            Junte seus amigos, registre palpites em todos os jogos e acompanhe
            a disputa com ranking em tempo real, chat exclusivo e perfil
            personalizado.
          </p>
          <div className="animate-fade-slide mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: "270ms" }}>
            <Button
              asChild
              size="lg"
              className="h-12 bg-[var(--green-500)] px-7 text-[var(--bg-base)] shadow-[0_0_28px_var(--green-glow)] hover:bg-[var(--green-600)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--yellow-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
            >
              <Link href="/signup">Entrar no Bolão</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-[var(--border-hover)] px-7 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--yellow-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
            >
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>

        <div className="animate-fade-slide relative mx-auto aspect-square w-full max-w-[420px] sm:max-w-[520px] lg:max-w-none" style={{ animationDelay: "360ms" }}>
          <div className="absolute inset-6 rounded-full bg-[var(--green-glow)] blur-3xl" />
          <Image
            src="/landing/hero-copa-2026.png"
            alt="Taça e bola de futebol em um estádio escuro com luzes verdes e douradas"
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 88vw"
            className="relative object-contain drop-shadow-[0_28px_60px_rgba(34,197,94,0.24)]"
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#how-it-works" aria-label="Rolar para baixo" className="block p-2 text-[var(--text-secondary)] opacity-60 hover:opacity-100 transition-opacity">
          <ChevronDown className="h-8 w-8" />
        </a>
      </div>
    </section>
  )
}
