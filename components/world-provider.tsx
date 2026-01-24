"use client"

import type { PropsWithChildren } from "react"
import { WorldAppProvider } from "@radish-la/world-auth"
import { validator } from "@/app/session"

export default function WorldProvider({ children }: PropsWithChildren) {
  return (
    <WorldAppProvider appName="JUZ by Lemon" withValidator={validator}>
      {children}
    </WorldAppProvider>
  )
}
