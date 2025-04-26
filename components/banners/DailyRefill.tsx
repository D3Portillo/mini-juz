"use client"

import { useMemo } from "react"
import Image from "next/image"

import { useNextRefillTime } from "@/lib/atoms/user"
import { useTimer } from "@/lib/time"

import asset_skaterboi from "@/assets/skaterboi.png"

export default function DailyRefill() {
  const { nextRefill } = useNextRefillTime()
  const secondsToNextRefill = useMemo(() => {
    return Math.floor((nextRefill - Date.now()) / 1000)
  }, [nextRefill])

  const { elapsedTime } = useTimer(secondsToNextRefill)

  return (
    <div className="border-3 bg-gradient-to-r from-juz-green-lime/0 via-juz-green-lime/0 to-juz-green-lime/70 relative overflow-hidden mt-14 shadow-3d-lg border-black p-4 !pr-0 rounded-2xl">
      <div className="pr-36">
        <h1 className="text-xl font-semibold">Daily hearts refill</h1>

        <p className="mt-2 text-xs max-w-xs">
          Get a full-hearts refill every 24 hours. Make it to the top and earn
          rewards for being the smartest player!
        </p>

        <nav className="flex mt-4">
          <div className="bg-black py-2 px-4 rounded-lg text-white">
            <div className="text-xs">Time to refill</div>
            <div className="font-semibold -mt-0.5 tabular-nums">
              {formatCountdown(secondsToNextRefill - elapsedTime)}
            </div>
          </div>
        </nav>
      </div>

      <figure className="w-40 absolute -right-4 -top-8 -bottom-8">
        <Image
          fill
          className="object-cover"
          src={asset_skaterboi}
          alt=""
          placeholder="blur"
        />
      </figure>
    </div>
  )
}

function formatCountdown(secondsLeft: number): string {
  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")} H`
}
