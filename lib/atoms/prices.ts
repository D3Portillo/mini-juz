"use client"

import useSWR from "swr"
import { formatUnits } from "viem"
import { worldClient } from "./holdings"

const DEFAULT_PRICE = 1
export const useWLDPriceInUSD = () => {
  const { data: wldPriceInUSD = 1, ...query } = useSWR(
    `wld.price`,
    async () => {
      if (!worldClient) return DEFAULT_PRICE
      const r = await fetch(
        "https://app-backend.worldcoin.dev/public/v1/miniapps/prices?cryptoCurrencies=WLD&fiatCurrencies=USD"
      )

      const { result } = (await r.json()) as {
        result: {
          prices: {
            WLD: {
              USD: {
                amount: string
                decimals: 6
              }
            }
          }
        }
      }

      const decimals = result.prices.WLD.USD.decimals

      // Default to 1 if no price or error
      return decimals
        ? Number(formatUnits(BigInt(result.prices.WLD.USD.amount), decimals))
        : DEFAULT_PRICE
    },
    {
      refreshInterval: 10_000, // 10 seconds
    }
  )

  return {
    wldPriceInUSD,
    ...query,
  }
}
