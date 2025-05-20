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
  onClosePressed,
  closeText = "Got it",
  footNote,
  title,
  enabled = true,
  secondaryAction,
}: PropsWithChildren<{
  title: string
  footNote?: string
  enabled?: boolean
  trigger?: JSX.Element | ReactNode
  secondaryAction?: {
    text: string | JSX.Element
    onPressed: () => void
  }
  closeText?: string | JSX.Element
  onClosePressed?: () => void
}>) {
  if (!enabled) return trigger
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">{title}</h2>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="mb-4 leading-snug [&_strong]:font-medium [&_p:not(:last-child)]:mb-5">
            {children}
          </div>
        </AlertDialogDescription>

        <div className="w-full [&_>_div]:!grid-cols-1">
          <AlertDialogFooter>
            {secondaryAction?.text ? (
              <AlertDialogClose asChild>
                <Button
                  onClick={secondaryAction.onPressed}
                  className="text-black/70"
                  variant="secondary"
                >
                  {secondaryAction.text}
                </Button>
              </AlertDialogClose>
            ) : null}

            <AlertDialogClose asChild>
              <Button onClick={onClosePressed}>{closeText}</Button>
            </AlertDialogClose>
          </AlertDialogFooter>
        </div>

        <p className="text-xs mt-3 -mb-3 text-center max-w-xs mx-auto text-black/50">
          {footNote}
        </p>
      </AlertDialogContent>
    </AlertDialog>
  )
}
