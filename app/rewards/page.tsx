"use client"

import { Fragment, useState } from "react"
import { useRouter } from "next/navigation"
import { MiniKit } from "@worldcoin/minikit-js"

import useSWR from "swr"
import Image from "next/image"
import { formatEther, parseEther } from "viem"

import { TopBar, useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import { FaArrowRight } from "react-icons/fa"

import { JUZCounter } from "@/app/HomeNavigation"
import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"
import ReusableDialog from "@/components/ReusableDialog"
import { ABI_LOCKED_JUZ, worldClient } from "@/lib/atoms/holdings"

import { ADDRESS_LOCK_CONTRACT, ZERO } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { calculateAPR } from "@/lib/apr"

import JuzLock, { LockedJuzExplainer } from "./JuzLock"
import { JUZDistributionModal } from "./JuzDistributionModal"
import { useWorldAuth } from "@radish-la/world-auth"
import { useTranslations } from "next-intl"
import { useLockJUZ } from "@/lib/atoms/lock"

import { shortifyDecimals } from "@/lib/numbers"
import { trackEvent } from "@/components/posthog"

import FixedTopContainer from "@/components/FixedTopContainer"
import RewardPool, { APRBadge } from "./RewardPool"

import asset_running from "@/assets/running.png"
import asset_frog from "@/assets/frog.png"

export default function PageRewards() {
  const t = useTranslations("Rewards")
  const APR = calculateAPR(Date.now() / 1_000)

  const [activeTab, setActiveTab] = useState("pools")
  const { toast } = useToast()
  const router = useRouter()

  const { address, signIn } = useWorldAuth()
  const { unlockJUZ } = useLockJUZ()

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

  const { data: lockData = null } = useSWR(
    address ? `locked.user.data.${address}` : null,
    async () => {
      if (!address) return null
      const data = await worldClient.readContract({
        abi: ABI_LOCKED_JUZ,
        functionName: "getLockData",
        address: ADDRESS_LOCK_CONTRACT,
        args: [address],
      })
      return data
    }
  )

  const isLockPeriodEnded = lockData?.unlockTime
    ? Date.now() / 1000 > lockData.unlockTime
    : false

  async function claimRewards() {
    if (!address) return signIn()
    if (claimable < 1e-9) {
      return toast.error({
        title: t("errors.noClaims"),
      })
    }

    if (claimable < 1e-4) {
      return toast.error({
        title: t("errors.balanceToLow"),
      })
    }

    trackEvent("claimed-veJUZ", {
      address,
      amount: claimable,
    })

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
        title: t("success.claimed"),
      })
    }
  }

  async function recoverJUZLocked() {
    if (!address) return signIn()
    const AMOUNT = lockData?.lockedJUZ || ZERO
    if (AMOUNT <= 0) {
      return toast.error({
        title: "Nothing to withdraw",
      })
    }

    const tx = await unlockJUZ(
      AMOUNT +
        // Force max withdrawal (add 1 JUZ extra)
        parseEther("1")
    )

    if (tx?.status === "success") {
      toast.success({
        title: t("success.juzRecovered"),
      })
    }
  }

  const CLAIMABLE = isLockPeriodEnded
    ? Number(formatEther(lockData?.lockedJUZ || ZERO))
    : claimable

  return (
    <main>
      <FixedTopContainer className="border-b border-black/15">
        <TopBar
          className="[&_.text-lg]:text-left"
          startAdornment={<RouteBackButton />}
          endAdornment={
            <JUZDistributionModal>
              <JUZCounter />
            </JUZDistributionModal>
          }
          title={t("title")}
        />
      </FixedTopContainer>

      <Tabs asChild value={activeTab} onValueChange={setActiveTab}>
        <Fragment>
          <div className="bg-gradient-to-b from-juz-orange/7 to-juz-orange/0">
            <nav className="px-5 pb-16">
              <TabsList className="border-b whitespace-nowrap flex items-center border-b-black/5">
                <TabsTrigger
                  className="border-b-2 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="pools"
                >
                  Pools
                </TabsTrigger>

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
            <div className={cn("mb-12", activeTab !== "lock" && "hidden")}>
              <h2 className="font-medium text-xl">JUZ Locking</h2>

              <div className="flex justify-between items-start gap-4">
                <div className="mt-2 text-sm max-w-xs">
                  <p>
                    {t.rich("explainers.locking", {
                      trigger: (children) => {
                        return (
                          <LockedJuzExplainer
                            trigger={
                              <button className="underline underline-offset-2 font-medium">
                                {children}
                              </button>
                            }
                          />
                        )
                      },
                    })}
                  </p>

                  <LemonButton
                    onClick={() => router.push("/market")}
                    className="flex whitespace-nowrap py-3 text-base mt-4 items-center gap-4"
                  >
                    <span>{t("getJUZ")}</span>
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
                  <p className="font-semibold text-xl">
                    {isLockPeriodEnded ? t("juzAvailable") : t("earningVeJUZ")}
                  </p>

                  {isLockPeriodEnded ? (
                    <APRBadge>{t("unlocked")}</APRBadge>
                  ) : (
                    <ReusableDialog
                      title={t("aprBreakdown")}
                      trigger={
                        <APRBadge>
                          🔥 {APR.toFixed(2).replace(".00", "")}% APR
                        </APRBadge>
                      }
                    >
                      {t("explainers.apr")}
                    </ReusableDialog>
                  )}
                </nav>

                <nav className="flex mt-1 items-end justify-between gap-2">
                  <p className="text-4xl tabular-nums font-semibold">
                    {CLAIMABLE <= 0
                      ? "0.000000000"
                      : CLAIMABLE < 1e-9
                      ? "<0.000000001"
                      : CLAIMABLE < 1
                      ? Number(CLAIMABLE).toFixed(9)
                      : shortifyDecimals(CLAIMABLE, 3)}
                  </p>
                  <button
                    onClick={
                      isLockPeriodEnded ? recoverJUZLocked : claimRewards
                    }
                    className="underline font-medium underline-offset-2"
                  >
                    {t("claim")}
                  </button>
                </nav>
              </section>
            </div>

            <div className={cn("mb-12", activeTab !== "drops" && "hidden")}>
              <h2 className="font-medium text-xl">Lemon Drops</h2>

              <div className="flex justify-between items-start gap-7">
                <p className="mt-2 text-sm max-w-xs">
                  {t.rich("explainers.drops", {
                    strong: (children) => (
                      <strong className="font-medium">{children}</strong>
                    ),
                  })}
                </p>

                <figure className="w-32 -mt-3 shrink-0">
                  <Image placeholder="blur" alt="" src={asset_frog} />
                </figure>
              </div>

              <div className="mt-14 border border-dashed border-black/20 rounded-2xl p-4 text-center text-sm">
                {t("comingSoon")}
              </div>
            </div>

            <div className={cn("mb-12", activeTab !== "pools" && "hidden")}>
              <RewardPool />
            </div>
          </section>
        </Fragment>
      </Tabs>
    </main>
  )
}
