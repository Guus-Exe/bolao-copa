import { Camera, MessageCircle, Trophy, Volleyball } from "lucide-react"

const features = [
  {
    title: "Palpites em todos os jogos",
    description: "Registre placares para cada partida da Copa.",
    icon: Volleyball
  },
  {
    title: "Chat exclusivo",
    description: "Converse com outros participantes durante a competição.",
    icon: MessageCircle
  },
  {
    title: "Ranking em tempo real",
    description: "Acompanhe a disputa por pontos rodada a rodada.",
    icon: Trophy
  },
  {
    title: "Perfil personalizado",
    description: "Use apelido e foto para entrar no clima do bolão.",
    icon: Camera
  }
]

export function Features() {
  return (
    <section className="bg-[linear-gradient(180deg,var(--bg-base),var(--bg-surface))] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Grade de beneficios do produto para a landing publica. */}
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--yellow-400)]">
              O que está incluso
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-wide text-[var(--text-primary)] md:text-6xl">
              Tudo para viver a Copa com disputa
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
              A experiência combina palpites, conversa e classificação para
              transformar cada jogo em uma pequena final entre amigos.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <article
                  className="landing-card animate-fade-slide rounded-lg border p-5 transition duration-300 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
                  key={feature.title}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-[var(--yellow-glow)] text-[var(--yellow-400)]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
