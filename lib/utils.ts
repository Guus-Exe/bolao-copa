import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  const utc3Time = d.getTime() - 3 * 60 * 60 * 1000
  const utc3Date = new Date(utc3Time)

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(utc3Date)
}

export function formatScore(home: number | null, away: number | null) {
  if (home === null || away === null) {
    return "-"
  }

  return `${home} x ${away}`
}
