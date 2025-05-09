"use client"

import HeartsVisualizer from "@/app/ModalGame/HeartsVisualizer"

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  Button,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"

import { useTranslations } from "next-intl"
import { executeWorldPayment } from "@/actions/payments"
import { usePlayerHearts } from "@/lib/atoms/user"
import { useWorldAuth } from "@radish-la/world-auth"
import { trackEvent } from "./posthog"

export default function DialogHearts({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  // TODO: Add a nice animation of hearts being "refilled" when user gets
  // a free or paid refill to make feel more like a game-experience

  const t = useTranslations("DialogHearts")
  const tglobal = useTranslations("global")

  const { toast } = useToast()
  const { user, signIn, isConnected } = useWorldAuth()
  const { hearts, refill, canBeRefilled: canBeFreeRefilled } = usePlayerHearts()
  const isHeartFull = hearts >= 3

  async function handlePaidRefill() {
    const initiatorAddress = user?.walletAddress
    if (!initiatorAddress) return signIn()

    const result = await executeWorldPayment({
      amount: 0.75, // 0.75 WLD
      initiatorAddress,
      paymentDescription: t("buyRefillMessage", {
        hearts: 3 - hearts,
      }),
    })

    if (result) {
      trackEvent("heart-refilled", {
        type: "paid",
        address: initiatorAddress,
      })

      refill({ isForcedRefill: true })
      toast.success({
        title: t("success.refilled"),
      })
    }
  }

  function handleFreeRefill() {
    refill()
    trackEvent("heart-refilled", {
      type: "free",
    })
    toast.success({
      title: t("success.refilled"),
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          {isHeartFull ? t("explainers.full") : t("explainers.regular")}
        </AlertDialogDescription>

        <section className="border-t pt-4 pb-10">
          <nav className="flex items-center gap-2 pr-1 justify-between">
            <strong className="font-semibold">
              {t("heartCount", {
                hearts,
              })}
            </strong>
            <HeartsVisualizer hearts={hearts} />
          </nav>
        </section>

        <AlertDialogFooter>
          {isHeartFull ? (
            <AlertDialogClose asChild>
              <Button>{tglobal("gotIt")}</Button>
            </AlertDialogClose>
          ) : (
            <Button
              onClick={canBeFreeRefilled ? handleFreeRefill : handlePaidRefill}
            >
              {isConnected
                ? canBeFreeRefilled
                  ? t("claimFree")
                  : t("refillNow")
                : tglobal("connectWallet")}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
