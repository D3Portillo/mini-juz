"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

import { IoGameController, IoStorefront } from "react-icons/io5"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaGem, FaLemon } from "react-icons/fa"

const PLAY_ROUTE = {
  href: "/",
  value: "play",
  label: "Play",
} as const

const ROUTES = {
  play: PLAY_ROUTE,
  rewards: {
    href: "/rewards",
    value: "rewards",
    label: "Rewards",
  },
  profile: {
    href: "/profile",
    value: "profile",
    label: "Profile",
  },
  market: {
    href: "/market",
    value: "market",
    label: "Market",
  },
} as const

export default function BottomNavigation() {
  const pathname = usePathname()

  const activePathValue =
    Object.values(ROUTES).find((route) => {
      return pathname === route.href
    })?.value || PLAY_ROUTE.value

  return (
    <Tabs value={activePathValue} asChild>
      <Fragment>
        <TabsList asChild>
          <nav className="border-t shrink-0 [&_a]:shrink-0 z-2 fixed left-0 right-0 bottom-[--safe-pb] !bg-white rounded-none h-auto grid grid-cols-4">
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
