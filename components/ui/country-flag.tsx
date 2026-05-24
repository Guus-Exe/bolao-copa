import Image from "next/image"

import { cn } from "@/lib/utils"

export function getCountryCode(emoji: string) {
  if (!emoji) return null
  const codePoints = Array.from(emoji).map((c) => c.codePointAt(0) || 0)

  // Regional indicators (ex: 🇧🇷)
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

  // Tag Sequence Emojis (ex: England 🏴󠁧󠁢󠁥󠁮󠁧󠁿, Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿)
  // Format: Black Flag (U+1F3F4) + Tags (U+E0020 - U+E007E) + Cancel Tag (U+E007F)
  if (
    codePoints.length > 2 &&
    codePoints[0] === 0x1f3f4 &&
    codePoints[codePoints.length - 1] === 0xe007f
  ) {
    let tagString = ""
    for (let i = 1; i < codePoints.length - 1; i++) {
      if (codePoints[i] >= 0xe0020 && codePoints[i] <= 0xe007e) {
        tagString += String.fromCharCode(codePoints[i] - 0xe0000)
      }
    }
    // Convert "gbeng" to "gb-eng" for FlagCDN
    if (tagString.startsWith("gb") && tagString.length > 2) {
      return `gb-${tagString.slice(2)}`
    }
    return tagString
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
