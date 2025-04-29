"use client"

import useSWR from "swr"
import {
  type Address,
  createPublicClient,
  erc20Abi,
  formatEther,
  http,
} from "viem"
import { worldchain } from "viem/chains"
import { ZERO } from "@/lib/constants"

const client = createPublicClient({
  chain: worldchain,
  transport: http(),
})

export const ADDRESS_WORLD_COIN =
  "0x2cFc85d8E48F8EAB294be644d9E25C3030863003" as const

export const useAccountBalances = (address?: Address | null) => {
  const { data: balance = ZERO } = useSWR(
    address ? `balance-${address}` : null,
    async () => {
      if (!address) return ZERO

      const result = await client.readContract({
        abi: erc20Abi,
        functionName: "balanceOf",
        address: ADDRESS_WORLD_COIN,
        args: [address as any],
      })

      return result
    },
    {
      refreshInterval: 5_000, // 5 seconds
    }
  )

  return {
    WLD: { balance, formatted: formatEther(balance) },
    JUZ: { balance: ZERO, formatted: "5" },
  }
}
