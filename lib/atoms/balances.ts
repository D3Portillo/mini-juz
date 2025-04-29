"use client"

import useSWR from "swr"
import {
  type Address,
  createPublicClient,
  erc20Abi,
  formatEther,
  http,
  parseUnits,
} from "viem"

import { getPlayerJUZEarned } from "@/actions/game"
import { worldchain } from "viem/chains"
import { ZERO } from "@/lib/constants"

const client = createPublicClient({
  chain: worldchain,
  transport: http(),
})

export const ADDRESS_WORLD_COIN =
  "0x2cFc85d8E48F8EAB294be644d9E25C3030863003" as const

export const useAccountBalances = (address?: Address | null) => {
  const { data: balances = null } = useSWR(
    address ? `balance-${address}` : null,
    async () => {
      if (!address) return null

      const [WLD, JUZ] = await Promise.all([
        client.readContract({
          abi: erc20Abi,
          functionName: "balanceOf",
          address: ADDRESS_WORLD_COIN,
          args: [address as any],
        }),
        getPlayerJUZEarned(address),
      ])

      return {
        WLD,
        JUZ: parseUnits(`${JUZ}`, 18),
      }
    },
    {
      refreshInterval: 5_000, // 5 seconds
    }
  )

  const WLD = balances?.WLD || ZERO
  const JUZ = balances?.JUZ || ZERO

  return {
    WLD: { balance: WLD, formatted: formatEther(WLD) },
    JUZ: {
      balance: JUZ,
      formatted: formatEther(JUZ),
      /** `true` if user has claimed this balance as ERC20 token */
      isSynced: false,
    },
  }
}
