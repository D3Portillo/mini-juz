"use client"

import useSWR from "swr"
import { erc20Abi, formatEther } from "viem"

import { useWorldAuth } from "@radish-la/world-auth"
import { useWLDPriceInUSD } from "@/lib/atoms/prices"
import { useWLDPerETH } from "./internals"

import { ABI_JUZ_POOLS, worldClient } from "@/lib/atoms/holdings"
import {
  ADDRESS_POOL_WLD_ETH,
  ADDRESS_WETH,
  ADDRESS_WORLD_COIN,
  ZERO,
} from "@/lib/constants"

const getERC20BalancesForPoolInTokens01 = async () => {
  if (!worldClient) return [ZERO, ZERO]
  const [token0, token1] = await Promise.all([
    worldClient.readContract({
      abi: erc20Abi,
      functionName: "balanceOf",
      address: ADDRESS_WORLD_COIN,
      args: [ADDRESS_POOL_WLD_ETH],
    }),
    worldClient.readContract({
      abi: erc20Abi,
      functionName: "balanceOf",
      address: ADDRESS_WETH,
      args: [ADDRESS_POOL_WLD_ETH],
    }),
  ])

  return [token0, token1]
}

export const useAccountPosition = () => {
  const { user } = useWorldAuth()
  const address = user?.walletAddress

  const { wldPriceInUSD } = useWLDPriceInUSD()
  const { wldPerETH } = useWLDPerETH()

  const { data: deposits = null } = useSWR(
    address
      ? `user.deposits.pool.${address}.${wldPerETH}.${wldPriceInUSD}`
      : null,
    async () => {
      // Updated based on the WLD price
      if (!worldClient || !address) return null
      const [token0, token1] = await worldClient.readContract({
        abi: ABI_JUZ_POOLS,
        functionName: "addressDeposits",
        args: [address],
        address: ADDRESS_POOL_WLD_ETH,
      })

      // TODO: Return token decimals to format the numbers correctly
      // for now both are 18 decimals

      const formattedToken0 = formatEther(token0) as any
      const formattedToken1 = formatEther(token1) as any

      const amountUSD0 = Number(formattedToken0) * wldPriceInUSD
      const amountUSD1 = Number(formattedToken1) * wldPerETH * wldPriceInUSD

      return {
        totalUSD: amountUSD0 + amountUSD1,
        token0: {
          value: token0,
          formatted: formattedToken0,
          amountUSD: amountUSD0,
        },
        token1: {
          value: token1,
          formatted: formattedToken1,
          amountUSD: amountUSD1,
        },
      }
    },
    {
      keepPreviousData: true,
    }
  )

  const { data: poolShare = null } = useSWR(
    address
      ? `user.earned.pool.${address}.${wldPerETH}.${wldPriceInUSD}`
      : null,
    async () => {
      if (!worldClient || !address) return null
      const [totalShares, userShares, erc20Balances, liquidityAmounts] =
        await Promise.all([
          worldClient.readContract({
            abi: ABI_JUZ_POOLS,
            functionName: "totalShares",
            address: ADDRESS_POOL_WLD_ETH,
          }),
          worldClient.readContract({
            abi: ABI_JUZ_POOLS,
            functionName: "addressShares",
            args: [address],
            address: ADDRESS_POOL_WLD_ETH,
          }),
          getERC20BalancesForPoolInTokens01(),
          worldClient.readContract({
            abi: ABI_JUZ_POOLS,
            functionName: "getLiquidityAmounts",
            address: ADDRESS_POOL_WLD_ETH,
          }),
        ])

      const [liquidityAmount0, liquidityAmount1] = liquidityAmounts
      const [balanceOf0, balanceOf1] = erc20Balances

      // WLD
      const totalBalance0 = liquidityAmount0 + balanceOf0
      // WETH
      const totalBalance1 = liquidityAmount1 + balanceOf1

      // Ratio of user shares to total shares
      const userShareFraction =
        totalShares > 0 ? userShares / totalShares : ZERO

      // Get user balances
      const userToken0 = totalBalance0 * userShareFraction
      const userToken1 = totalBalance1 * userShareFraction

      const formattedToken0 = formatEther(userToken0) as any
      const formattedToken1 = formatEther(userToken1) as any

      const amountUSD0 = Number(formattedToken0) * wldPriceInUSD
      const amountUSD1 = Number(formattedToken1) * wldPerETH * wldPriceInUSD

      return {
        totalUSD: amountUSD0 + amountUSD1,
        token0: {
          value: userToken0,
          formatted: formattedToken0,
          amountUSD: amountUSD0,
        },
        token1: {
          value: userToken1,
          formatted: formattedToken1,
          amountUSD: amountUSD1,
        },
      }
    },
    {
      keepPreviousData: true,
    }
  )

  return {
    deposits,
    poolShare,
  }
}

export const usePoolTVL = () => {
  const { wldPriceInUSD } = useWLDPriceInUSD()
  const { wldPerETH } = useWLDPerETH()

  const { data = null } = useSWR(
    `pools.metadata.${wldPriceInUSD}`,
    async () => {
      // Updated based on the WLD price
      if (!worldClient) return null
      const [tvlInWLD, ERC20balances] = await Promise.all([
        worldClient.readContract({
          abi: ABI_JUZ_POOLS,
          functionName: "totalValueInToken0",
          address: ADDRESS_POOL_WLD_ETH,
        }),
        getERC20BalancesForPoolInTokens01(),
      ])

      // WLD, WETH
      const [balanceOf0, balanceOf1] = ERC20balances
      // ETH in WLD terms
      const balanceOf1InWLD = balanceOf1 * BigInt(wldPerETH)

      // TLV becomes the sum of liquidity + pending deposits
      // TVL is in WLD terms for USD
      return {
        tvl:
          Number(formatEther(tvlInWLD + balanceOf0 + balanceOf1InWLD)) *
          wldPriceInUSD,
        liquidityInUSD: Number(formatEther(tvlInWLD)) * wldPriceInUSD,
      }
    },
    {
      keepPreviousData: true,
    }
  )

  return {
    /** TVL in USD */
    tvl: data?.tvl || 0,
    liquidityInUSD: data?.liquidityInUSD || 0,
  }
}
