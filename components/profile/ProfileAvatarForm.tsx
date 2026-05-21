"use client"

import imageCompression from "browser-image-compression"
import { Camera, Loader2 } from "lucide-react"
import { useRef, useState, useTransition } from "react"

import { updateAvatar } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProfileAvatarFormProps = {
  avatarUrl: string | null
  username: string
}

export function ProfileAvatarForm({
  avatarUrl,
  username
}: ProfileAvatarFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleFileChange(file: File | null) {
    setMessage(null)
    setError(null)

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.")
      return
    }

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: file.type === "image/png" ? "image/png" : "image/webp"
      })

      setPreviewUrl(URL.createObjectURL(compressedFile))

      startTransition(async () => {
        const formData = new FormData()
        formData.append("avatar", compressedFile)

        const result = await updateAvatar(formData)

        if (!result.success) {
          setError(result.error)
          return
        }

        setPreviewUrl(result.data.avatarUrl)
        setMessage("Foto atualizada com sucesso.")
      })
    } catch {
      setError("Nao foi possivel comprimir a imagem.")
    } finally {
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProfileAvatar username={username} url={previewUrl} />
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
              Foto de perfil
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              JPG, PNG ou WebP. A imagem e comprimida antes do envio.
            </p>
          </div>
        </div>

        <div>
          <input
            ref={inputRef}
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            type="file"
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {isPending ? "Enviando..." : "Enviar foto"}
          </Button>
        </div>
      </div>

      <Feedback message={message} error={error} />
    </section>
  )
}

function ProfileAvatar({ username, url }: { username: string; url: string | null }) {
  const initials = username.slice(0, 2).toUpperCase()

  if (url) {
    return (
      <div
        aria-label={`Avatar de ${username}`}
        className="h-24 w-24 shrink-0 rounded-full bg-[var(--bg-elevated)] ring-2 ring-green-500/40"
        role="img"
        style={{
          backgroundImage: `url(${url})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex h-24 w-24 shrink-0 items-center justify-center rounded-full",
        "bg-[var(--green-700)] text-3xl font-black text-white ring-2 ring-green-500/40"
      )}
    >
      {initials}
    </div>
  )
}

function Feedback({ message, error }: { message: string | null; error: string | null }) {
  if (!message && !error) {
    return null
  }

  return (
    <p className={cn("mt-4 text-sm", error ? "text-red-300" : "text-green-200")}>
      {error ?? message}
    </p>
  )
}
