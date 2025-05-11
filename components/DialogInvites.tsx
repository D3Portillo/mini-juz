"use client"

import copy from "clipboard-copy"
import useSWR from "swr"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@worldcoin/mini-apps-ui-kit-react"
import { useWorldAuth } from "@radish-la/world-auth"

import { cn } from "@/lib/utils"

import { FaSync } from "react-icons/fa"
import { BiSolidCopy } from "react-icons/bi"

import { getTotalInteractions } from "@/actions/invites"
import LemonButton from "./LemonButton"

const APP_ID =
  process.env.NODE_ENV === "development"
    ? "app_4f327311775bc4da83fa474e36993b82"
    : "app_0ffb335831bc585f54dec2755d917d6a"

export default function DialogInvites({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const { user } = useWorldAuth()
  const address = user?.walletAddress
  const {
    data: invited = 0,
    mutate,
    isLoading: isFetching,
    isValidating,
  } = useSWR(address ? `invites.by.${address}` : null, async () => {
    if (!address) return 0
    return (await getTotalInteractions(address)).invited.length
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
          <h2 className="text-2xl font-semibold">Invite your friends</h2>
        </AlertDialogHeader>

        <div className="mb-5 -mt-4">
          <AlertDialogDescription className="mb-8">
            You and your friend get{" "}
            <strong className="font-medium">10 JUZ</strong> each when invite is
            accepted and claimed.
          </AlertDialogDescription>

          <section className="p-4 relative rounded-2xl border-3 border-black shadow-3d">
            <h2 className="text-sm">Total invited</h2>
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
            <span>Copy invite link</span>
            <BiSolidCopy className="text-xl" />
          </LemonButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
