import "@worldcoin/mini-apps-ui-kit-react/styles.css"
import "./globals.css"

import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Rubik, Sora } from "next/font/google"

import WorldProvider from "@/components/world-provider"
import { Toaster as WorldToaster } from "@worldcoin/mini-apps-ui-kit-react"
import GameSentinel from "./GameSentinel"
import WelcomeModal from "./WelcomeModal"
import MainLayout from "./MainLayout"

const fontRubik = Rubik({
  subsets: [],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
})

const fontSora = Sora({
  subsets: [],
  variable: "--font-display",
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: "JUZ Mini App",
  description: "Learn, share, create and earn with Lemon",
  metadataBase: new URL("https://mini-juz.vercel.app"),
}

const ErudaProvider = dynamic(
  () => import("../components/Eruda").then((r) => r.ErudaProvider),
  {
    ssr: false,
  }
)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontRubik.variable} ${fontSora.variable} ${fontRubik.className} antialiased`}
      >
        <WelcomeModal />
        <WorldToaster duration={2_500} />
        <GameSentinel />
        <WorldProvider>
          <ErudaProvider>
            <MainLayout>{children}</MainLayout>
          </ErudaProvider>
        </WorldProvider>
      </body>
    </html>
  )
}
