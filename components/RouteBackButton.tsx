"use client"

import { useRouter } from "next/navigation"
import { FaChevronLeft } from "react-icons/fa"

export default function RouteBackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="bg-black/5 size-10 pr-1 rounded-full grid place-items-center"
    >
      <FaChevronLeft className="text-lg" />
    </button>
  )
}
