"use client"

import { atom, useAtom } from "jotai"
import { getHardwareType } from "../window"

const isIOS = () => getHardwareType().isIOS

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

export const LEMON_TOKENS = {
  JUZ: {
    label: isIOS() ? "JUZ Points" : "JUZ Token",
    value: "JUZ",
  },
  veJUZ: {
    label: "veJUZ",
    value: "veJUZ",
  },
} as const

export const CURRENCY_TOKENS = {
  JUZ: LEMON_TOKENS.JUZ,
  ...((isIOS()
    ? {}
    : {
        // Only show WLD on Android
        WLD: WLD_TOKEN,
      }) as {
    WLD: typeof WLD_TOKEN
  }),
} as const

export const atomToken = atom(WLD_TOKEN)
export const useTokenAtom = () => useAtom(atomToken)
