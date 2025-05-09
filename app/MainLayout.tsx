import type { PropsWithChildren } from "react"

import { PostHogProvider } from "@/components/posthog"
import BottomNavigation from "./BottomNavigation"

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="h-dvh overflow-hidden flex flex-col bg-white w-full max-w-2xl mx-auto">
      <PostHogProvider>
        <div className="[&_main]:overflow-auto [&_main]:pb-[4.5rem] [&_main]:max-h-[calc(100dvh-var(--safe-pb))]">
          {children}
        </div>
        <BottomNavigation />
      </PostHogProvider>
    </main>
  )
}
