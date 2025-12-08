"use client"

import type { Address } from "viem"
import useSWRImmutable from "swr/immutable"
import { jsonify } from "../utils"

export const useLeaderboard = () => {
  const { data, ...query } = useSWRImmutable(
    `juz.leaderboard`,
    async () => {
      return await jsonify<{
        leaderboard: { address: Address; total: number }[]
        lastUpdateTime: number
      }>(fetch(`/api/leaderboard`))
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
