"use client"

import Image from "next/image"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import { useTranslations } from "next-intl"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useWorldAuth } from "@radish-la/world-auth"
import { useAtomExplainerConfirmed, usePlayerHearts } from "@/lib/atoms/user"
import { useUserTopics } from "@/lib/atoms/topics"
import { openHeartsDialog } from "@/lib/utils"
import { trackEvent } from "@/components/posthog"

import { useAccountBalances } from "@/lib/atoms/balances"
import { useHardwareType } from "@/lib/window"

import {
  incrementGamesPlayed,
  incrementGamesWon,
  incrPlayerJUZEarned,
} from "@/actions/game"

import { FaHeart, FaHeartBroken } from "react-icons/fa"

import WheelSpin from "@/components/WheelSpin"
import LemonButton from "@/components/LemonButton"
import LeaderBoard from "@/components/LeaderBoard"
import DialogHearts from "@/components/DialogHearts"
import DailyRefill from "@/components/banners/DailyRefill"

import { JUZDistributionModal } from "@/app/rewards/JuzDistributionModal"
import { JUZ_MULTIPLIER, MANAGE_HEARTS_TRIGGER_ID } from "@/lib/constants"

import HomeNavigation from "./HomeNavigation"
import ModalGame from "./ModalGame"

import asset_limoncito from "@/assets/limoncito.png"
import BannerRewardPools from "@/components/BannerRewardPools"
import ReusableDialog from "@/components/ReusableDialog"
import DialogPowerups from "@/components/DialogPowerups"

