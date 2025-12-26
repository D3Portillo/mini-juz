"use client"

import { Fragment, useEffect, useState, type PropsWithChildren } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

import { Checkbox, useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useWorldAuth } from "@radish-la/world-auth"
import { useCompoundRewardData } from "./internals"

import { cn } from "@/lib/utils"
import { numberToShortWords, shortifyDecimals } from "@/lib/numbers"

import { PiVaultFill } from "react-icons/pi"
import { FaArrowRight, FaChevronDown, FaChevronRight } from "react-icons/fa"

import { ABI_JUZ_POOLS } from "@/lib/atoms/holdings"
import { ADDRESS_POOL_WLD_ETH } from "@/lib/constants"

import LemonButton from "@/components/LemonButton"
import MainSelect from "@/components/MainSelect"
import ReusableDialog from "@/components/ReusableDialog"

import { isAnyModalOpen } from "@/lib/window"
import { useAccountPosition, usePoolTVL } from "./balances"

import APRDialogTrigger from "./APRDialogTrigger"
import RewardDialogTrigger from "./RewardDialogTrigger"
import ViewDepositsDialogTrigger, {
  ID_VIEW_DEPOSITS,
} from "./ViewDepositsDialogTrigger"
import { useTranslations } from "next-intl"

const OPTIONS_SORT_BY = {
  APR: "APR",
  TVL: "TVL",
}

