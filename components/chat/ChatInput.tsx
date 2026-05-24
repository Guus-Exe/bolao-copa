"use client"

import { Send, Loader2 } from "lucide-react"
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
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`
    }
  }, [value])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (trimmedLength === 0 || isSubmitDisabled) return
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
      className="flex w-full justify-center border-t border-green-500/10 bg-black/40 p-4 sm:p-6"
    >
      <div className="flex w-full max-w-4xl items-end gap-3 rounded-2xl border border-green-500/20 bg-zinc-900/60 p-2 shadow-inner transition-all focus-within:border-green-500/50 focus-within:bg-zinc-900/90">
        
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            aria-label="Digite sua mensagem"
            className="block max-h-28 min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-zinc-500 outline-none disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSend || isSending}
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
          <div className="absolute bottom-1 right-2 text-[10px] text-zinc-500 pointer-events-none">
            {value.length}/{MAX_LENGTH}
          </div>
        </div>

        <Button
          type="submit"
          size="icon"
          className="mb-1 mr-1 h-10 w-10 shrink-0 rounded-xl bg-green-600 text-white shadow-md transition-all hover:scale-105 hover:bg-green-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          disabled={!canSend || isSending || trimmedLength === 0 || value.length > MAX_LENGTH}
          aria-label="Enviar mensagem"
        >
          {isSending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>
    </form>
  )
}