export default function PageHome() {
  const { toast } = useToast()
  const t = useTranslations("Home")
  const tglobal = useTranslations("global")

  const { hearts } = usePlayerHearts()
  const { gameTopics, shuffleTopics, isEmpty } = useUserTopics()
  const { address, signIn, isConnected } = useWorldAuth()
  const { JUZPoints } = useAccountBalances()

  const [showGame, setShowGame] = useState(null as { topic?: string } | null)
  const { isIOS } = useHardwareType()
  const [isConfirmed, setIsConfirmed] = useAtomExplainerConfirmed()

  function addPlayedGame() {
    if (address) incrementGamesPlayed(address)
  }

  async function handleConfirmExplainer() {
    if (!isConnected) {
      const account = await signIn()
      if (!account) {
        return toast.error({
          title: t("errors.connect"),
        })
      }
    }

    setIsConfirmed(true)
  }

  function handleGameWon(wonJUZ: number) {
    // TODO: Add a cute modal window that celebrates the win

    const BALANCE = wonJUZ * JUZ_MULTIPLIER
    if (address) {
      incrementGamesWon(address)
      incrPlayerJUZEarned(address, BALANCE)
    }
    toast.success({
      title: t("success.juzEarned", { amount: BALANCE }),
    })
  }

  return (
    <Tabs asChild defaultValue="play">
      <main className="bg-gradient-to-br min-h-screen from-juz-orange/0 via-juz-orange/0 to-juz-orange/7">
        <DialogPowerups />
        <ModalGame
          topic={showGame?.topic}
          open={Boolean(showGame?.topic)}
          onGameWon={handleGameWon}
          onOpenChange={(isOpen) => {
            setShowGame(null)
            if (!isConfirmed && !isOpen) {
              // Set to confirmed when finalizing the first game
              setIsConfirmed(true)
            }
          }}
        />
        <HomeNavigation />

        <nav className="px-5">
          <TabsList className="border-b flex items-center border-b-black/3">
            <TabsTrigger
              id="play-tab"
              className="border-b-2 flex items-center gap-3 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
              value="play"
            >
              <span>{t("play")}</span>
              {JUZ_MULTIPLIER > 1 ? (
                <ReusableDialog
                  title="The Lime Boost"
                  trigger={
                    <button className="bg-juz-green-lime pb-px px-2.5 rounded-full">
                      <strong className="font-semibold text-sm">
                        {JUZ_MULTIPLIER}x
                      </strong>
                    </button>
                  }
                >
                  <p>
                    {t.rich("limeBoostTemplate", {
                      multiplier: (timesInGivenLanguage) => (
                        <strong className="whitespace-nowrap">
                          {JUZ_MULTIPLIER} {timesInGivenLanguage}
                        </strong>
                      ),
                    })}
                  </p>
                </ReusableDialog>
              ) : null}
            </TabsTrigger>

            <TabsTrigger
              className="border-b-2 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
              value="leaderboard"
            >
              Leaderboard
            </TabsTrigger>

            <div className="flex-grow" />

            <DialogHearts
              trigger={
                <button
                  id={MANAGE_HEARTS_TRIGGER_ID}
                  className="flex text-xl items-center gap-1"
                >
                  {hearts > 0 ? (
                    <FaHeart className="text-juz-green animate-zelda-pulse" />
                  ) : (
                    <FaHeartBroken />
                  )}
                  <strong className="font-semibold text-lg">x{hearts}</strong>
                </button>
              }
            />
          </TabsList>
        </nav>

        <TabsContent asChild value="play">
          <div className="px-4 mb-12">
            {JUZPoints.isOnchainSynced ? (
              hearts > 0 ? null : (
                <HomeAlert
                  content={t("errors.noHeartsLeft")}
                  actionText={t("refillNow")}
                  onClick={openHeartsDialog}
                />
              )
            ) : (JUZPoints.formatted as any) >
              // We try to hide a little more the JUZ distribution
              // for iOS users, since they are not able to transact yet
              (isIOS ? 9 : 2) ? (
              <JUZDistributionModal>
                <HomeAlert
                  content={t("success.juzAvailable")}
                  actionText={t("claimNow")}
                />
              </JUZDistributionModal>
            ) : null}

            <div className="size-full rounded-full mt-12 overflow-clip grid place-items-center">
              <WheelSpin
                enableSpin={isConnected && hearts > 0 && !isEmpty}
                onClick={() => {
                  if (!isConnected) return signIn()
                  if (hearts <= 0) openHeartsDialog()
                }}
                onItemSelected={(topic) => {
                  trackEvent("topic-selected", {
                    topic,
                    address: address || "NO_ADDRESS",
                  })
                  setShowGame({ topic })
                  addPlayedGame()
                  setTimeout(shuffleTopics, 250)
                }}
                size="min(calc(95vw - 2rem), 24rem)"
                items={isEmpty ? ["👋", "😍", "😎"] : gameTopics}
              />
            </div>

            <BannerRewardPools />

            <div className="my-8 w-full border-black border-t-3 rounded-full overflow-hidden" />

            {isConfirmed ? (
              <DailyRefill />
            ) : (
              <div className="border-3 shadow-3d-lg border-black p-4 rounded-2xl">
                <nav className="flex justify-between gap-6 items-start">
                  <div>
                    <h1 className="text-xl font-semibold">
                      {t("howToPlay.title")}
                    </h1>

                    <p className="mt-2 text-xs max-w-xs">
                      {t("howToPlay.content")}
                    </p>

                    <LemonButton
                      className="mt-4"
                      onClick={handleConfirmExplainer}
                    >
                      {isConnected ? tglobal("gotIt") : tglobal("letsGo")}
                    </LemonButton>
                  </div>

                  <figure className="max-w-28">
                    <Image src={asset_limoncito} alt="" placeholder="blur" />
                  </figure>
                </nav>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent asChild value="leaderboard">
          <LeaderBoard />
        </TabsContent>
      </main>
    </Tabs>
  )
}

function HomeAlert({
  content,
  actionText,
  onClick,
}: {
  content: string
  actionText: string
  onClick?: () => void
}) {
  return (
    <div className="mt-4 animate-in fade-in slide-in-from-top-5 flex items-center justify-between text-sm bg-black text-white px-4 py-2 rounded-full">
      <span>{content}</span>
      <button
        onClick={onClick}
        className="font-medium -mt-0.5 underline underline-offset-2"
      >
        {actionText}
      </button>
    </div>
  )
}
