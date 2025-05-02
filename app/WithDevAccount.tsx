"use client"

import { useWorldAuth } from "@radish-la/world-auth"
import { useEffect } from "react"

export default function WithDevAccount({
  children,
}: {
  children: React.ReactNode
}) {
  const { isMiniApp, reklesslySetUser } = useWorldAuth()

  useEffect(() => {
    if ((window as any).WorldApp) return
    if (process.env.NODE_ENV === "development") {
      // Inject development account when in local and not inside World app
      reklesslySetUser({
        walletAddress: "0xB6594a5EdDA3E0D910Fb57db7a86350A9821327a",
        username: "Limoncito",
      })
    }
  }, [isMiniApp])

  return children
}
