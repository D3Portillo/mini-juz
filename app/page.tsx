"use client"

import Image from "next/image"
import { Fragment } from "react"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useWorldAuth } from "@radish-la/world-auth"
import { useAtomExplainerConfirmed } from "@/lib/atoms/user"

import WheelSpin from "@/components/WheelSpin"
import LemonButton from "@/components/LemonButton"
import HomeNavigation from "./HomeNavigation"

import asset_limoncito from "@/assets/limoncito.png"
import asset_skaterboi from "@/assets/skaterboi.png"
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

export default function PageHome() {
  const { toast } = useToast()

  const [isConfirmed, setIsConfirmed] = useAtomExplainerConfirmed()
  const { signIn, isConnected } = useWorldAuth({
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

  return (
    <section>
      <HomeNavigation />

      <nav className="px-5">
        <Tabs asChild defaultValue="active">
          <Fragment>
            <TabsList className="border-b border-b-black/5">
              <TabsTrigger
                className="border-b-2 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                value="active"
              >
                <button>Play</button>
              </TabsTrigger>

              <TabsTrigger
                className="border-b-2 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                value="everything"
              >
                <button>Leaderboard</button>
              </TabsTrigger>
            </TabsList>
          </Fragment>
        </Tabs>
      </nav>

      <div className="px-4 mt-12 mb-12 ">
        <div className="size-full overflow-clip grid place-items-center">
          <WheelSpin
            enableSpin={isConnected}
            onClick={() => {
              if (!isConnected) signIn()
            }}
            onItemSelected={(item) => {
              toast.success({
                title: `Selected topic: ${item}`,
              })
            }}
            size="min(calc(95vw - 2rem), 24rem)"
            items={["React", "Javascript", "Crypto"]}
          />
        </div>
        {true ? (
          <div className="border-3 bg-gradient-to-r from-juz-green-lime/0 via-juz-green-lime/0 to-juz-green-lime/70 relative overflow-hidden mt-14 shadow-3d-lg border-black p-4 !pr-0 rounded-2xl">
            <div className="pr-40">
              <h1 className="text-xl font-semibold">
                Can you answer <br />
                the trivia?
              </h1>

              <p className="mt-2 text-xs max-w-xs">
                Get a lucky spin every 24 hours. Make it to the top of the board
                and earn your reward as the smartest player!
              </p>

              <nav className="flex mt-4">
                <div className="bg-black py-2 px-4 rounded-lg text-white">
                  <div className="text-xs">Next spin:</div>
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
