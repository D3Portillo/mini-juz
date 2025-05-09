"use client"

import { getLastLeaderboardUpdate, getLeaderBoard } from "@/actions/game"
import useSWR from "swr"

export const useLeaderboard = () => {
  const { data, ...query } = useSWR(
    "juz.leaderboard",
    async () => {
      const [leaderboard, lastUpdateTime] = await Promise.all([
        getLeaderBoard(),
        getLastLeaderboardUpdate(),
      ])
      return {
        leaderboard,
        lastUpdateTime,
      }
    },
    {
      keepPreviousData: true,
    }
  )

  const lastUpdated = data?.lastUpdateTime

  return {
    data: {
      leaderboard: data?.leaderboard || [],
      /** Timestamp in ms */
      lastUpdated: lastUpdated ? Math.floor(lastUpdated * 1000) : Date.now(),
    },
    ...query,
  }
}
