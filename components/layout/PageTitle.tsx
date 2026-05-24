"use client"

import { usePathname } from "next/navigation"

export function PageTitle() {
  const pathname = usePathname()

  let title = "Bolão da Copa"
  
  if (pathname.startsWith("/dashboard")) {
    title = "Jogos da Copa"
  } else if (pathname.startsWith("/ranking")) {
    title = "Ranking do Bolão"
  } else if (pathname.startsWith("/regras")) {
    title = "Regras do Bolão"
  } else if (pathname.startsWith("/chat")) {
    title = "Chat do Bolão"
  } else if (pathname.startsWith("/perfil")) {
    title = "Meu Perfil"
  } else if (pathname.startsWith("/admin")) {
    title = "Controle"
  }

  return (
    <span className="block font-[family-name:var(--font-display)] text-2xl tracking-wide md:text-3xl">
      {title}
    </span>
  )
}
