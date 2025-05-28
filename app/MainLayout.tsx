"use client"

import type { PropsWithChildren } from "react"

import { PostHogProvider } from "@/components/posthog"
import { isWebsiteView } from "@/lib/isWebsiteView"
import BottomNavigation from "./BottomNavigation"

export default function MainLayout({ children }: PropsWithChildren) {
  // Return page directly when in a website view
  if (isWebsiteView()) return children

  return (
    <main className="h-dvh overflow-hidden flex flex-col bg-white w-full max-w-2xl mx-auto">
      <PostHogProvider>
        <div className="[&_main]:overflow-auto h-full [&_main]:pb-[4.5rem] [&_main]:max-h-[calc(100dvh-var(--safe-pb))]">
          {children}
        </div>
        <BottomNavigation />
      </PostHogProvider>
    </main>
  )
}
