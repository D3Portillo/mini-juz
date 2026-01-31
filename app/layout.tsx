import "@worldcoin/mini-apps-ui-kit-react/styles.css"
import "./globals.css"

import type { Metadata, Viewport } from "next"
import dynamic from "next/dynamic"
import { Rubik, Sora } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"

import WorldProvider from "@/components/world-provider"
import { Toaster as WorldToaster } from "@worldcoin/mini-apps-ui-kit-react"
import GameSentinel from "./GameSentinel"
import MainLayout from "./MainLayout"
import InviteSentinel from "@/components/InviteSentinel"

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

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
}

const ErudaProvider = dynamic(
  () => import("@/components/Eruda").then((r) => r.ErudaProvider),
  {
    ssr: false,
  },
)

const WelcomeModal = dynamic(() => import("./WelcomeModal"), {
  ssr: false,
})

const HoldStationSetup = dynamic(() => import("./HoldStationSetup"), {
  ssr: false,
})

const Changelog = dynamic(() => import("@/components/Changelog"), {
  ssr: false,
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9947700832589189" />
      </head>
      <body
        className={`${fontRubik.variable} ${fontSora.variable} ${fontRubik.className} antialiased`}
      >
        <WelcomeModal />
        <WorldToaster duration={2_500} />
        <WorldProvider>
          <HoldStationSetup />
          <GameSentinel />
          <ErudaProvider>
            <NextIntlClientProvider>
              <Changelog />
              <InviteSentinel />
              <MainLayout>{children}</MainLayout>
            </NextIntlClientProvider>
          </ErudaProvider>
        </WorldProvider>
      </body>
    </html>
  )
}

// TODO: Find a logic to batch users getting erc20 tokens from external
