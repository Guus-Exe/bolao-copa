import Image from "next/image"

import { cn } from "@/lib/utils"

export function getCountryCode(emoji: string) {
  if (!emoji) return null
  // Regional indicators are pairs of surrogate characters
  const codePoints = Array.from(emoji).map((c) => c.codePointAt(0) || 0)
  if (
    codePoints.length === 2 &&
    codePoints[0] >= 0x1f1e6 &&
    codePoints[0] <= 0x1f1ff &&
    codePoints[1] >= 0x1f1e6 &&
    codePoints[1] <= 0x1f1ff
  ) {
    const char1 = String.fromCharCode(codePoints[0] - 127397)
    const char2 = String.fromCharCode(codePoints[1] - 127397)
    return (char1 + char2).toLowerCase()
  }
  return null
}

type CountryFlagProps = {
  flag: string
  name: string
  className?: string
}

export function CountryFlag({ flag, name, className }: CountryFlagProps) {
  const countryCode = getCountryCode(flag)

  if (countryCode) {
    return (
      <Image
        src={`https://flagcdn.com/w80/${countryCode}.png`}
        alt={`Bandeira: ${name}`}
        width={40}
        height={28}
        className={cn(
          "inline-block rounded-[2px] object-cover shadow-sm",
          className
        )}
        unoptimized // Evitar sobrecarga no otimizador de imagens para bandeiras
      />
    )
  }

  // Fallback para o emoji original se não for um código de país válido
  return <span className={cn("leading-none", className)}>{flag}</span>
}
