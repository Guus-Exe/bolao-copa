"use client"

import { useEffect, useState } from "react"

// ponytail: tema usa var(--*) -> alterna classe `light` no <html>; CSS faz o resto.
export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const light =
      saved === "light" ||
      (saved !== "dark" &&
        window.matchMedia("(prefers-color-scheme: light)").matches)
    document.documentElement.classList.toggle("light", light)
    setIsLight(light)
  }, [])

  return (
    <button
      type="button"
      aria-label="Alternar modo claro/escuro"
      className="fixed right-4 top-4 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow"
      onClick={() => {
        const root = document.documentElement
        const next = !root.classList.contains("light")
        root.classList.toggle("light", next)
        localStorage.setItem("theme", next ? "light" : "dark")
        setIsLight(next)
      }}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  )
}