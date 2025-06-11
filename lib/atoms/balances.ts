"use client"

import useSWR from "swr"
import { formatEther } from "viem"
import { useWorldAuth } from "@radish-la/world-auth"

import { ZERO } from "@/lib/constants"

export const useAccountBalances = () => {
  const { address } = useWorldAuth()

  const {
    data: balances = {},
    error,
    ...query
  } = useSWR(
    address ? `address.balances.${address}` : null,
    async () => {
      if (!address) return {}

      const holdings = await fetch(`/api/holdings/${address}`)
      const payload = (await holdings.json()) as Record<string, string>

      return Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, BigInt(value)])
      )
    },
    {
      keepPreviousData: true,
      refreshInterval: 4_500, // 4.5 seconds
    }
  )

  const WLD = balances?.WLD || ZERO
  const JUZToken = balances?.JUZToken || ZERO
  const VE_JUZ = balances?.VE_JUZ || ZERO
  const JUZPoints = balances?.JUZPoints || ZERO
  const lockedJUZ = balances?.lockedJUZ || ZERO

  // All the JUZ related balances that sumup in the leaderboard
  const TotalJUZBalance = JUZPoints + JUZToken + VE_JUZ + lockedJUZ

  return {
    ...query,
    /** SWR returned payload */
    data: balances,

    // All tokens are 18 decimals
    // So we can use formatEther safely
    /** The balance that accounts for this wallet holdings in terms of the MiniApp */
    TotalJUZBalance: {
      balance: TotalJUZBalance,
      formatted: formatEther(TotalJUZBalance),
    },
    WLD: { balance: WLD, formatted: formatEther(WLD) },
    VE_JUZ: {
      balance: VE_JUZ,
      formatted: formatEther(VE_JUZ),
    },
    lockedJUZ: {
      balance: lockedJUZ,
      formatted: formatEther(lockedJUZ),
    },
    JUZToken: {
      balance: JUZToken,
      formatted: formatEther(JUZToken),
    },
    JUZPoints: {
      balance: JUZPoints,
      formatted: formatEther(JUZPoints),
      /** `true` if user has claimed this balance as ERC20 token */
      isOnchainSynced: JUZPoints < 1,
    },
  }
}
