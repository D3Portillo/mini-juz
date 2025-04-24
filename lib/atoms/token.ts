"use client"

import { atom, useAtom } from "jotai"

export const WLD_TOKEN = {
  label: "WLD",
  value: "WLD",
} as const

export const ALL_TOKENS = {
  WLD: WLD_TOKEN,
  "USDC.E": {
    label: "USDC.E",
    value: "USDC.E",
  },
  WETH: {
    label: "WETH",
    value: "WETH",
  },
  WBTC: {
    label: "WBTC",
    value: "WBTC",
  },
} as const

export const atomToken = atom(WLD_TOKEN)
export const useTokenAtom = () => useAtom(atomToken)
