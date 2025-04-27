"use client"

import { Fragment } from "react"
import Image from "next/image"
import { TopBar } from "@worldcoin/mini-apps-ui-kit-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { useRouter } from "next/navigation"

import { FaArrowRight, FaRegLemon } from "react-icons/fa"

import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"

import asset_running from "@/assets/running.png"
import asset_frog from "@/assets/frog.png"
import LemonIcon from "@/components/LemonIcon"

export default function PageRewards() {
  const router = useRouter()

  return (
    <section className="min-h-screen">
      <nav className="border-b border-black/15 bg-white top-0 sticky z-10">
        <TopBar
          className="py-0 gap-5 px-5"
          startAdornment={<RouteBackButton />}
          title="Boost your rewards"
        />
      </nav>

      <Tabs asChild defaultValue="lock">
        <Fragment>
          <div className="bg-gradient-to-b from-juz-orange/7 to-juz-orange/0">
            <nav className="px-5 pb-16">
              <TabsList className="border-b flex items-center border-b-black/5">
                <TabsTrigger
                  className="border-b-2 flex items-center gap-4 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="lock"
                >
                  JUZ Locking
                </TabsTrigger>

                <TabsTrigger
                  className="border-b-2 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="drops"
                >
                  Drops 🚀
                </TabsTrigger>
              </TabsList>
            </nav>
          </div>

          <div className="-mt-8 px-5">
            <TabsContent asChild value="lock">
              <div>
                <h2 className="font-medium text-xl">JUZ Locking</h2>

                <div className="flex justify-between items-start gap-4">
                  <div className="mt-2 text-sm max-w-xs">
                    <p>
                      Earn veJUZ by locking JUZ for a period of time. In the
                      future veJUZ can be used for goverance, access reward
                      pools or airdrops
                    </p>

                    <LemonButton
                      onClick={() => router.push("/market")}
                      className="flex py-3 text-base mt-4 items-center gap-4"
                    >
                      <span>Get JUZ</span>
                      <FaArrowRight className="text-lg" />
                    </LemonButton>
                  </div>

                  <figure className="w-40 -mt-2 shrink-0">
                    <Image placeholder="blur" alt="" src={asset_running} />
                  </figure>
                </div>

                <div className="mt-8 mb-12 border-3 border-black shadow-3d rounded-2xl p-6">
                  <h2 className="font-semibold text-xl">
                    Lock JUZ. Get veJUZ 🍋
                  </h2>

                  <fieldset className="mt-4">
                    <p className="font-semibold">Lock amount</p>

                    <div className="flex mt-1 gap-2 p-3 bg-juz-green/10 rounded-xl items-center border-2 border-black shadow-3d">
                      <LemonIcon className="size-7">
                        <FaRegLemon />
                      </LemonIcon>

                      <span className="font-medium flex-grow">0 JUZ</span>

                      <button className="font-semibold">MAX</button>
                    </div>

                    <div className="mt-2 text-sm font-semibold items-center gap-2 grid grid-cols-5">
                      <button className="rounded-full text-center bg-black text-white py-1 px-2">
                        0%
                      </button>
                      <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
                        25%
                      </button>
                      <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
                        50%
                      </button>
                      <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
                        75%
                      </button>
                      <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
                        100%
                      </button>
                    </div>
                  </fieldset>

                  <fieldset className="mt-8">
                    <p className="font-semibold">Lock duration</p>

                    <div className="flex mt-1 gap-2 p-3 bg-juz-green/10 rounded-xl items-center border-2 border-black shadow-3d">
                      <LemonIcon className="size-7">⏰</LemonIcon>

                      <span className="font-medium flex-grow">0 Weeks</span>

                      <button className="font-semibold">MAX</button>
                    </div>

                    <div className="mt-2 text-sm font-semibold items-center gap-2 grid grid-cols-5">
                      <button className="rounded-full text-center bg-black text-white py-1 px-2">
                        2W
                      </button>
                      <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
                        1M
                      </button>
                      <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
                        3M
                      </button>
                      <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
                        6M
                      </button>
                      <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
                        1Y
                      </button>
                    </div>
                  </fieldset>

                  <LemonButton className="text-base py-3 mt-6 bg-black text-white w-full">
                    Confirm & Lock
                  </LemonButton>

                  <div className="mt-3 text-center text-sm">
                    By locking <strong>24 JUZ</strong> for{" "}
                    <strong>6 months</strong> you will get an estimated value of{" "}
                    <strong className="underline underline-offset-2">
                      4 veJUZ
                    </strong>
                    .
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent asChild value="drops">
              <div>
                <h2 className="font-medium text-xl">Lemon Drops</h2>

                <div className="flex justify-between items-start gap-7">
                  <p className="mt-2 text-sm max-w-xs">
                    We're working on a new way for you to earn rewards from
                    communities in World. Incentives are distributed by doing
                    tasks or learning. This are called a{" "}
                    <strong className="font-medium">Lemon Drops</strong>
                  </p>

                  <figure className="w-32 -mt-3 shrink-0">
                    <Image placeholder="blur" alt="" src={asset_frog} />
                  </figure>
                </div>

                <div className="mt-14 border border-dashed border-black/20 rounded-2xl p-4 text-center text-sm">
                  Coming soon ⚡
                </div>
              </div>
            </TabsContent>
          </div>
        </Fragment>
      </Tabs>
    </section>
  )
}
