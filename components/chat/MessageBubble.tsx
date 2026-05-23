"use client"

import { cn } from "@/lib/utils"
import type { ChatMessageWithProfile } from "@/types"

type MessageBubbleProps = {
  message: ChatMessageWithProfile
  isOwnMessage: boolean
}

export function MessageBubble({
  message,
  isOwnMessage
}: MessageBubbleProps) {
  // As mensagens usam o profile aninhado vindo do join ou da busca pos-Realtime.
  const username = message.profiles?.username ?? "usuário"
  const avatarUrl = message.profiles?.avatar_url ?? null

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isOwnMessage ? (
        <MessageAvatar username={username} url={avatarUrl} />
      ) : null}

      <article
        className={cn(
          "max-w-[82%] whitespace-pre-wrap break-words rounded-xl border px-3 py-2 text-sm shadow-sm md:max-w-[68%]",
          isOwnMessage
            ? "rounded-tr-sm border-green-500/30 bg-green-500/20"
            : "rounded-tl-sm border-[var(--border-strong)] bg-[var(--bg-elevated)]"
        )}
      >
        <div
          className={cn(
            "mb-1 flex items-center gap-2",
            isOwnMessage ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs font-semibold text-green-400">
            {username}
          </span>
        </div>
        <p className="leading-relaxed text-[var(--text-primary)]">
          {message.content}
        </p>
        <time className="mt-1 block text-right text-xs text-[var(--text-muted)]">
          {formatMessageTime(message.created_at)}
        </time>
      </article>

      {isOwnMessage ? (
        <MessageAvatar username={username} url={avatarUrl} />
      ) : null}
    </div>
  )
}

function MessageAvatar({
  username,
  url
}: {
  username: string
  url: string | null
}) {
  const initials = username.slice(0, 2).toUpperCase()
  const backgroundColor = getAvatarColor(username)

  if (url) {
    return (
      <div
        aria-label={`Avatar de ${username}`}
        className="h-6 w-6 shrink-0 rounded-full bg-cover bg-center ring-1 ring-[var(--border-strong)]"
        role="img"
        style={{ backgroundImage: `url(${url})` }}
      />
    )
  }

  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1 ring-white/10"
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  )
}

function getAvatarColor(username: string) {
  const colors = [
    "#16a34a",
    "#0f766e",
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#ca8a04"
  ]
  const index = username
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return colors[index % colors.length]
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value))
}
