"use client"

import { useLayoutEffect, useState } from "react"
import { claimFriendRewards, getTotalInteractions } from "@/actions/invites"
import { useAccountData } from "@/lib/atoms/user"
import { beautifyAddress } from "@/lib/utils"
import { useWorldAuth } from "@radish-la/world-auth"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"
import { MiniKit } from "@worldcoin/minikit-js"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { trackEvent } from "./posthog"
import { useTranslations } from "next-intl"

const MAX_GIFTS_PER_RECIPIENT = 10 // 100 JUZ

export default function InviteSentinel() {
  const t = useTranslations("InviteSentinel")
  const [isOpen, setIsOpen] = useState(false)
  const { address, signIn } = useWorldAuth()

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviting = searchParams.get("invite")

  useLayoutEffect(() => {
    if (inviting) setIsOpen(true)
  }, [inviting])

  const { data = null } = useAccountData(inviting)

  const closeModal = () => {
    setIsOpen(false)
    router.replace(location.pathname, { scroll: false })
  }

  async function handleClaimJUZ() {
    if (!address) return signIn()

    const nonce = (await getTotalInteractions(address)).totalInterations
    if (nonce > MAX_GIFTS_PER_RECIPIENT) {
      return toast.error({
        title: t("errors.tooManyGifts"),
      })
    }

    const message = JSON.stringify({
      sender: inviting,
      deadline: Math.round(Date.now() / 1_000 + 60 * 3),
      recipient: address,
      nonce,
    })
    const { finalPayload } = await MiniKit.commandsAsync.signMessage({
      message,
    })

    if (finalPayload.status === "success") {
      const result = await claimFriendRewards({
        message,
        signature: finalPayload.signature as any,
      })

      if (result.success) {
        closeModal()
        trackEvent("invite-accepted", {
          sender: inviting,
          recipient: address,
        })
        toast.success({
          title: t("success.claimed"),
        })
      } else {
        toast.error({
          title: `Error: ${result.error || t("errors.somethingWentWrong")}`,
        })
      }
    }
  }

  if (isOpen && inviting) {
    return (
      <main className="fixed bg-white/85 p-6 backdrop-blur-md inset-0 grid place-items-center z-[16]">
        <AlertDialog onClose={closeModal} open>
          <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
            <AlertDialogHeader aria-role="header">
              <h2 className="text-2xl font-semibold">{t("title")}</h2>
            </AlertDialogHeader>

            <AlertDialogDescription asChild>
              <div className="mb-4 [&_strong]:font-medium [&_p:not(:last-child)]:mb-2">
                {t.rich("inviteMessage", {
                  inviting: () => (
                    <div className="px-2 py-0.5 text-sm font-semibold inline-flex items-center gap-1 border rounded-full text-black border-juz-green-lime bg-juz-green-lime/15">
                      {data?.username || beautifyAddress(inviting, 5, "")}
                    </div>
                  ),
                })}
              </div>
            </AlertDialogDescription>

            <AlertDialogFooter>
              <Button onClick={handleClaimJUZ}>{t("claim")}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    )
  }

  return null
}
