import { Fragment, type PropsWithChildren, type ReactNode } from "react"

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
import { useTranslations } from "next-intl"

export type Props = PropsWithChildren<{
  title: string
  footNote?: string | JSX.Element
  enabled?: boolean
  trigger?: JSX.Element | ReactNode
  secondaryAction?: {
    text: string | JSX.Element
    onPressed: () => void
  }
  closeText?: string | JSX.Element
  onClosePressed?: () => void
  open?: boolean
  closeOnActionPressed?: boolean
  onOpenChange?: (open: boolean) => void
}>

export default function ReusableDialog({
  children,
  trigger,
  onClosePressed,
  closeText,
  footNote,
  title,
  closeOnActionPressed = true,
  enabled = true,
  secondaryAction,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations("global")
  if (!enabled) return trigger

  const ActionContainer = closeOnActionPressed ? AlertDialogClose : Fragment
  const CLOSE_TEXT = closeText || t("gotIt")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : null}
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
              <ActionContainer asChild>
                <Button
                  onClick={secondaryAction.onPressed}
                  className="text-black/70"
                  variant="secondary"
                >
                  {secondaryAction.text}
                </Button>
              </ActionContainer>
            ) : null}

            <ActionContainer asChild>
              <Button onClick={onClosePressed}>{CLOSE_TEXT}</Button>
            </ActionContainer>
          </AlertDialogFooter>
        </div>

        <p className="text-xs mt-3 -mb-3 text-center max-w-xs mx-auto text-black/50">
          {footNote}
        </p>
      </AlertDialogContent>
    </AlertDialog>
  )
}
