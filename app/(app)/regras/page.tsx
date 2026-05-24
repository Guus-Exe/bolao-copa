import { BookOpen, Scale, Target, AlertTriangle } from "lucide-react"

export const metadata = {
  title: "Regras do Bolão | Bolão da Copa",
  description: "Entenda como funcionam os pontos e os critérios de desempate do Bolão."
}

export default function RegrasPage() {
  return (
    <div className="animate-fade-slide space-y-8">
      <header className="flex items-center gap-4 border-b border-[var(--border-strong)] pb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--green-glow)] text-[var(--green-500)] shadow-[0_0_15px_var(--green-glow)]">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-wide text-[var(--text-primary)]">
            Regras do Bolão
          </h1>
          <p className="text-[var(--text-secondary)]">
            Tudo o que você precisa saber sobre a pontuação e critérios de desempate.
          </p>
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl text-[var(--yellow-400)]">
          <Target size={24} />
          Sistema de Pontuação
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 3 Pontos */}
          <div className="landing-card relative flex flex-col rounded-xl border p-6 transition-all hover:border-[var(--green-500)] hover:shadow-[0_0_20px_var(--green-glow)]">
            <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--yellow-500)] font-bold text-[var(--bg-base)] shadow-lg">
              +3
            </div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">Placar Exato</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Você acerta o vencedor (ou empate) cravando o resultado exato da partida.
            </p>
            <div className="mt-4 rounded-md bg-[var(--bg-elevated)] p-3 text-sm">
              <span className="block font-medium text-[var(--text-primary)]">Exemplo:</span>
              <span className="text-[var(--text-muted)]">Seu palpite: Brasil 2 x 0 Sérvia</span>
              <br />
              <span className="text-[var(--text-muted)]">Resultado: Brasil 2 x 0 Sérvia</span>
            </div>
          </div>

          {/* 1 Ponto */}
          <div className="landing-card relative flex flex-col rounded-xl border p-6 transition-all hover:border-[var(--green-500)] hover:shadow-[0_0_20px_var(--green-glow)]">
            <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green-500)] font-bold text-[var(--bg-base)] shadow-lg">
              +1
            </div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">Acerto de Vencedor/Empate</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Você acerta quem venceu a partida (ou que foi empate), mas não acerta o placar exato.
            </p>
            <div className="mt-4 rounded-md bg-[var(--bg-elevated)] p-3 text-sm">
              <span className="block font-medium text-[var(--text-primary)]">Exemplo:</span>
              <span className="text-[var(--text-muted)]">Seu palpite: Brasil 3 x 1 Sérvia</span>
              <br />
              <span className="text-[var(--text-muted)]">Resultado: Brasil 2 x 0 Sérvia</span>
            </div>
          </div>

          {/* 0 Pontos */}
          <div className="landing-card relative flex flex-col rounded-xl border border-[var(--border-strong)] p-6">
            <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] font-bold text-[var(--text-muted)] shadow-lg">
              0
            </div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">Errou o Vencedor / Resultado</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Você não acerta o vencedor da partida nem o empate.
            </p>
            <div className="mt-4 rounded-md bg-[var(--bg-elevated)] p-3 text-sm">
              <span className="block font-medium text-[var(--text-primary)]">Exemplo:</span>
              <span className="text-[var(--text-muted)]">Seu palpite: Brasil 1 x 0 Sérvia</span>
              <br />
              <span className="text-[var(--text-muted)]">Resultado: Brasil 1 x 1 Sérvia</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-6">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl text-[var(--yellow-400)]">
          <Scale size={24} />
          Critérios de Desempate
        </h2>
        <div className="landing-card overflow-hidden rounded-xl border">
          <div className="p-6">
            <p className="mb-6 text-[var(--text-secondary)]">
              Caso dois ou mais participantes terminem com o mesmo número total de pontos, o desempate será feito de acordo com a ordem dos critérios abaixo:
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-4 rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green-700)] text-white font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Maior número de Placares Exatos</h4>
                  <p className="text-sm text-[var(--text-muted)]">Quem cravou o placar exato do maior número de jogos no geral leva vantagem.</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green-700)] text-white font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Placares Exatos: Seleções Anfitriãs</h4>
                  <p className="text-sm text-[var(--text-muted)]">Quem tiver mais placares exatos nos jogos envolvendo os países sedes (Estados Unidos, México e Canadá).</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green-700)] text-white font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Placares Exatos: Seleção Brasileira</h4>
                  <p className="text-sm text-[var(--text-muted)]">Quem tiver mais placares exatos nos jogos envolvendo o Brasil.</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green-700)] text-white font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">Data do Palpite</h4>
                  <p className="text-sm text-[var(--text-muted)]">Como último critério, leva vantagem quem tiver realizado seu primeiro palpite antes (ordem cronológica).</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-1 items-start gap-4 rounded-xl border border-[var(--landing-border)] bg-[var(--bg-elevated)] p-6">
            <AlertTriangle className="mt-1 text-[var(--yellow-500)] shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Mata-Mata, Prorrogação e Pênaltis</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Nas fases eliminatórias (Oitavas de Final em diante), o placar que vale para o bolão é o do <strong>Tempo Regulamentar + Prorrogação</strong>. 
                <br /><br />
                Vitórias conquistadas na disputa de Pênaltis <strong>não contam no placar</strong>, sendo a partida considerada um "Empate" para fins de pontuação no bolão.
              </p>
            </div>
          </div>
          
          <div className="flex flex-1 items-start gap-4 rounded-xl border border-[var(--green-500)] bg-[var(--green-glow)] p-6">
            <AlertTriangle className="mt-1 text-[var(--green-500)] shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Atenção aos Prazos</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Os palpites para cada jogo só podem ser incluídos ou alterados até 1 hora antes do início da partida.
                Após esse prazo, os palpites ficam bloqueados e não podem mais ser modificados.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
