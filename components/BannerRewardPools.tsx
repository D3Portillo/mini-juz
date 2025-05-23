"use client"

import { useRouter } from "next/navigation"
import { FaArrowRight } from "react-icons/fa"
import APRDialogTrigger from "@/app/rewards/APRDialogTrigger"

import LemonButton from "./LemonButton"

export default function BannerRewardPools() {
  const router = useRouter()

  return (
    <div className="border-3 bg-white mt-14 mb-6 shadow-3d-lg border-black p-4 rounded-2xl">
      <nav className="flex gap-2 items-start justify-between">
        <h2 className="text-xl font-semibold">
          Introducing
          <br />
          JUZ Pools ✨
        </h2>
        <APRDialogTrigger />
      </nav>

      <p className="mt-2 text-xs max-w-sm">
        Join the a JUZ Pool and earn WETH, WLD and JUZ rewards while generating
        an extra juicy-yield in selected DeFi protocols in Worldchain.
      </p>

      <nav className="mt-5">
        <LemonButton
          onClick={() => router.push("/rewards")}
          className="w-full bg-juz-green-lime rounded-xl text-base py-3.5 flex gap-4 justify-between items-center"
        >
          <span className="text-base">Join the pool now</span>
          <FaArrowRight className="text-lg" />
        </LemonButton>
      </nav>
    </div>
  )
}
