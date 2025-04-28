import type { PropsWithChildren, ReactNode } from "react"

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

export default function ReusableDialog({
  children,
  trigger,
  closeText = "Got it",
  title,
}: PropsWithChildren<{
  title: string
  trigger?: JSX.Element | ReactNode
  closeText?: string
}>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">{title}</h2>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="mb-4 [&_strong]:font-medium [&_p:not(:last-child)]:mb-2">
            {children}
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogClose asChild>
            <Button>{closeText}</Button>
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
