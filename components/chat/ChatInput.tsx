"use client"

import { Send } from "lucide-react"
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type FormEvent
} from "react"

import { Button } from "@/components/ui/button"

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
      className="border-t border-[var(--border-strong)] bg-[var(--bg-surface)] p-3"
    >
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            aria-label="Digite sua mensagem"
            className="max-h-28 min-h-11 w-full resize-none rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-60"
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
          disabled={
            isSubmitDisabled || trimmedLength === 0 || value.length > MAX_LENGTH
          }
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  )
}
