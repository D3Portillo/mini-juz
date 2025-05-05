"use client"

import { Fragment, useState } from "react"
import { useRouter } from "next/navigation"
import { MiniKit } from "@worldcoin/minikit-js"

import useSWR from "swr"
import Image from "next/image"
import { erc20Abi, formatEther } from "viem"

import { TopBar, useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import { FaArrowRight } from "react-icons/fa"

import { JUZCounter } from "@/app/HomeNavigation"
import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"
import ReusableDialog from "@/components/ReusableDialog"
import { ABI_LOCKED_JUZ, worldClient } from "@/lib/atoms/holdings"

import { ADDRESS_LOCK_CONTRACT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { calculateAPR } from "@/lib/apr"

import JuzLock, { LockedJuzExplainer } from "./JuzLock"
import { JUZDistributionModal } from "./JuzDistributionModal"
import { useWorldAuth } from "@radish-la/world-auth"
import { shortifyDecimals } from "@/lib/numbers"

import asset_running from "@/assets/running.png"
import asset_frog from "@/assets/frog.png"

export default function PageRewards() {
  const APR = calculateAPR(Date.now() / 1_000)

  const [activeTab, setActiveTab] = useState("lock")
  const { toast } = useToast()
  const router = useRouter()

  const { user, signIn } = useWorldAuth()
  const address = user?.walletAddress

  const { data: claimable = 0 } = useSWR(
    address ? `juz.earned.${address}` : null,
    async () => {
      if (!worldClient) return 0

      const [, claimable] = await worldClient.readContract({
        abi: ABI_LOCKED_JUZ,
        functionName: "getRewardData",
        address: ADDRESS_LOCK_CONTRACT,
        args: [address as any],
      })

      // We want to keep the really small numbers
      return formatEther(claimable) as any as number
    },
    {
      refreshInterval: 3_000, // 3 seconds
    }
  )

  async function claimRewards() {
    if (!address) return signIn()
    if (claimable < 1e-9) {
      return toast.error({
        title: "Nothing to be claimed",
      })
    }

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: ABI_LOCKED_JUZ,
          address: ADDRESS_LOCK_CONTRACT,
          functionName: "claimVeJUZ",
          args: [],
        },
      ],
    })

    if (finalPayload.status === "success") {
      toast.success({
        title: "veJUZ claimed!",
      })
    }
  }

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

      <Tabs asChild value={activeTab} onValueChange={setActiveTab}>
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

          <section className="-mt-8 px-5">
            <div className={cn("mb-12", activeTab === "lock" || "hidden")}>
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
                    by locking JUZ for a period of time. In the future veJUZ can
                    be used for goverance, access reward pools or airdrops
                  </p>

                  <LemonButton
                    // Back to home atm - later update to marketplace
                    onClick={() => router.push("/")}
                    className="flex whitespace-nowrap py-3 text-base mt-4 items-center gap-4"
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
                  <p className="font-semibold text-xl">Earning veJUZ</p>

                  <ReusableDialog
                    title="APR Breakdown"
                    trigger={
                      <button className="rounded-full text-sm font-semibold text-center bg-juz-orange/10 border-2 border-juz-orange text-black py-1 px-3">
                        🔥 {APR.toFixed(2).replace(".00", "")}% APR
                      </button>
                    }
                  >
                    APR is calculated based on the current veJUZ supply and the
                    amount of JUZ locked in the pool. APR is variable and can
                    change over time.
                  </ReusableDialog>
                </nav>

                <nav className="flex mt-1 items-end justify-between gap-2">
                  <p className="text-4xl tabular-nums font-semibold">
                    {claimable <= 0
                      ? "0.000000000"
                      : claimable < 1e-9
                      ? "<0.000000001"
                      : claimable < 1
                      ? Number(claimable).toFixed(9)
                      : shortifyDecimals(claimable, 3)}
                  </p>
                  <button
                    onClick={claimRewards}
                    className="underline font-medium underline-offset-2"
                  >
                    Claim
                  </button>
                </nav>
              </section>
            </div>

            <div className={cn("mb-12", activeTab === "lock" && "hidden")}>
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
          </section>
        </Fragment>
      </Tabs>
    </section>
  )
}
