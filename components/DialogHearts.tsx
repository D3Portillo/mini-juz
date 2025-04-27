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

import { executeWorldPyment } from "@/actions/payments"
import { usePlayerHearts } from "@/lib/atoms/user"
import { useWorldAuth } from "@radish-la/world-auth"

export default function DialogHearts({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const { toast } = useToast()
  const { user, signIn, isConnected } = useWorldAuth()
  const { hearts, refill } = usePlayerHearts()
  const isHeartFull = hearts >= 3

  async function handleRefill() {
    const initiatorAddress = user?.walletAddress
    if (!initiatorAddress) return signIn()

    const result = await executeWorldPyment({
      amount: 2.5, // 2.5 WLD
      initiatorAddress,
      paymentDescription: `Confirm to refill a total of ${
        3 - hearts
      } hearts in JUZ Mini App`,
    })

    if (result) {
      refill()
      return toast.success({
        title: "Hearts refilled",
        content: "Now you can play trivia games",
      })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Manage game hearts</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          {isHeartFull
            ? "Hearts are used to play trivia games. When you miss a question, you lose a heart."
            : "Hearts are refilled for free every 24 hours. You can also buy a refill with WLD."}
        </AlertDialogDescription>

        <section className="border-t pt-4 pb-10">
          <nav className="flex items-center gap-2 pr-1 justify-between">
            <strong className="font-semibold">Your hearts ({hearts})</strong>
            <HeartsVisualizer hearts={hearts} />
          </nav>
        </section>

        <AlertDialogFooter>
          {isHeartFull ? (
            <AlertDialogClose asChild>
              <Button>Okie dokie</Button>
            </AlertDialogClose>
          ) : (
            <Button onClick={handleRefill}>
              {isConnected ? "Refill now" : "Connect wallet"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
