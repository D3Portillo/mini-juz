"use client"

import { Fragment, useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { cn } from "@/lib/utils"
import ReusableDialog from "@/components/ReusableDialog"

import { FaFireAlt } from "react-icons/fa"
import { IoSparklesSharp } from "react-icons/io5"

import {
  calculateBoostPriceInWLD,
  MAX_BOOST_PERCENT,
  MIN_BOOST_PERCENT,
  UNLOCK_BOOST_VALUE,
} from "./internals"
import asset_bg from "@/assets/bg.png"
import { usePowerups } from "./atoms"
import { executeWorldPayment } from "@/actions/payments"
import { trackEvent } from "@/components/posthog"

import TimeLeftVisualizer from "./TimeLeftVisualizer"

const DEFAULT_MINUTES = 5 // Default duration in minutes
const DEFAULT_RATIO = 75 // Default boost ratio in percentage
const GIFT_DURATION_IN_SECONDS = 15 // Gift duration in seconds

export default function DialogBooster() {
  const [isOpen, setIsOpen] = useState(false)
  const [boost, setBoost] = useState(DEFAULT_RATIO)
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)

  const { toast } = useToast()
  const { address, isConnected, signIn } = useWorldAuth()

  const {
    powerups: { booster },
    setState,
  } = usePowerups()

  useEffect(() => {
    // Reset state when dialog open changes
    setBoost(DEFAULT_RATIO)
    setMinutes(DEFAULT_MINUTES)
  }, [isOpen])

  const PRICE = calculateBoostPriceInWLD({
    boostPercent: boost,
    durationMinutes: minutes,
  })

  async function handleSetupBooster() {
    if (!address) return signIn()
    if (boost < 15) {
      return toast.error({
        title: "Invalid boost amount",
      })
    }

    const price = calculateBoostPriceInWLD({
      boostPercent: boost,
      durationMinutes: minutes,
    })

    const result = await executeWorldPayment({
      token: "WLD",
      amount: price,
      initiatorAddress: address,
      paymentDescription: `Setting up ${boost}% boost for ${minutes} minutes`,
    })

    if (result !== null) {
      toast.success({
        title: "Boost setup complete",
      })

      trackEvent("owned-powerup", {
        type: "booster",
        boostPercent: boost,
        durationMinutes: minutes,
      })

      setState((prev) => ({
        ...prev,
        booster: {
          durationInMinutes: minutes,
          ratioInPercentage: boost,
          isActive: true,
          // Give a gift of 15 seconds to the user
          timeSet: Date.now() + GIFT_DURATION_IN_SECONDS * 1000,
        },
      }))
    }
  }

  const DURATION_IN_SECONDS = booster.durationInMinutes * 60

  return (
    <ReusableDialog
      title="JUZ Booster"
      closeOnActionPressed={booster.isActive ? true : isConnected}
      footNote={
        booster.isActive
          ? undefined
          : minutes > 5
          ? `Nice. ${boost >= UNLOCK_BOOST_VALUE ? 10 : 5}% bonus unlocked`
          : "Boost for 10+ minutes to unlock a bonus"
      }
      closeText={
        booster.isActive
          ? "Okay, thanks!"
          : address
          ? `Confirm ${PRICE ? `${PRICE} WLD` : "setup"}`
          : "Connect Wallet"
      }
      onOpenChange={setIsOpen}
      onClosePressed={booster.isActive ? undefined : handleSetupBooster}
      trigger={
        <div
          role="button"
          tabIndex={-1}
          className="flex flex-col items-center justify-center"
        >
          <FaFireAlt
            className={cn(
              "text-sm scale-125",
              booster.isActive ? "text-juz-orange" : "text-white/80"
            )}
          />
          <span className="font-bold text-xs mt-0.5">
            {booster.isActive ? `${booster.ratioInPercentage}%` : "0"}
          </span>
        </div>
      }
    >
      <p>
        Increase the amount of JUZ to be earned in the trivia for{" "}
        {booster.isActive ? (
          "a limited time."
        ) : (
          <Fragment>
            the next <strong>{minutes} minutes</strong>.
          </Fragment>
        )}
      </p>

      {booster.isActive ? (
        <Fragment>
          <section
            style={{
              backgroundImage: `url(${asset_bg.src})`,
            }}
            className="border-3 w-full relative outline-none grid gap-1 pt-6 pb-4 place-items-center rounded-2xl bg-cover bg-center bg-black/90 border-black shadow-3d-lg"
          >
            <nav className="flex gap-3 items-center">
              <FaFireAlt className="text-4xl text-juz-green-lime" />
              <span className="font-bold text-6xl text-juz-green-lime">
                {booster.ratioInPercentage}%
              </span>
            </nav>
            <p className="text-white">Active boost</p>
          </section>

          <hr className="mt-5" />

          <TimeLeftVisualizer
            timeLeftInSeconds={
              booster.isActive
                ? booster.timeSet > Date.now()
                  ? // We are in "gift" period, so we can use the full duration
                    DURATION_IN_SECONDS + GIFT_DURATION_IN_SECONDS
                  : DURATION_IN_SECONDS -
                    Math.floor((Date.now() - booster.timeSet) / 1000)
                : 0
            }
          />
        </Fragment>
      ) : (
        <section>
          <h2 className="font-medium text-black mb-3">
            Boost amount ({" "}
            <strong className="text-juz-green !font-black">{boost}%</strong>{" "}
            <IoSparklesSharp
              className={cn(
                "shrink-0 text-juz-green inline-block -mt-2 mr-1",
                boost >= UNLOCK_BOOST_VALUE || "hidden"
              )}
            />
            )
          </h2>
          <Slider
            value={[boost]}
            onValueChange={([value]) => setBoost(value)}
            step={MIN_BOOST_PERCENT}
            max={MAX_BOOST_PERCENT}
          />

          <nav className="flex mt-3 font-semibold justify-between items-center text-xs">
            <button onClick={() => setBoost(0)}>0%</button>
            <button onClick={() => setBoost(MAX_BOOST_PERCENT)}>
              {MAX_BOOST_PERCENT}%
            </button>
          </nav>

          <hr className="mt-6" />

          <nav className="flex mt-3 items-center gap-4">
            <h2 className="font-medium text-black">Duration:</h2>
            <div className="text-sm w-full font-semibold items-center gap-2 grid grid-cols-3">
              {[5, 15, 30].map((timeRatio) => {
                const isActive = timeRatio === minutes

                return (
                  <button
                    onClick={() => setMinutes(timeRatio)}
                    key={`boost-time-${timeRatio}`}
                    className={cn(
                      "rounded-full outline-none text-center py-1 px-2",
                      isActive
                        ? "bg-black text-white"
                        : "bg-black/5 text-black/70"
                    )}
                  >
                    {timeRatio}min
                  </button>
                )
              })}
            </div>
          </nav>
        </section>
      )}
    </ReusableDialog>
  )
}
