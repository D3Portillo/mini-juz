"use client"

import useSWR from "swr"
import { getWLDPriceinUSDC } from "@/lib/uniswap"
import { worldClient } from "./holdings"

const DEFAULT_PRICE = 1
export const useWLDPriceInUSD = () => {
  const { data: wldPriceInUSD = DEFAULT_PRICE, ...query } = useSWR(
    `wld.price`,
    async () => {
      if (!worldClient) return DEFAULT_PRICE
      return await getWLDPriceinUSDC()
    },
    {
      fallbackData: DEFAULT_PRICE,
      keepPreviousData: true,
      refreshInterval: 10_000, // 10 seconds
    }
  )

  return {
    wldPriceInUSD,
    ...query,
  }
}
