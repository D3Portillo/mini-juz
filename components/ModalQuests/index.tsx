"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { atomWithStorage } from "jotai/utils"
import { useTranslations } from "next-intl"
import { useAtom } from "jotai"
import { isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  TopBar,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"
import { useToggleRouteOnActive } from "@/lib/window"
import { XMark } from "@/components/icons"

import { usePowerups } from "@/components/DialogPowerups/atoms"
import { MiniKit } from "@worldcoin/minikit-js"
import { useAudioMachine } from "@/lib/sounds"
import { shuffleArray } from "@/lib/arrays"
import { useGamesWonToday, usePlayerHearts } from "@/lib/atoms/user"
import { useWorldAuth } from "@radish-la/world-auth"
import { incrPlayerJUZEarned } from "@/actions/game"

import LemonButton from "@/components/LemonButton"
import BreakEffect from "@/components/BreakEffect"
import { REWARDS } from "./internals"

type QuestTime = number | null
const atomQuests = atomWithStorage("juz.mini.quests", {
  claimedTimestamps: {
    daily: null as QuestTime,
    questTrivia2Games: null as QuestTime,
  },
})

const TAPS_TO_BROKE_ITEM = 4

export default function ModalQuests({
  trigger,
}: {
  trigger: JSX.Element | null
}) {
  const t = useTranslations("ModalQuests")
  const TITLE = t("title")
  const [open, setOpen] = useState(false)
  const [quests, setQuests] = useAtom(atomQuests)
  const [brokeItemIndex, setBrokeItemIndex] = useState(0)
  const [isClaimInProgress, setIsClaimInProgress] = useState(false)
  const [isItemClaimable, setIsItemClaimable] = useState(false)

  const { setState } = usePowerups()
  const { setHearts } = usePlayerHearts()
  const { address, signIn } = useWorldAuth()

  const [showClaimingState, setShowClaimingState] = useState(
    {} as {
      quest?: keyof typeof quests.claimedTimestamps
      gamesWonSnapshot?: number
    }
  )

  const { playSound } = useAudioMachine(["slot", "win", "success"])
  const { gamesWon } = useGamesWonToday()
  const { toast } = useToast()

  const resetClaimingState = () => {
    setBrokeItemIndex(0)
    setShowClaimingState({})
    setIsClaimInProgress(false)
    setIsItemClaimable(false)
  }

  useEffect(() => resetClaimingState(), [open])

  useToggleRouteOnActive({
    slug: "quests",
    isActive: open,
    onRouterBack: (e) => {
      e.preventDefault()
      setOpen(false)
    },
  })

  const { claimedTimestamps } = quests

  const isDailyGiftClaimed =
    claimedTimestamps.daily === null
      ? false
      : isSameDay(new Date(claimedTimestamps.daily), new Date())

  const isTrivia2GamesClaimed =
    claimedTimestamps.questTrivia2Games === null
      ? false
      : isSameDay(new Date(claimedTimestamps.questTrivia2Games), new Date())

  function handleClaimFreeGift() {
    if (!address) return signIn()
    if (isDailyGiftClaimed) {
      return toast.error({
        title: t("freeDaily.error.claimed"),
      })
    }

    setShowClaimingState({
      quest: "daily",
    })
  }

  function handleClaimTrivia2Games() {
    if (gamesWon < 2) {
      return toast.error({
        title: t("triviaWinner2.error.locked"),
      })
    }

    if (!address) return signIn()

    if (isTrivia2GamesClaimed) {
      return toast.error({
        title: t("triviaWinner2.error.claimed"),
      })
    }

    setShowClaimingState({
      quest: "questTrivia2Games",
      gamesWonSnapshot: gamesWon, // Store snapshot to prevent race conditions
    })
  }

  const isAllQuestsClaimed = [isTrivia2GamesClaimed, isDailyGiftClaimed].every(
    Boolean
  )

  const questRewards = useMemo(
    () => shuffleArray(REWARDS),
    [showClaimingState.quest, open]
  )

  const currentReward = questRewards[brokeItemIndex]
  const prevReward = questRewards[brokeItemIndex - 1] || null
  const isClaimScreen = brokeItemIndex >= TAPS_TO_BROKE_ITEM

  function handleClaimOrBreakItem() {
    if (!address) return signIn()
    if (isClaimScreen) {
      // Prevent claiming until the item is allowed to be claimed (short reveal)
      if (!isItemClaimable) return

      // Prevent double claims
      if (isClaimInProgress) return
      setIsClaimInProgress(true)

      const { quest } = showClaimingState

      // We mark quest as claimed FIRST to prevent double claims on crash
      if (quest) {
        setQuests({
          claimedTimestamps: {
            ...claimedTimestamps,
            [quest]: Date.now(),
          },
        })
      }

      // Handle JUZ reward - check sign-in but don't interrupt flow
      if (currentReward.type === "juz") {
        // Distribute JUZ tokens
        incrPlayerJUZEarned(address, currentReward.amount)
      } else if (currentReward.type === "shield") {
        setState((prev) => ({
          ...prev,
          shields: {
            amount: prev.shields.amount + currentReward.amount,
          },
        }))
      } else if (currentReward.type === "broom") {
        setState((prev) => ({
          ...prev,
          broom: {
            amount: prev.broom.amount + currentReward.amount,
          },
        }))
      } else if (currentReward.type === "heart") {
        setHearts((current) => current + currentReward.amount)
      }

      toast.success({
        title: t("success.claimedMessage"),
      })
      playSound("success")

      // Reset claiming state
      return resetClaimingState()
    }
    // Increment broken item index to show next reward
    setBrokeItemIndex((i) => i + 1)
    playSound("slot")

    // Send haptic feedback
    MiniKit.commands.sendHapticFeedback({
      style: "medium",
      hapticsType: "impact",
    })
  }

  useEffect(() => {
    if (isClaimScreen && currentReward) {
      // Play win sound when reaching the claim screen
      playSound("win")
    }
  }, [isClaimScreen])

  useEffect(() => {
    setIsItemClaimable(false)

    if (isClaimScreen) {
      const timer = setTimeout(() => setIsItemClaimable(true), 1_000)
      return () => clearTimeout(timer)
    }
  }, [isClaimScreen])

  return (
    <Drawer open={open} onOpenChange={setOpen} height="full">
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}

      <DrawerContent>
        <VisuallyHidden>
          <DrawerTitle>{TITLE}</DrawerTitle>
        </VisuallyHidden>

        {showClaimingState.quest ? (
          <Fragment>
            <div
              tabIndex={-1}
              role="button"
              onClick={handleClaimOrBreakItem}
              className="flex flex-col gap-6 items-center justify-center p-6 w-full h-full"
            >
              <div className="flex-grow" />

              <BreakEffect key={`item-effect-${brokeItemIndex}`} showEffect>
                {prevReward ? (
                  <nav className="flex items-center">
                    <div className="text-7xl">{prevReward.emoji}</div>
                    <span className="text-3xl font-bold">
                      x{prevReward.amount}
                    </span>
                  </nav>
                ) : (
                  <Fragment />
                )}
              </BreakEffect>

              <nav className="flex items-center">
                <div className="text-7xl animate-zelda-pulse">
                  {currentReward.emoji}
                </div>
                <span className="text-3xl font-bold">
                  x{currentReward.amount}
                </span>
              </nav>

              <div className="flex-grow" />

              <div className="h-28 mb-2 w-full flex flex-col items-center justify-end">
                <nav className="flex items-center gap-2">
                  {Array.from({ length: TAPS_TO_BROKE_ITEM }).map(
                    (_, index, arr) => {
                      const isBroken = index < brokeItemIndex
                      const hideAll = brokeItemIndex >= arr.length
                      if (hideAll) return null

                      return (
                        <div
                          key={`tap-item-${index}`}
                          className={cn(
                            isBroken ? "bg-white" : "bg-juz-orange",
                            "size-4 rounded-full border-2 border-black"
                          )}
                        />
                      )
                    }
                  )}
                </nav>

                <p className="text-sm mt-4 mx-auto text-center">
                  {isClaimScreen
                    ? t("tapScreen.tapToClaim")
                    : t("tapScreen.tapToContinue")}
                </p>
              </div>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <TopBar
              title={TITLE}
              startAdornment={
                <DrawerClose asChild>
                  <Button variant="tertiary" size="icon">
                    <XMark />
                  </Button>
                </DrawerClose>
              }
            />

            <div className="no-scrollbar flex flex-col gap-6 py-4 px-6 w-full overflow-auto grow">
              <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d-lg">
                <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
                  <div className="text-6xl">🎁</div>
                </figure>

                <div className="w-full">
                  <h2 className="font-medium text-xl">Free Daily Gift</h2>

                  <p
                    dangerouslySetInnerHTML={{
                      __html: t.raw("freeDaily.explainer"),
                    }}
                    className="text-sm opacity-70"
                  />

                  <LemonButton
                    onClick={handleClaimFreeGift}
                    className="py-3 whitespace-nowrap rounded-full text-base w-full mt-5"
                  >
                    {isDailyGiftClaimed
                      ? t("states.claimed")
                      : t("states.active")}
                  </LemonButton>
                </div>
              </section>

              <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d-lg">
                <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
                  <div className="text-6xl">🏆</div>
                </figure>

                <div className="w-full">
                  <h2 className="font-medium text-xl">Trivia Winner</h2>

                  <p className="text-sm opacity-70">
                    {t.rich("triviaWinner2.explainer", {
                      gamesWon: showClaimingState.gamesWonSnapshot ?? gamesWon,
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>

                  <LemonButton
                    onClick={handleClaimTrivia2Games}
                    className="py-3 whitespace-nowrap rounded-full text-base w-full mt-5"
                  >
                    {isTrivia2GamesClaimed
                      ? t("states.claimed")
                      : gamesWon >= 2
                      ? t("states.active")
                      : t("states.locked")}
                  </LemonButton>
                </div>
              </section>

              {isAllQuestsClaimed && (
                <p
                  dangerouslySetInnerHTML={{
                    __html: t.raw("allClaimed"),
                  }}
                  className="text-sm mt-16 mx-auto text-center"
                />
              )}
            </div>
          </Fragment>
        )}
      </DrawerContent>
    </Drawer>
  )
}
