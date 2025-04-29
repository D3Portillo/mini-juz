"use client"

import { atomWithStorage } from "jotai/utils"
import { useAtom } from "jotai"
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

  return {
    played: 0,
    won: 0,
    ...data,
  }
}

const atomIsGameActive = atomWithStorage(
  "juz.isGameActive",
  null as boolean | null
)

export const useisGameActive = () => useAtom(atomIsGameActive)
