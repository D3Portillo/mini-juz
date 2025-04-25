"use client"

import Link from "next/link"
import Image from "next/image"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { atomWithStorage } from "jotai/utils"
import { useAtom } from "jotai"
import { useWorldAuth } from "@radish-la/world-auth"

import { FaRegLemon } from "react-icons/fa"

import LemonIcon from "@/components/LemonIcon"
import WheelSpin from "@/components/WheelSpin"

import asset_limoncito from "@/assets/limoncito.png"

const atomIsConfirmed = atomWithStorage("isConfirmed", false)

export default function PageHome() {
  const { toast } = useToast()

  const [isConfirmed, setIsConfirmed] = useAtom(atomIsConfirmed)
  const { user, signIn, isConnected } = useWorldAuth({
    onWrongEnvironment() {
      toast.error({
        title: "Only available World App",
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
      <nav className="border-b h-[4.5rem] px-5 flex gap-4 bg-white top-0 sticky z-10">
        <Link href="/profile" className="flex items-center gap-2">
          <figure className="size-10 bg-black rounded-full overflow-hidden" />
          <div>
            <p className="font-semibold text-lg">
              {user?.username || "Profile"}
            </p>
            <p className="text-xs -mt-1">
              {isConnected ? "Manage profile" : "Connect wallet"}
            </p>
          </div>
        </Link>

        <div className="flex-grow" />

        <button className="flex items-center gap-2">
          <LemonIcon className="size-9">
            <FaRegLemon className="text-xl" />
          </LemonIcon>
          <span className="text-xl font-semibold">0 JUZ</span>
        </button>
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
        {isConfirmed ? null : (
          <div
            style={{
              filter: "drop-shadow(3px 3px 0 black)",
            }}
            className="border-[3px] mt-14 bg-white border-black p-4 rounded-2xl"
          >
            <nav className="flex justify-between gap-6 items-start">
              <div>
                <h1 className="text-xl font-semibold">How to play?</h1>

                <p className="mt-2 text-xs max-w-xs">
                  Spin the wheel. Get a daily random topic, answer a question
                  about it and earn JUZ!
                </p>

                <button
                  onClick={handleConfirmExplainer}
                  className="px-6 shadow-[3px_3px_black] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] mt-4 rounded-xl bg-gradient-to-bl font-semibold from-[#00FF60] to-juz-green-ish border-[3px] border-black py-2"
                >
                  LETS GO
                </button>
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
