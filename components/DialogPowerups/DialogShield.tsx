"use client"

import { Fragment, useEffect, useState } from "react"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import ReusableDialog from "@/components/ReusableDialog"
import LemonButton from "@/components/LemonButton"

import { cn } from "@/lib/utils"
import { FaMinus, FaPlus } from "react-icons/fa"
import { FaShieldHeart } from "react-icons/fa6"

import { usePowerups } from "./atoms"
import { useWorldAuth } from "@radish-la/world-auth"
import { trackEvent } from "@/components/posthog"
import { executeWorldPayment } from "@/actions/payments"

const BONUS_DISCOUNT = 10 // 10% discount for buying 5 or more items
const BONUS_UNLOCK_AMOUNT = 5 // Amount of items to unlock the bonus
const PRICE_PER_ITEM_IN_WLD = 0.2 // 0.2 WLD per shield
const MAX_ITEMS = 25

export default function DialogShield() {
  const [isOpen, setIsOpen] = useState(false)

  const { toast } = useToast()
  const { address, isConnected, signIn } = useWorldAuth()

  const {
    powerups: { shields: ownedShields },
    setState,
  } = usePowerups()

  const [shields, setShields] = useState(ownedShields.amount)

  const isBuyingShields = shields > ownedShields.amount
  const isBonusActive = isBuyingShields && shields >= BONUS_UNLOCK_AMOUNT

  async function handleFinalizeSetup() {
    if (!address) return signIn()

    if (shields > MAX_ITEMS) {
      // User can hold at most MAX_ITEMS
      return toast.error({
        title: "Maximum balance reached",
      })
    }

    const BUYING_BROOMS = isBuyingShields ? shields - ownedShields.amount : 0
    if (BUYING_BROOMS <= 0) {
      // Just in case we reach this edge case
      return toast.error({
        title: "Nothing to setup",
      })
    }

    const BIG_TOTAL = isBonusActive
      ? (PRICE_PER_ITEM_IN_WLD * BUYING_BROOMS * (100 - BONUS_DISCOUNT)) / 100
      : PRICE_PER_ITEM_IN_WLD * BUYING_BROOMS

    const result = await executeWorldPayment({
      token: "WLD",
      amount: BIG_TOTAL,
      initiatorAddress: address,
      paymentDescription: `Setting up ${BIG_TOTAL} brooms`,
    })

    if (result !== null) {
      toast.success({
        title: "Shields setup successful",
      })

      trackEvent("owned-powerup", {
        type: "shield",
        amount: shields,
      })

      setState((prev) => ({
        ...prev,
        shields: {
          amount: shields,
        },
      }))
    }
  }

  useEffect(() => {
    // Sync owned items with swr and reset state when dialog opens
    setShields(ownedShields.amount)
  }, [ownedShields.amount, isOpen])

  return (
    <ReusableDialog
      title="The Shield"
      closeOnActionPressed={isBuyingShields ? isConnected : true}
      onClosePressed={isBuyingShields ? handleFinalizeSetup : undefined}
      onOpenChange={setIsOpen}
      footNote={
        isBuyingShields ? (
          <Fragment>
            Stack{" "}
            <button
              onClick={() => {
                if (shields < BONUS_UNLOCK_AMOUNT) {
                  setShields(BONUS_UNLOCK_AMOUNT)
                }
              }}
              className="underline font-medium underline-offset-2"
            >
              {BONUS_UNLOCK_AMOUNT} shields
            </button>{" "}
            to activate a bonus
          </Fragment>
        ) : (
          "Start setting up shields with WLD"
        )
      }
      closeText={
        isBuyingShields
          ? address
            ? "Confirm setup"
            : "Connect Wallet"
          : "Okay, thanks!"
      }
      trigger={
        <div
          role="button"
          tabIndex={-1}
          className="flex my-0.5 flex-col items-center justify-center"
        >
          <FaShieldHeart
            className={cn(
              ownedShields.amount ? "text-emerald-300" : "text-white/80",
              "text-sm scale-110"
            )}
          />
          <span className="font-bold text-xs mt-px">
            {ownedShields.amount ? "EQP" : "0"}
          </span>
        </div>
      }
    >
      <p>
        🛡️ The Shield activates when you’re on your last heart, giving you a
        second chance instead of ending the game.
      </p>

      <section className="px-0.5 -mb-4">
        <nav className="flex text-sm items-center gap-2">
          <h2 className="font-medium text-black">Available items</h2>
          {isBonusActive ? (
            <span className="text-juz-orange font-medium">
              ({BONUS_DISCOUNT}% OFF)
            </span>
          ) : null}
        </nav>

        <nav className="flex mt-2 text-black items-center gap-2">
          <LemonButton
            onClick={
              () => setShields((prev) => Math.max(prev - 1, 0))
              // Clamp the value to not go below 0
            }
            className="py-3"
          >
            <FaMinus />
          </LemonButton>

          <div className="text-2xl flex-grow text-center font-bold">
            {shields}
          </div>

          <LemonButton
            onClick={() => {
              const NEW_SHIELDS = shields + 1
              if (NEW_SHIELDS > 10) {
                return toast.error({
                  title: "Maximum balance reached",
                })
              }

              setShields(NEW_SHIELDS)
            }}
            className="py-3"
          >
            <FaPlus />
          </LemonButton>
        </nav>
      </section>
    </ReusableDialog>
  )
}
