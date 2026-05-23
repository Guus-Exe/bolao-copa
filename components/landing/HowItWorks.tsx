import { BarChart3, Target, UserPlus } from "lucide-react"

const steps = [
  {
    title: "Crie sua conta",
    description: "Cadastre-se em poucos passos e aguarde a liberação do admin.",
    icon: UserPlus
  },
  {
    title: "Faça seus palpites",
    description: "Escolha os placares antes da bola rolar em cada partida.",
    icon: Target
  },
  {
    title: "Acompanhe o ranking",
    description: "Veja sua pontuação subir conforme os resultados saem.",
    icon: BarChart3
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[var(--bg-base)] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Secao educativa com tres passos curtos para leitura rapida. */}
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--yellow-400)]">
            Como funciona
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-wide text-[var(--text-primary)] md:text-6xl">
            Palpite, torça e suba
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <article
                className="landing-card animate-fade-slide rounded-lg border border-t-2 border-t-[var(--green-500)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[var(--border-hover)]"
                key={step.title}
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--green-glow)] text-[var(--yellow-400)]">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
