import { cn } from "@/lib/utils"

type RankingAvatarProps = {
  username: string
  avatarUrl: string | null
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl"
}

export function RankingAvatar({
  username,
  avatarUrl,
  size = "md"
}: RankingAvatarProps) {
  const initials = username.slice(0, 2).toUpperCase()

  if (avatarUrl) {
    return (
      <div
        aria-label={`Avatar de ${username}`}
        className={cn(
          "shrink-0 rounded-full bg-[var(--bg-elevated)] ring-1 ring-[var(--border-strong)]",
          sizeClasses[size]
        )}
        role="img"
        style={{
          backgroundImage: `url(${avatarUrl})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[var(--green-700)]",
        "font-semibold text-white ring-1 ring-[var(--border-strong)]",
        sizeClasses[size]
      )}
    >
      {initials}
    </div>
  )
}
