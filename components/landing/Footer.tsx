import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[var(--landing-border)] bg-[var(--bg-surface)] px-6 py-8 sm:px-8 lg:px-10">
      {/* Rodape simples com caminhos publicos de autenticacao. */}
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-[var(--text-primary)]">
            Bolão da Copa 2026
          </span>{" "}
          © 2026
        </p>
        <nav aria-label="Links do rodape" className="flex gap-5">
          <Link className="transition hover:text-[var(--yellow-400)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow-400)]" href="/login">
            Entrar
          </Link>
          <Link className="transition hover:text-[var(--yellow-400)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow-400)]" href="/signup">
            Criar conta
          </Link>
        </nav>
      </div>
    </footer>
  )
}
