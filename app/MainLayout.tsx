import type { PropsWithChildren } from "react"
import WithDevAccount from "./WithDevAccount"
import BottomNavigation from "./BottomNavigation"

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen flex flex-col relative bg-white w-full max-w-2xl mx-auto">
      <WithDevAccount>{children}</WithDevAccount>
      <div className="flex-grow" />
      <BottomNavigation />
    </main>
  )
}
