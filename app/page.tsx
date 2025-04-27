"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useWorldAuth } from "@radish-la/world-auth"
import { useAtomExplainerConfirmed, usePlayerHearts } from "@/lib/atoms/user"
import { useUserTopics } from "@/lib/atoms/topics"

import { FaHeart, FaHeartBroken } from "react-icons/fa"

import WheelSpin from "@/components/WheelSpin"
import LemonButton from "@/components/LemonButton"
import LeaderBoard from "@/components/LeaderBoard"
import DialogHearts from "@/components/DialogHearts"
import DailyRefill from "@/components/banners/DailyRefill"

import asset_limoncito from "@/assets/limoncito.png"

import HomeNavigation from "./HomeNavigation"
import ModalGame from "./ModalGame"

const MANAGE_HEARTS_TRIGGER_ID = "manage-hearts"

// TODO: Add sentinel to watch for "pending games"
// so we avoid "cheaters" that close app or "force" to exit the trivia window
export default function PageHome() {
  const { toast } = useToast()

  const { hearts } = usePlayerHearts()
  const { gameTopics, shuffleTopics, isEmpty } = useUserTopics()
  const { signIn, isMiniApp, isConnected, reklesslySetUser } = useWorldAuth()

  const [showGame, setShowGame] = useState(null as { topic?: string } | null)
  const [isConfirmed, setIsConfirmed] = useAtomExplainerConfirmed()

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

  function openHeartsDialog() {
    document.getElementById(MANAGE_HEARTS_TRIGGER_ID)?.click()
  }

  useEffect(() => {
    if (isMiniApp) return
    if (process.env.NODE_ENV === "development") {
      // Dev user in non-world app
      reklesslySetUser({
        username: "Limoncito",
        walletAddress: "0xB6594a5EdDA3E0D910Fb57db7a86350A9821327a",
      })
    }
  }, [isMiniApp])

  return (
    <Tabs asChild defaultValue="play">
      <section>
        <ModalGame
          topic={showGame?.topic}
          open={Boolean(showGame?.topic)}
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
          <TabsList className="border-b flex items-center border-b-black/5">
            <TabsTrigger
              className="border-b-2 flex items-center gap-4 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
              value="play"
            >
              Play
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
                <span>😢 No hearts left to play</span>
                <button
                  onClick={openHeartsDialog}
                  className="font-medium -mt-0.5 underline underline-offset-2"
                >
                  Refill now
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
                  setShowGame({ topic })
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
                    <h1 className="text-xl font-semibold">How to play?</h1>

                    <p className="mt-2 text-xs max-w-xs">
                      Spin the wheel. Get daily random topics, play a trivia
                      mini-game and earn JUZ!
                    </p>

                    <LemonButton
                      className="mt-4"
                      onClick={handleConfirmExplainer}
                    >
                      {isConnected ? "GOT IT" : "LETS GO"}
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
      </section>
    </Tabs>
  )
}
