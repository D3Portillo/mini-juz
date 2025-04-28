"use client"

import { Fragment, type PropsWithChildren } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { TopBar } from "@worldcoin/mini-apps-ui-kit-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import { FaArrowRight, FaRegLemon } from "react-icons/fa"

import { JUZCounter } from "@/app/HomeNavigation"
import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"
import ReusableDialog from "@/components/ReusableDialog"
import LemonIcon from "@/components/LemonIcon"
import JuzLock, { LockedJuzExplainer } from "./JuzLock"

import asset_running from "@/assets/running.png"
import asset_frog from "@/assets/frog.png"

export default function PageRewards() {
  const router = useRouter()

  return (
    <section className="min-h-screen">
      <nav className="border-b border-black/15 bg-white top-0 sticky z-10">
        <TopBar
          className="py-0 gap-5 px-5 [&_.text-lg]:text-left"
          startAdornment={<RouteBackButton />}
          endAdornment={
            <JUZDistributionModal>
              <JUZCounter />
            </JUZDistributionModal>
          }
          title="Reward boost"
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
              <div className="mb-12">
                <h2 className="font-medium text-xl">JUZ Locking</h2>

                <div className="flex justify-between items-start gap-4">
                  <div className="mt-2 text-sm max-w-xs">
                    <p>
                      Earn{" "}
                      <LockedJuzExplainer
                        trigger={
                          <button className="underline underline-offset-2 font-medium">
                            veJUZ
                          </button>
                        }
                      />{" "}
                      by locking JUZ for a period of time. In the future veJUZ
                      can be used for goverance, access reward pools or airdrops
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

                <JuzLock />

                <section className="p-4 bg-gradient-to-br from-juz-green-lime/5 to-juz-green-lime/0 mt-5 rounded-2xl border-3 border-black shadow-3d-lg">
                  <nav className="flex items-center justify-between">
                    <p className="font-semibold text-xl">Earned veJUZ</p>

                    <span className="rounded-full text-sm font-semibold text-center bg-juz-orange/10 border-2 border-juz-orange text-black py-1 px-3">
                      🔥 32% APR
                    </span>
                  </nav>

                  <nav className="flex mt-1 items-end justify-between gap-2">
                    <p className="text-4xl font-semibold">32.5</p>
                    <button className="underline font-medium underline-offset-2">
                      Claim
                    </button>
                  </nav>
                </section>
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

function JUZDistributionModal({ children }: PropsWithChildren) {
  return (
    <ReusableDialog trigger={children} title="JUZ Breakdown">
      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-green">JUZ</strong>
            <p className="text-xs opacity-75">Trivia earned + Bought</p>
          </div>
          <span className="text-xl mt-1 font-medium">242.00</span>
        </nav>
      </p>

      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-orange">JUZ Locked</strong>
            <p className="text-xs opacity-75">Balance in staking pools</p>
          </div>
          <span className="text-xl mt-1 font-medium">242.00</span>
        </nav>
      </p>

      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-black/70">veJUZ</strong>
            <p className="text-xs opacity-75">Rewards earned from locking</p>
          </div>
          <span className="text-xl mt-1 font-medium">242.00</span>
        </nav>
      </p>
    </ReusableDialog>
  )
}
