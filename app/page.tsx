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

import { MANAGE_HEARTS_TRIGGER_ID } from "@/lib/constants"
import asset_limoncito from "@/assets/limoncito.png"

import HomeNavigation from "./HomeNavigation"
import ModalGame from "./ModalGame"

export default function PageHome() {
  const { toast } = useToast()
  const t = useTranslations("Home")
  const tglobal = useTranslations("global")

  const { hearts } = usePlayerHearts()
  const { gameTopics, shuffleTopics, isEmpty } = useUserTopics()
  const { user, signIn, isConnected } = useWorldAuth()

  const [showGame, setShowGame] = useState(null as { topic?: string } | null)
  const [isConfirmed, setIsConfirmed] = useAtomExplainerConfirmed()
  const address = user?.walletAddress

  function addPlayedGame() {
    if (address) incrementGamesPlayed(address)
  }

  async function handleConfirmExplainer() {
    if (!isConnected) {
      const account = await signIn()
      if (!account) {
        return toast.error({
          title: "Connect your wallet to continue",
        })
      }
    }

    setIsConfirmed(true)
  }

  function handleGameWon(wonJUZ: number) {
    // TODO: Add a cute modal window that celebrates the win
    if (address) {
      incrementGamesWon(address)
      incrPlayerJUZEarned(address, wonJUZ)
    }
    toast.success({
      title: `Yaaaas! ${wonJUZ} JUZ Earned`,
    })
  }

  return (
    <Tabs asChild defaultValue="play">
      <main>
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
              className="border-b-2 flex items-center gap-4 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
              value="play"
            >
              {t("play")}
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
            {hearts > 0 ? null : (
              <div className="mt-4 animate-in fade-in slide-in-from-top-5 flex items-center justify-between text-sm bg-black text-white px-4 py-2 rounded-full">
                <span>{t("errors.noHeartsLeft")}</span>
                <button
                  onClick={openHeartsDialog}
                  className="font-medium -mt-0.5 underline underline-offset-2"
                >
                  {t("refillNow")}
                </button>
              </div>
            )}

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

            {isConfirmed ? (
              <DailyRefill />
            ) : (
              <div className="border-3 mt-14 shadow-3d-lg border-black p-4 rounded-2xl">
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
