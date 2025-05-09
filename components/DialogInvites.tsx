"use client"

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
import Link from "next/link"

export default function DialogInvites({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Manage invites</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">
          <p>You and your friend gets 10 JUZ each.</p>
          <p className="mt-2">
            <strong className="font-medium">NOTE:</strong> This feature is still
            under development. Join{" "}
            <Link
              className="underline underline-offset-4"
              target="_blank"
              href="https://t.me/+1m4vng7THvVmNmIx"
            >
              Telegram
            </Link>{" "}
            for updates.
          </p>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogClose asChild>
            <Button>Okie dokie</Button>
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
