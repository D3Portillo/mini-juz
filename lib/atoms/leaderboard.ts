"use client"

import { getLeaderBoard } from "@/actions/game"
import useSWR from "swr"

export const useLeaderboard = () => {
  return useSWR(
    "juz.leaderboard",
    async () => {
      return await getLeaderBoard()
    },
    {
      keepPreviousData: true,
    }
  )
}
