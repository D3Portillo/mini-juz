"use client"

import useSWR from "swr"
import { getOROPriceInUSDC, getWLDPriceinUSDC } from "@/lib/uniswap"
import { worldClient } from "./holdings"

const DEFAULT_WLD_PRICE = 1
export const useWLDPriceInUSD = () => {
  const { data: wldPriceInUSD = DEFAULT_WLD_PRICE, ...query } = useSWR(
    `prices.wld`,
    async () => {
      if (!worldClient) return DEFAULT_WLD_PRICE
      return await getWLDPriceinUSDC()
    },
    {
      fallbackData: DEFAULT_WLD_PRICE,
      keepPreviousData: true,
      refreshInterval: 10_000, // 10 seconds
    }
  )

  return {
    wldPriceInUSD,
    ...query,
  }
}

const DEFAULT_ORO_PRICE = 0.01 // Default price for ORO in USD
export const useOroPriceInUSD = () => {
  const { data: oroPriceInUSD = DEFAULT_ORO_PRICE, ...query } = useSWR(
    `prices.oro`,
    async () => {
      if (!worldClient) return DEFAULT_ORO_PRICE
      return await getOROPriceInUSDC()
    },
    {
      fallbackData: DEFAULT_ORO_PRICE,
      keepPreviousData: true,
      refreshInterval: 10_000, // 10 seconds
    }
  )

  return {
    oroPriceInUSD,
    ...query,
  }
}
