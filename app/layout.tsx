import type { Metadata } from "next"
import { Bebas_Neue, Inter } from "next/font/google"

import "./globals.css"

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display"
})

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body"
})

export const metadata: Metadata = {
  title: "Bolão da Copa 2026",
  description: "Palpites, ranking e chat em tempo real para a Copa do Mundo."
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} scroll-smooth`}>
      <body className="min-h-screen font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  )
}
