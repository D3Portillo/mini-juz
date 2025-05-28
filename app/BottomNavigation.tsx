"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Fragment } from "react"

import { IoGameController, IoStorefront } from "react-icons/io5"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaGem, FaLemon } from "react-icons/fa"
import { MdSwapCalls } from "react-icons/md"

export default function BottomNavigation() {
  const t = useTranslations("BottomNavigation")
  const pathname = usePathname()

  const PLAY_ROUTE = {
    href: "/",
    value: "play",
    label: t("play"),
  } as const

  const ROUTES = {
    play: PLAY_ROUTE,
    rewards: {
      href: "/rewards",
      value: "rewards",
      label: t("rewards"),
    },
    profile: {
      href: "/profile",
      value: "profile",
      label: t("profile"),
    },
    market: {
      href: "/market",
      value: "market",
      label: t("market"),
    },
    swap: {
      href: "/swap",
      value: "swap",
    },
  } as const

  const activePathValue =
    Object.values(ROUTES).find((route) => {
      return pathname === route.href
    })?.value || PLAY_ROUTE.value

  return (
    <Tabs value={activePathValue} asChild>
      <Fragment>
        <TabsList asChild>
          <nav className="border-t shrink-0 [&_a]:shrink-0 z-2 fixed left-0 right-0 bottom-[--safe-pb] !bg-white rounded-none h-auto grid grid-cols-5">
            <NavItem
              onClick={() => {
                // Focus on the play tab when navigating to the play route
                ;(document.querySelector("#play-tab") as any)?.focus()
              }}
              route={ROUTES.play}
              icon={<IoGameController className="text-2xl" />}
            />

            <NavItem
              route={ROUTES.profile}
              icon={<FaLemon className="text-xl scale-90" />}
            />

            <TabsTrigger
              asChild
              className="grid place-items-center group text-black/70 data-[state=active]:text-black"
              value={ROUTES.swap.value}
            >
              <Link href={ROUTES.swap.href}>
                <div className="size-12 group-active:scale-105 rounded-full border-2 border-transparent bg-black/10 group-data-[state=active]:border-black group-data-[state=active]:bg-juz-green-lime grid place-items-center">
                  <MdSwapCalls className="text-2xl scale-110" />
                </div>
              </Link>
            </TabsTrigger>

            <NavItem
              route={ROUTES.market}
              icon={<IoStorefront className="text-xl" />}
            />

            <NavItem
              route={ROUTES.rewards}
              icon={<FaGem className="text-xl" />}
            />
          </nav>
        </TabsList>
      </Fragment>
    </Tabs>
  )
}

function NavItem({
  icon,
  route,
  onClick,
}: {
  icon: React.ReactNode
  onClick?: () => void
  route: {
    href: string
    value: string
    label: string
  }
}) {
  return (
    <TabsTrigger
      asChild
      onClick={onClick}
      className="grid place-items-center p-1 pt-2 h-14 rounded-none text-black/70 !bg-transparent data-[state=active]:text-juz-green"
      value={route.value}
    >
      <Link href={route.href}>
        <div className="size-5 grid place-items-center place-content-center">
          {icon}
        </div>
        <span className="text-xs">{route.label}</span>
      </Link>
    </TabsTrigger>
  )
}
