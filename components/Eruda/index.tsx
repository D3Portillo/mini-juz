"use client"

import type { PropsWithChildren } from "react"
import { atom, useAtom } from "jotai"
import { Eruda } from "./eruda-provider"

const atomShowErudaInProd = atom(false)
export const useShowErudaInProd = () => useAtom(atomShowErudaInProd)

export const ErudaProvider = ({ children }: PropsWithChildren) => {
  const [showErudaInProd] = useShowErudaInProd()
  if (process.env.NODE_ENV === "production" && !showErudaInProd) {
    // Eruda can be used in production, but only if explicitly enabled
    return children
  }

  return <Eruda>{children}</Eruda>
}

export const isErudaDevAddress = (address?: string) => {
  // Yeah, this will be updated later
  return address === "0x4c46f6d2314a41915324af999685ac447cbb79d9"
}
