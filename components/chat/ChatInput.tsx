"use client"

import { Send } from "lucide-react"
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type FormEvent
} from "react"

import { Button } from "@/components/ui/button"
import { EmojiPicker } from "@/components/chat/EmojiPicker"

type ChatInputProps = {
  value: string
  isSending: boolean
  canSend: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

const MAX_LENGTH = 500

export function ChatInput({
  value,
  isSending,
  canSend,
  onChange,
  onSubmit
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSubmitDisabled = isSending || !canSend
  const trimmedLength = value.trim().length

  useEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    // Ajusta a altura ate 4 linhas sem deixar o rodape pular demais.
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`
  }, [value])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (trimmedLength === 0 || isSubmitDisabled) {
      return
    }

    onSubmit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-green-500/10 bg-black/40 p-4"
    >
      <div className="flex items-end gap-2">
        <EmojiPicker 
          disabled={!canSend} 
          onEmojiSelect={(emoji) => {
            const textarea = textareaRef.current
            if (textarea) {
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const newValue = value.substring(0, start) + emoji + value.substring(end)
              onChange(newValue)
              // Timeout needed to allow React to update the state before setting selection
              setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(start + emoji.length, start + emoji.length)
              }, 10)
            } else {
              onChange(value + emoji)
            }
          }} 
        />
        <div className="min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            aria-label="Digite sua mensagem"
            className="max-h-28 min-h-12 w-full resize-none rounded-xl border border-green-500/20 bg-zinc-900/80 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-green-400 focus:bg-zinc-900 focus:ring-1 focus:ring-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSend}
            maxLength={MAX_LENGTH}
            placeholder={
              canSend
                ? "Escreva sua mensagem..."
                : "Aguardando liberação de acesso..."
            }
            rows={1}
            value={value}
            readOnly={isSending}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="mt-1 text-right text-xs text-[var(--text-muted)]">
            {value.length}/{MAX_LENGTH}
          </div>
        </div>
        <Button
          type="submit"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full bg-green-600 text-white shadow-lg transition-all hover:bg-green-500 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          disabled={
            isSubmitDisabled || trimmedLength === 0 || value.length > MAX_LENGTH
          }
          aria-label="Enviar mensagem"
        >
          <Send size={20} />
        </Button>
      </div>
    </form>
  )
}
