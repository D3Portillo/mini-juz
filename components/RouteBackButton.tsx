"use client"

import { usePathname, useRouter } from "next/navigation"
import { FaChevronLeft } from "react-icons/fa"

const FORCED_HOME_ROUTES = ["/profile", "/market"]

export default function RouteBackButton() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (FORCED_HOME_ROUTES.includes(pathname)) return router.push("/")
        router.back()
      }}
      className="bg-black/5 size-10 pr-1 rounded-full grid place-items-center"
    >
      <FaChevronLeft className="text-lg" />
    </button>
  )
}
