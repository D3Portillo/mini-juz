import type { PropsWithChildren } from "react"
import WithDevAccount from "./WithDevAccount"
import BottomNavigation from "./BottomNavigation"

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="min-h-dvh flex flex-col bg-white w-full max-w-2xl mx-auto">
      <WithDevAccount>{children}</WithDevAccount>
      <div className="h-navigation w-full pointer-events-none" />
      <BottomNavigation />
    </main>
  )
}
