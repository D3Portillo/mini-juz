"use client"

import { atom, useAtom } from "jotai"
import { getHardwareType } from "@/lib/window"
import { ADDRESS_USDC, ADDRESS_WETH, ADDRESS_WORLD_COIN } from "@/lib/constants"

const isIOS = () => getHardwareType().isIOS

export const WLD_TOKEN = {
  label: "WLD",
  value: "WLD",
  address: ADDRESS_WORLD_COIN,
  decimals: 18,
} as const

export const ALL_TOKENS = {
  WLD: WLD_TOKEN,
  "USDC.E": {
    label: "USDC",
    value: "USDC.E",
    address: ADDRESS_USDC,
    decimals: 6,
  },
  WETH: {
    label: "WETH",
    value: "WETH",
    address: ADDRESS_WETH,
    decimals: 18,
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
