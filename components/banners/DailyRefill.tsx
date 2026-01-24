"use client"

import { useMemo } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { FaArrowRight } from "react-icons/fa"
import { useTimer } from "@/lib/time"
import { openHeartsDialog } from "@/lib/utils"
import { usePlayerHearts } from "@/lib/atoms/user"

import asset_skaterboi from "@/assets/skaterboi.png"

export default function DailyRefill() {
  const t = useTranslations("Home")
  const { nextRefillTime, canBeRefilled } = usePlayerHearts()

  const secondsToNextRefill = useMemo(() => {
    return nextRefillTime ? Math.floor((nextRefillTime - Date.now()) / 1000) : 0
  }, [nextRefillTime])

  const { elapsedTime } = useTimer(secondsToNextRefill)

  return (
    <div className="border-3 bg-gradient-to-r from-juz-green-lime/0 via-juz-green-lime/0 to-juz-green-lime/70 relative overflow-hidden shadow-3d-lg border-black p-4 !pr-0 rounded-2xl">
      <div className="pr-40">
        <h1 className="text-xl font-semibold">{t("dailyRefill.title")}</h1>

        <p className="mt-2 text-xs max-w-[16rem]">
          {t.rich("dailyRefill.content", {
            strong: (children) => <strong>{children}</strong>,
          })}
        </p>

        <nav className="flex mt-4">
          {canBeRefilled ? (
            <button
              onClick={openHeartsDialog}
              className="bg-black whitespace-nowrap h-14 flex items-center justify-center gap-3 px-5 rounded-lg text-white"
            >
              <strong className="font-semibold">{t("refillNow")}</strong>
              <FaArrowRight />
            </button>
          ) : secondsToNextRefill > elapsedTime ? (
            <div className="bg-black h-14 py-2.5 px-4 rounded-lg text-white">
              <div className="text-xs">{t("timeToRefill")}</div>
              <div className="font-semibold -mt-0.5 tabular-nums">
                {formatCountdown(secondsToNextRefill - elapsedTime)}
              </div>
            </div>
          ) : null}
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
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
    2,
    "0",
  )}m ${String(seconds).padStart(2, "0")}s`
}
