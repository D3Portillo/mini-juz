import type { PropsWithChildren } from "react"
import BottomNavigation from "./BottomNavigation"

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen relative bg-white w-full max-w-2xl mx-auto">
      {children}
      <div className="h-px absolute bottom-0 bg-black w-full" />
      <BottomNavigation />
    </main>
  )
}
