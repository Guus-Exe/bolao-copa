"use client"

import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Smile } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

type EmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPicker({ onEmojiSelect, disabled }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        className="h-10 w-10 shrink-0 rounded-full text-zinc-400 hover:text-green-400 hover:bg-green-500/10"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Adicionar emoji"
      >
        <Smile size={20} />
      </Button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 z-50 shadow-2xl">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onEmojiSelect(emoji.native)
              setIsOpen(false)
            }}
            theme="dark"
            locale="pt"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  )
}