export default function RewardPool() {
  const { toast } = useToast()
  const [showActive, setShowActive] = useState(true)
  const [showDepositsOnly, setShowDepositsOnly] = useState(false)

  const t = useTranslations("RewardPools")

  const [sortBy, setSortBy] = useState<keyof typeof OPTIONS_SORT_BY>("APR")

  const { address, signIn } = useWorldAuth()

  const { tvl: TVL } = usePoolTVL()
  const { compoundRewardData } = useCompoundRewardData()
  const { deposits } = useAccountPosition()

  async function handleCompound() {
    const genericError = () =>
      toast.error({
        title: "Wait 10s before compounding again",
      })

    if (!address) return signIn()

    const nextClaim = compoundRewardData?.nextClaimTime
    if (nextClaim && nextClaim > new Date()) {
      return genericError()
    }

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: ABI_JUZ_POOLS,
          address: ADDRESS_POOL_WLD_ETH,
          functionName: "compound",
          args: [],
        },
      ],
    })

    if (finalPayload.status === "success") {
      const amount = compoundRewardData?.totalUSD || 0
      toast.success({
        title: `$${shortifyDecimals(amount, amount < 1 ? 6 : 3)} collected`,
      })
    }

    if (finalPayload.status === "error") {
      // Omit user rejection errors
      if ((finalPayload as any).details) return genericError()
    }
  }

  useEffect(() => {
    if (!address) {
      // Do not filter when user not connected
      setShowDepositsOnly(false)
    }
  }, [address])

  const rawDeposits = deposits?.token0.value || deposits?.token1.value || 0
  const isUserInPool = rawDeposits > 1e13 // 0.00001 WLD or WETH

  // TODO: Make this dynamic to different pools
  // leaving as placeholder for now
  const isEmpty = !showActive || (showDepositsOnly && !isUserInPool)

  const explainerContent = Array.from({
    length: Number(t("explainers.whatArePools.contents.size")),
  }).map((_, i) =>
    t(
      `explainers.whatArePools.contents.${i}` as "explainers.whatArePools.contents.0"
    )
  )

  return (
    <Fragment>
      <h2 className="font-medium text-xl">Reward Pools</h2>

      <div className="flex justify-between items-start gap-7">
        <p className="mt-2 text-sm max-w-[14rem]">{t("description")}</p>
        <ReusableDialog
          title={t("explainers.whatArePools.title")}
          trigger={
            <button className="size-14 group -mt-5 bg-gradient-to-bl from-juz-orange/15 to-juz-orange/3 border-juz-orange/50 border-2 grid place-content-center shrink-0 rounded-2xl">
              <span className="text-2xl transition-all group-hover:-rotate-6 scale-105 group-hover:scale-110">
                🤔
              </span>
            </button>
          }
        >
          {explainerContent.map((content, index) => (
            <p key={`explainer-content-${index}`}>{content}</p>
          ))}
        </ReusableDialog>
      </div>

      <div className="mt-6">
        <LemonButton
          onClick={handleCompound}
          className="flex whitespace-nowrap py-3 text-base items-center gap-4"
        >
          <span>Compound</span>
          <FaArrowRight className="text-lg" />
        </LemonButton>

        <div className="mt-2.5 text-sm">
          {t("claimableFees")}:{" "}
          <strong className="font-medium">
            $
            {compoundRewardData?.totalUSD
              ? shortifyDecimals(compoundRewardData.totalUSD, 5)
              : 0}
          </strong>
        </div>
      </div>

      <nav className="mt-12 pt-5 flex border-t-3 border-black gap-6 items-center">
        <MainSelect
          value={sortBy}
          onValueChange={setSortBy as any}
          options={Object.values(OPTIONS_SORT_BY).map((value) => ({
            label: value,
            value,
          }))}
        >
          {(selected) => (
            <button className="flex outline-none items-center">
              <strong className="font-medium">
                {selected?.label || "APR"}
              </strong>
              <FaChevronDown className="ml-2 scale-105" />
            </button>
          )}
        </MainSelect>

        <div className="flex-grow" />

        <label className="flex select-none whitespace-nowrap font-medium items-center gap-2">
          <Checkbox
            onChange={(willActivate) => {
              // If user is not logged in, show sign-in modal
              if (!address && willActivate) return signIn()
              setShowDepositsOnly(willActivate)
            }}
            checked={showDepositsOnly}
          />
          <span>My pools</span>
        </label>

        <label className="flex select-none font-medium items-center gap-2">
          <Checkbox onChange={setShowActive} checked={showActive} />
          <span>Active</span>
        </label>
      </nav>

      {isEmpty ? (
        <div className="grid min-h-40 place-content-center">
          <p className="text-sm text-black/50 font-medium">Nothing to show</p>
        </div>
      ) : (
        <div className="mt-6 border-3 border-black shadow-3d-lg rounded-2xl p-4">
          <nav
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              // Early return if any modal is open
              if (isAnyModalOpen()) return

              // Early return if propagation is from children
              if ((e.target as HTMLButtonElement).tagName === "BUTTON") return

              // Open View Deposits Dialog
              document.getElementById(ID_VIEW_DEPOSITS)?.click()
            }}
            className="flex group gap-5 items-center"
          >
            <div className="flex shrink-0 -space-x-3.5">
              <img
                alt=""
                className="size-[3.25rem] rounded-full border-3 border-black"
                src="/token/WETH.png"
              />
              <img
                alt=""
                className="size-10 rounded-full"
                src="/token/WLD.png"
              />
            </div>

            <div>
              <h2 className="font-semibold whitespace-nowrap mb-0.5 text-lg">
                WLD/WETH Pool
              </h2>
              <APRDialogTrigger />
            </div>

            <div className="flex-grow" />

            <FaChevronRight className="text-lg scale-110 group-hover:translate-x-px" />
          </nav>

          <hr className="mt-5" />

          <nav className="flex mt-3 font-medium gap-6 items-center">
            <ReusableDialog
              title="Total Value Locked"
              trigger={
                <button className="flex min-w-[20%] gap-1.5 items-center">
                  <PiVaultFill className="text-lg scale-125" />
                  <span className="text-base">${numberToShortWords(TVL)}</span>
                </button>
              }
            >
              <p>
                The total value locked (TVL) in the WLD/WETH pool is the sum of
                all the assets deposited in the pool.
              </p>

              <section className="p-4 -mb-5 rounded-2xl border-3 border-black shadow-3d-lg">
                <h2 className="text-sm text-black">Pool TVL</h2>
                <p className="text-2xl text-black font-semibold">
                  $
                  {TVL.toLocaleString("en-US", {
                    maximumFractionDigits: TVL < 1 ? 5 : 2,
                    minimumFractionDigits: TVL > 1000 ? 0 : 2,
                  })}
                </p>
              </section>
            </ReusableDialog>

            <div className="flex-grow whitespace-nowrap shrink-0">
              <ViewDepositsDialogTrigger />
            </div>

            <RewardDialogTrigger />
          </nav>
        </div>
      )}
    </Fragment>
  )
}

export function APRBadge({
  children,
  className,
  ...rest
}: PropsWithChildren<{
  className?: string
}>) {
  return (
    <button
      {...rest}
      className={cn(
        "rounded-full whitespace-nowrap text-sm font-semibold text-center bg-juz-orange/10 border-2 border-juz-orange text-black py-1 px-3",
        className
      )}
    >
      {children}
    </button>
  )
}
