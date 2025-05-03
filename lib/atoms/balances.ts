"use client"

import useSWR from "swr"
import {
  createPublicClient,
  erc20Abi,
  formatEther,
  http,
  parseAbi,
  parseUnits,
} from "viem"

import { getPlayerJUZEarned } from "@/actions/game"
import { worldchain } from "viem/chains"
import {
  ADDRESS_JUZ,
  ADDRESS_LOCK_CONTRACT,
  ADDRESS_VE_JUZ,
  ADDRESS_WORLD_COIN,
  ZERO,
} from "@/lib/constants"
import { useWorldAuth } from "@radish-la/world-auth"

export const worldClient = createPublicClient({
  chain: worldchain,
  transport: http(),
})

export const ABI_LOCKED_JUZ = parseAbi([
  "function claimVeJUZ() public",
  "function getLockData(address) external view returns ((uint256 lockedJUZ, uint256 unlockTime, uint256 lockTime, uint256 veJUZClaimed))",
  "function getRewardData(address) external view returns (uint256 earned, uint256 claimable)",
])

export const useAccountBalances = () => {
  const { user } = useWorldAuth()
  const address = user?.walletAddress

  const { data: balances = {}, ...query } = useSWR(
    address ? `all-balances-${address}` : null,
    async () => {
      if (!address) return {}

      const ERC20_BALANCE = {
        abi: erc20Abi,
        functionName: "balanceOf",
      } as const

      const [multicallResult, offchainJUZEarned] = await Promise.all([
        worldClient.multicall({
          contracts: [
            {
              ...ERC20_BALANCE,
              address: ADDRESS_WORLD_COIN,
              args: [address as any],
            },
            {
              ...ERC20_BALANCE,
              address: ADDRESS_JUZ,
              args: [address as any],
            },
            {
              ...ERC20_BALANCE,
              address: ADDRESS_VE_JUZ,
              args: [address as any],
            },
            {
              abi: ABI_LOCKED_JUZ,
              functionName: "getLockData",
              address: ADDRESS_LOCK_CONTRACT,
              args: [address as any],
            },
          ],
        }),
        getPlayerJUZEarned(address),
      ])

      const [WLD, JUZ, VE_JUZ, lockData] = multicallResult

      return {
        WLD: WLD.result || ZERO,
        VE_JUZ: VE_JUZ.result || ZERO,
        JUZToken: JUZ.result || ZERO,
        JUZPoints: parseUnits(`${offchainJUZEarned}`, 18),
        lockedJUZ: lockData.result?.lockedJUZ || ZERO,
      }
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
