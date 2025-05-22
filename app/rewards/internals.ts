"use client"

import useSWR from "swr"
import { formatEther } from "viem"

import { useWLDPriceInUSD } from "@/lib/atoms/prices"
import { ABI_JUZ_POOLS, worldClient } from "@/lib/atoms/holdings"
import { ADDRESS_DEV, ADDRESS_POOL_WLD_ETH } from "@/lib/constants"
import { ABI_UNI_V3 } from "@/lib/uniswap"

export const usePoolAPRData = () => {
  const { data, ...query } = useSWR(
    "pools.apr.all",
    async () => {
      const [{ apr: merkl }, { apr: uni }] = (await Promise.all([
        fetch("/api/aprs/merkl").then((r) => r.json()),
        fetch("/api/aprs/uni").then((r) => r.json()),
      ])) as { apr: number }[]

      return {
        merkl,
        uni,
      }
    },
    {
      refreshInterval: 25_000, // 25 seconds
    }
  )

  const merkl = data?.merkl ?? 0
  const uni = data?.uni ?? 0
  const juzToken = 15 // 15% from JUZ Tokens

  return {
    aprData: {
      uni,
      merkl,
      juzToken, // 15% from JUZ Tokens
      total: merkl + juzToken + uni,
    },
    ...query,
  }
}

export const useCompoundRewardData = () => {
  const { wldPriceInUSD } = useWLDPriceInUSD()

  const { data: compoundRewardData = null, ...query } = useSWR(
    `compounder.available.rewards`,
    async () => {
      if (!worldClient) return null

      const [{ result }, [x96Price]] = await Promise.all([
        worldClient.simulateContract({
          abi: ABI_JUZ_POOLS,
          address: ADDRESS_POOL_WLD_ETH,
          account: ADDRESS_DEV,
          // (uint256 reward0, uint256 reward1, uint256 nextClaimTime, bool isTimeLocked)
          functionName: "recklesslyCompound",
        }),
        worldClient.readContract({
          abi: ABI_UNI_V3,
          functionName: "slot0",
          address: "0x494d68e3cab640fa50f4c1b3e2499698d1a173a0",
          args: [],
        }),
      ])

      const wldPerETH = Number(BigInt(2 ** 192) / (x96Price * x96Price))

      const [wld, eth, nextClaimTime, isTimeLocked] = result

      const reward0 = formatEther(wld)
      const reward0USD = Number(reward0) * wldPriceInUSD
      const reward1 = formatEther(eth)
      const reward1USD = Number(reward1) * wldPerETH * wldPriceInUSD

      return {
        x96Price,
        wldPerETH,
        reward0,
        reward0USD,
        reward1,
        reward1USD,
        nextClaimTime: new Date(Number(nextClaimTime) * 1000),
        isTimeLocked,
        totalUSD: reward0USD + reward1USD,
      }
    },
    {
      refreshInterval: 2_500, // 2.5 seconds
    }
  )

  return {
    compoundRewardData,
    ...query,
  }
}

export const useWLDPerETH = () => {
  const { compoundRewardData } = useCompoundRewardData()

  return {
    wldPerETH: compoundRewardData?.wldPerETH ?? 1,
    x96Price: compoundRewardData?.x96Price ?? BigInt(0),
  }
}
