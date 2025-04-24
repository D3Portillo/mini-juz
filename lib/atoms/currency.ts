"use client"

import { atom, useAtom } from "jotai"

export const USD = {
  label: "USD",
  value: "USD",
} as const

export const ALL_CURRENCIES = {
  USD: USD,
  EUR: {
    label: "EUR",
    value: "EUR",
  },
} as const

export const atomCurrency = atom(USD)
export const useCurrencyAtom = () => useAtom(atomCurrency)
