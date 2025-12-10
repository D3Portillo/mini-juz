"use client"

import copy from "clipboard-copy"
import useSWRImmutable from "swr/immutable"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@worldcoin/mini-apps-ui-kit-react"
import { useWorldAuth } from "@radish-la/world-auth"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

import { FaSync } from "react-icons/fa"
import { BiSolidCopy } from "react-icons/bi"

import { getJUZAppId } from "@/lib/deeplinks"
import { getInviteMetrics } from "@/actions/invites"
import {
  DEFAULT_INVITE_JUZ,
  JUZ_MULTIPLIER,
  VERIFIED_INVITE_JUZ,
} from "@/lib/constants"
import LemonButton from "./LemonButton"

const APP_ID = getJUZAppId()

export default function DialogInvites({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const t = useTranslations("DialogInvites")
  const { address } = useWorldAuth()

  const {
    data: invited = 0,
    mutate,
    isLoading: isFetching,
    isValidating,
  } = useSWRImmutable(address ? `invites.by.${address}` : null, async () => {
    if (!address) return 0
    return (await getInviteMetrics(address)).invited
  })

  const isLoading = isFetching || isValidating

  function revalidate() {
    mutate(invited)
  }

  function handleCopyLink() {
    if (!address) return
    copy(
      `https://worldcoin.org/mini-app?app_id=${APP_ID}&path=${encodeURIComponent(
        "?invite=" + address
      )}`
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
        </AlertDialogHeader>

        <div className="mb-5 -mt-4">
          <AlertDialogDescription className="mb-8">
            <p>
              {t.rich("description", {
                amount: () => (
                  <strong className="font-medium">
                    {DEFAULT_INVITE_JUZ * JUZ_MULTIPLIER} JUZ
                  </strong>
                ),
                verifiedAmount: () => (
                  <strong className="font-medium">
                    {VERIFIED_INVITE_JUZ * JUZ_MULTIPLIER} JUZ
                  </strong>
                ),
              })}
            </p>
          </AlertDialogDescription>

          <section className="p-4 relative rounded-2xl border-3 border-black shadow-3d">
            <h2 className="text-sm">{t("totalInvited")}</h2>
            <p className="text-2xl font-semibold">
              {isLoading ? "--" : invited}
            </p>

            <button
              onClick={revalidate}
              className={cn(
                isLoading && "animate-spin",
                "absolute text-lg p-2 top-3 right-3 fill-mode-forwards duration-1000"
              )}
            >
              <FaSync />
            </button>
          </section>
        </div>

        <AlertDialogFooter>
          <LemonButton
            onClick={handleCopyLink}
            className="bg-juz-green-lime rounded-full flex items-center !pr-4 justify-between h-14 text-base"
          >
            <span>{t("copyLink")}</span>
            <BiSolidCopy className="text-xl" />
          </LemonButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
