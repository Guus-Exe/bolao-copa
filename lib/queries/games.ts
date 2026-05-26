import "server-only"

import { unstable_cache } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Game } from "@/types"

export const getCachedGames = unstable_cache(
  async (): Promise<Game[]> => {
    const { data, error } = await supabaseAdmin
      .from("games")
      .select("*")
      .order("match_date", { ascending: true })

    if (error) {
      console.error("Erro ao buscar jogos para o cache:", error)
      throw error
    }

    return (data ?? []) as Game[]
  },
  ["games-list"],
  { revalidate: 60, tags: ["games"] }
)
