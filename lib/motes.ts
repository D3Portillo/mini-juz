"use client"

import useSWR from "swr"
import { worldClient } from "./atoms/holdings"
import { ADDRESS_JUZ, ZERO } from "./constants"
import { erc20Abi, formatEther } from "viem"

export const useJUZTotalSupply = () => {
  const { data = ZERO } = useSWR(
    `juz.total.supply`,
    async () => {
      const totalJUZ = await worldClient.readContract({
        address: ADDRESS_JUZ,
        abi: erc20Abi,
        functionName: "totalSupply",
      })

      return totalJUZ
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    formatted: formatEther(data),
    totalSupply: data,
  }
}

export const useAddressMote = (points = 0) => {
  const { totalSupply } = useJUZTotalSupply()

  const { data: mote = null, ...query } = useSWR(
    totalSupply && points ? `emotes.for.${points}.${totalSupply}` : null,
    async () => {
      if (!totalSupply) return null

      const ownedPercentage = (points / Number(formatEther(totalSupply))) * 100

      const MOTE = [
        {
          mote: "Whale",
          emoji: "🐋",
          unlockPercentage: 1.5,
        },
        {
          mote: "Shark",
          emoji: "🦈",
          unlockPercentage: 1,
        },
        {
          mote: "Octopus",
          emoji: "🐙",
          unlockPercentage: 0.5,
        },
        {
          mote: "Crab",
          emoji: "🦀",
          unlockPercentage: 0.25,
        },
        {
          mote: "Shrimp",
          emoji: "🦐",
          unlockPercentage: 0.1,
        },
      ]

      return (
        MOTE.find((mote) => ownedPercentage >= mote.unlockPercentage) || null
      )
    }
  )

  return {
    ...query,
    mote,
  }
}
