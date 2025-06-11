"use client"

import { atomWithStorage } from "jotai/utils"
import { useAtom } from "jotai"
import useSWR from "swr"

import { useWorldAuth } from "@radish-la/world-auth"
import { getPlayerGameData } from "@/actions/game"

export const useAccountGameData = () => {
  const { address } = useWorldAuth()

  const { data = {} } = useSWR(
    address ? `played.games.${address}` : null,
    async () => {
      if (!address) return 0
      const games = await getPlayerGameData(address)
      return games
    },
    {
      keepPreviousData: true,
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

export const useIsGameActive = () => useAtom(atomIsGameActive)
