import type { PropsWithChildren } from "react"
import WithDevAccount from "./WithDevAccount"
import BottomNavigation from "./BottomNavigation"

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="h-dvh overflow-hidden flex flex-col bg-white w-full max-w-2xl mx-auto">
      <WithDevAccount>
        <div className="[&_main]:overflow-auto [&_main]:pb-[4.5rem] [&_main]:max-h-dvh">
          {children}
        </div>
      </WithDevAccount>
      <BottomNavigation />
    </main>
  )
}
