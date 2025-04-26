"use client"

import HeartsVisualizer from "@/app/ModalGame/HeartsVisualizer"
import { usePlayerHearts } from "@/lib/atoms/user"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  Button,
} from "@worldcoin/mini-apps-ui-kit-react"

export default function DialogHearts({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const { hearts } = usePlayerHearts()
  const isHeartFull = hearts >= 3

  function handleRefill() {}

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
            <Button onClick={handleRefill}>Refill now</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
