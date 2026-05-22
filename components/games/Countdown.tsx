"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"

export function Countdown({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const calculateTimeLeft = () => {
      const difference = deadline.getTime() - new Date().getTime()

      if (difference <= 0) {
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return <div className="h-4 w-20 animate-pulse rounded bg-zinc-500/20" />
  }

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-yellow-500/90">
        <Clock className="size-3.5" />
        Encerrado
      </div>
    )
  }

  let colorClass = "text-emerald-400"
  let isUrgent = false

  if (timeLeft.days === 0) {
    if (timeLeft.hours >= 1) {
      colorClass = "text-amber-400"
    } else {
      colorClass = "text-red-400"
      isUrgent = true
    }
  }

  const h = timeLeft.hours.toString().padStart(2, "0")
  const m = timeLeft.minutes.toString().padStart(2, "0")
  const s = timeLeft.seconds.toString().padStart(2, "0")

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-bold tabular-nums tracking-widest transition-colors",
        colorClass,
        isUrgent && "animate-pulse"
      )}
    >
      <span className="uppercase tracking-[0.1em] opacity-90">Fecha em:</span>
      <Clock className={cn("size-3.5")} />
      {timeLeft.days > 0 ? (
        <span>
          {timeLeft.days}d {h}:{m}:{s}
        </span>
      ) : (
        <span>
          {h}:{m}:{s}
        </span>
      )}
    </div>
  )
}
