"use client"

import type { PropsWithChildren } from "react"
import { WorldAppProvider } from "@radish-la/world-auth"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { validator } from "@/app/session"
import { getUserLocale } from "@/actions/locale"

export default function WorldProvider({ children }: PropsWithChildren) {
  const { toast } = useToast()
  return (
    <WorldAppProvider
      onWrongEnvironment={async () => {
        const locale = await getUserLocale()
        toast.error({
          title:
            locale === "es"
              ? "Disponible solamente en World App"
              : "Only available in World App",
        })
      }}
      appName="JUZ by Lemon"
      withValidator={validator}
    >
      {children}
    </WorldAppProvider>
  )
}
