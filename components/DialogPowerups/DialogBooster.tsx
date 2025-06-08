"use client"

import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { cn } from "@/lib/utils"
import { FaFireAlt } from "react-icons/fa"

import ReusableDialog from "@/components/ReusableDialog"
import { usePowerups } from "./atoms"

const DEFAULT_MINUTES = 15 // Default duration in minutes
const DEFAULT_RATIO = 75 // Default boost ratio in percentage

export default function DialogBooster() {
  const [isOpen, setIsOpen] = useState(false)
  const [boost, setBoost] = useState(DEFAULT_RATIO)
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)

  const { toast } = useToast()
  const { address, signIn } = useWorldAuth()

  const {
    powerups: { booster },
  } = usePowerups()

  useEffect(() => {
    // Reset state when dialog open changes
    setBoost(DEFAULT_RATIO)
    setMinutes(DEFAULT_MINUTES)
  }, [isOpen])

  async function handleSetupBooster() {
    if (!address) return signIn()
    if (boost <= 0) {
      return toast.error({
        title: "Invalid boost amount",
      })
    }

    toast.success({
      title: "Boost setup complete",
    })

    // TODO: Implement the actual booster setup logic here
  }

  return (
    <ReusableDialog
      title="JUZ Booster"
      closeText="Confirm setup"
      onOpenChange={setIsOpen}
      onClosePressed={address ? handleSetupBooster : undefined}
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
        Increase the amount of JUZ to be earned in the trivia for the next{" "}
        <strong>{minutes} minutes</strong>.
      </p>

      <section>
        <h2 className="font-medium text-black mb-3">
          Boost amount ({" "}
          <strong className="text-juz-green !font-black">{boost}%</strong> )
        </h2>
        <Slider
          value={[boost]}
          onValueChange={([value]) => setBoost(value)}
          step={15}
          max={150}
        />

        <nav className="flex mt-3 font-semibold justify-between items-center text-xs">
          <button onClick={() => setBoost(0)}>0%</button>
          <button onClick={() => setBoost(150)}>150%</button>
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
    </ReusableDialog>
  )
}
