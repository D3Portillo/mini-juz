"use client"

import useSWR from "swr"
import { formatEther, parseUnits } from "viem"
import { useWorldAuth } from "@radish-la/world-auth"

import { getPlayerJUZEarned } from "@/actions/game"
import { ZERO } from "@/lib/constants"
import { getTotalUserHoldings, type Holdings } from "./holdings"

export const useAccountBalances = () => {
  const { user } = useWorldAuth()
  const address = user?.walletAddress

  const { data: balances = {}, ...query } = useSWR(
    address ? `all-balances-${address}` : null,
    async () => {
      if (!address) return {}

      const [holdings, offchainJUZEarned] = await Promise.all([
        getTotalUserHoldings(address),
        getPlayerJUZEarned(address),
      ])

      return {
        ...holdings,
        JUZPoints: parseUnits(`${offchainJUZEarned}`, 18),
      } as any
    },
    {
      refreshInterval: 5_000, // 5 seconds
    }
  )

  const WLD = balances?.WLD || ZERO
  const JUZToken = balances?.JUZToken || ZERO
  const VE_JUZ = balances?.VE_JUZ || ZERO
  const lockedJUZ = balances?.lockedJUZ || ZERO
  const JUZPoints = balances?.JUZPoints || ZERO

  // All the JUZ related balances that sumup in the leaderboard
  const TotalJUZBalance = JUZPoints + JUZToken + VE_JUZ + lockedJUZ

  return {
    ...query,
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
      isOnchainSynced: false,
      onchainJUZAvailable: 0,
      // TODO: Build a RewardDistributor contract to get onchain JUZ available
    },
  }
}
