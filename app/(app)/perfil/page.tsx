import { redirect } from "next/navigation"

import { AccountInfo } from "@/components/profile/AccountInfo"
import { ProfileAvatarForm } from "@/components/profile/ProfileAvatarForm"
import { ProfileStats } from "@/components/profile/ProfileStats"
import { UsernameForm } from "@/components/profile/UsernameForm"
import { getRankingEntries } from "@/lib/queries/ranking"
import { createServerClient } from "@/lib/supabase/server"

export const revalidate = 0

type ProfileRow = {
  username: string
  avatar_url: string | null
}

export default async function ProfilePage() {
  const supabase = createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Passo 2: Busca perfil e ranking em paralelo
  const [profileResult, rankingResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single(),
    getRankingEntries()
  ])

  const profile = profileResult.data as ProfileRow | null

  if (!profile) {
    redirect("/dashboard")
  }

  const { ranking } = rankingResult
  const rankingEntry =
    ranking.find((entry) => entry.user_id === user.id) ?? null

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Minha conta
        </p>
        <h1 className="mt-2 bg-gradient-to-r from-green-300 via-green-100 to-yellow-300 bg-clip-text font-[family-name:var(--font-display)] text-6xl tracking-wide text-transparent md:text-7xl">
          Perfil
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          Ajuste sua identidade no bolão e acompanhe seus numeros pessoais.
        </p>
      </div>

      <ProfileAvatarForm
        avatarUrl={profile.avatar_url}
        username={profile.username}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <UsernameForm username={profile.username} />
        <AccountInfo email={user.email ?? "Email não informado"} />
      </div>

      <ProfileStats entry={rankingEntry} />
    </section>
  )
}
