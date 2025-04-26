"use client"

import Image from "next/image"
import { Fragment, useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useWorldAuth } from "@radish-la/world-auth"
import { useAtomExplainerConfirmed, usePlayerHearts } from "@/lib/atoms/user"
import { useUserTopics } from "@/lib/atoms/topics"

import { FaHeart, FaHeartBroken } from "react-icons/fa"

import WheelSpin from "@/components/WheelSpin"
import LemonButton from "@/components/LemonButton"
import HomeNavigation from "./HomeNavigation"

import asset_limoncito from "@/assets/limoncito.png"
import asset_skaterboi from "@/assets/skaterboi.png"
import ModalGame from "./ModalGame"

export default function PageHome() {
  const { toast } = useToast()

  const [hearts] = usePlayerHearts()
  const { gameTopics, shuffleTopics } = useUserTopics()

  const [showGame, setShowGame] = useState(null as { topic?: string } | null)
  const [isConfirmed, setIsConfirmed] = useAtomExplainerConfirmed()
  const { signIn, isMiniApp, isConnected, reklesslySetUser } = useWorldAuth({
    onWrongEnvironment() {
      toast.error({
        title: "Only available in World App",
      })
    },
  })

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
    <section>
      <ModalGame
        topic={showGame?.topic}
        open={Boolean(showGame?.topic)}
        onOpenChange={() => {
          setShowGame(null)
        }}
      />
      <HomeNavigation />

      <nav className="px-5">
        <Tabs asChild defaultValue="play">
          <Fragment>
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

              <button className="flex text-xl items-center gap-1">
                {hearts > 0 ? (
                  <FaHeart className="text-juz-green animate-zelda-pulse" />
                ) : (
                  <FaHeartBroken />
                )}
                <strong className="font-semibold text-lg">x{hearts}</strong>
              </button>
            </TabsList>
          </Fragment>
        </Tabs>

        {hearts > 0 ? null : (
          <div className="mt-4 animate-in fade-in slide-in-from-top-5 flex items-center justify-between text-sm border border-juz-red/15 bg-gradient-to-bl px-4 py-2 rounded-full from-juz-red/15 to-red-100">
            <span>No hearts left to play</span>
            <button className="underline font-medium underline-offset-2">
              Refill now
            </button>
          </div>
        )}
      </nav>

      <div className="px-4 mt-12 mb-12 ">
        <div className="size-full overflow-clip grid place-items-center">
          <WheelSpin
            enableSpin={isConnected && hearts > 0}
            onClick={() => {
              if (!isConnected) return signIn()
              if (hearts <= 0) {
                return toast.error({
                  title: "No hearts left to play",
                })
              }
            }}
            onItemSelected={(topic) => {
              setShowGame({ topic })
              setTimeout(shuffleTopics, 250)
            }}
            size="min(calc(95vw - 2rem), 24rem)"
            items={gameTopics}
          />
        </div>

        {isConfirmed ? (
          <div className="border-3 bg-gradient-to-r from-juz-green-lime/0 via-juz-green-lime/0 to-juz-green-lime/70 relative overflow-hidden mt-14 shadow-3d-lg border-black p-4 !pr-0 rounded-2xl">
            <div className="pr-36">
              <h1 className="text-xl font-semibold">
                Can you answer <br />
                the trivia?
              </h1>

              <p className="mt-2 text-xs max-w-xs">
                Get a full-hearts refill every 24 hours. Make it to the top and
                earn rewards for being the smartest player!
              </p>

              <nav className="flex mt-4">
                <div className="bg-black py-2 px-4 rounded-lg text-white">
                  <div className="text-xs">Next refill:</div>
                  <div className="font-semibold -mt-0.5">12:34 H</div>
                </div>
              </nav>
            </div>

            <figure className="w-40 absolute -right-4 -top-8 -bottom-8">
              <Image
                fill
                className="object-cover"
                src={asset_skaterboi}
                alt=""
                placeholder="blur"
              />
            </figure>
          </div>
        ) : (
          <div className="border-3 mt-14 shadow-3d-lg border-black p-4 rounded-2xl">
            <nav className="flex justify-between gap-6 items-start">
              <div>
                <h1 className="text-xl font-semibold">How to play?</h1>

                <p className="mt-2 text-xs max-w-xs">
                  Spin the wheel. Get a daily random topic, answer a trivia
                  about that topic and earn JUZ!
                </p>

                <LemonButton onClick={handleConfirmExplainer}>
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
    </section>
  )
}
