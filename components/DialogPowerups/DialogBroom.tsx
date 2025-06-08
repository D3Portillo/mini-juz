"use client"

import { Fragment, useEffect, useState } from "react"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import ReusableDialog from "@/components/ReusableDialog"
import LemonButton from "@/components/LemonButton"

import { cn } from "@/lib/utils"
import { FaMinus, FaPlus } from "react-icons/fa"
import { GiBroom } from "react-icons/gi"

import { usePowerups } from "./atoms"
import { useWorldAuth } from "@radish-la/world-auth"
import { executeWorldPayment } from "@/actions/payments"

const BONUS_DISCOUNT = 10 // 10% discount for buying 5 or more brooms
const BONUS_UNLOCK_AMOUNT = 5 // Amount of brooms to unlock the bonus
const PRICE_PER_ITEM_IN_WLD = 0.1 // 0.1 WLD per broom
const MAX_ITEMS = 25

export default function DialogBroom() {
  const [isOpen, setIsOpen] = useState(false)

  const { toast } = useToast()
  const { address, isConnected, signIn } = useWorldAuth()

  const {
    powerups: { broom: ownedBrooms },
  } = usePowerups()

  const [brooms, setBrooms] = useState(ownedBrooms.amount)

  const isBuyingBrooms = brooms > ownedBrooms.amount
  const isBonusActive = isBuyingBrooms && brooms >= BONUS_UNLOCK_AMOUNT

  async function handleFinalizeSetup() {
    if (!address) return signIn()

    const BUYING_BROOMS = isBuyingBrooms ? brooms - ownedBrooms.amount : 0

    if (brooms > MAX_ITEMS) {
      // User can hold at most MAX_ITEMS
      return toast.error({
        title: "Maximum balance reached",
      })
    }

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
      // TODO: Update the ownedBrooms state in SWR
      toast.success({
        title: "Brooms setup successful",
      })
    }
  }

  useEffect(() => {
    // Sync owned items with swr and reset brooms when dialog opens
    setBrooms(ownedBrooms.amount)
  }, [ownedBrooms.amount, isOpen])

  return (
    <ReusableDialog
      title="The Broom"
      closeOnActionPressed={isBuyingBrooms ? isConnected : true}
      onClosePressed={isBuyingBrooms ? handleFinalizeSetup : undefined}
      onOpenChange={setIsOpen}
      footNote={
        isBuyingBrooms ? (
          <Fragment>
            Stack{" "}
            <button
              onClick={() => {
                if (brooms < BONUS_UNLOCK_AMOUNT) setBrooms(BONUS_UNLOCK_AMOUNT)
              }}
              className="underline font-medium underline-offset-2"
            >
              {BONUS_UNLOCK_AMOUNT} brooms
            </button>{" "}
            to activate a bonus
          </Fragment>
        ) : (
          "Start setting up brooms with WLD"
        )
      }
      closeText={
        isBuyingBrooms
          ? address
            ? "Confirm setup"
            : "Connect Wallet"
          : "Okay, thanks!"
      }
      trigger={
        <div
          role="button"
          tabIndex={-1}
          className="flex flex-col items-center justify-center"
        >
          <GiBroom
            className={cn(
              "text-xl -translate-x-px scale-105",
              ownedBrooms.amount ? "text-yellow-200" : "text-white/80"
            )}
          />
          <span className="font-bold text-xs">{ownedBrooms.amount}</span>
        </div>
      }
    >
      <p>
        🧹 The Broom is a powerful tool that clears{" "}
        <strong>1 wrong option</strong> from the list in trivia game, making it
        easier to spot the correct one.
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
              () => setBrooms((prev) => Math.max(prev - 1, 0))
              // Clamp the value to not go below 0
            }
            className="py-3"
          >
            <FaMinus />
          </LemonButton>

          <div className="text-2xl flex-grow text-center font-bold">
            {brooms}
          </div>

          <LemonButton
            onClick={() => {
              const NEW_BROOMS = brooms + 1
              if (NEW_BROOMS > MAX_ITEMS) {
                return toast.error({
                  title: "Maximum balance reached",
                })
              }

              setBrooms(NEW_BROOMS)
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
