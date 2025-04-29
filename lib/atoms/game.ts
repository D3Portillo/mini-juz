"use client"

import useSWR from "swr"
import { useWorldAuth } from "@radish-la/world-auth"
import { getPlayerGameData } from "@/actions/game"

export const useAccountGameData = () => {
  const { user } = useWorldAuth()
  const address = user?.walletAddress

  const { data = {} } = useSWR(
    address ? `played.games.${address}` : null,
    async () => {
      if (!address) return 0
      const games = await getPlayerGameData(address)
      return games
    }
  )

  console.debug({ data })

  return {
    played: 0,
    won: 0,
    ...data,
  }
}
