"use client"

import type { PropsWithChildren } from "react"
import { WorldAppProvider } from "@radish-la/world-auth"
import { validator } from "@/app/session"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

export default function WorldProvider({ children }: PropsWithChildren) {
  const { toast } = useToast()
  return (
    <WorldAppProvider
      onWrongEnvironment={() => {
        toast.error({
          title: "Only available in World App",
        })
      }}
      appName="JUZ by Lemon"
      withValidator={validator}
    >
      {children}
    </WorldAppProvider>
  )
}
