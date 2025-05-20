"use client"

import { Fragment, useState, type PropsWithChildren } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

import useSWR from "swr"
import { type ContractFunctionArgs, formatEther, parseEther } from "viem"

import { Checkbox, useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useWorldAuth } from "@radish-la/world-auth"
import { useWLDPriceInUSD } from "@/lib/atoms/prices"
import { useCompoundRewardData } from "./internals"

import { cn } from "@/lib/utils"
import { appendSignatureResult } from "@/lib/atoms/erc20"
import { numberToShortWords, shortifyDecimals } from "@/lib/numbers"

import { PiVaultFill } from "react-icons/pi"
import { FaArrowRight, FaChevronDown, FaChevronRight } from "react-icons/fa"

import { ABI_JUZ_POOLS, worldClient } from "@/lib/atoms/holdings"

import {
  ADDRESS_POOL_WLD_ETH,
  ADDRESS_WETH,
  ADDRESS_WORLD_COIN,
  ONE_HOUR_IN_BLOCK_TIME,
} from "@/lib/constants"

import LemonButton from "@/components/LemonButton"
import MainSelect from "@/components/MainSelect"

import ReusableDialog from "@/components/ReusableDialog"
import APRDialogTrigger from "./APRDialogTrigger"
import RewardDialogTrigger from "./RewardDialogTrigger"
import { useAccountPosition } from "./balances"
import ViewDepositsDialogTrigger from "./ViewDepositsDialogTrigger"

const OPTIONS_SORT_BY = {
  APR: "APR",
  TVL: "TVL",
}

export default function RewardPool() {
  const { toast } = useToast()
  const [showActive, setShowActive] = useState(true)
  const [showDepositsOnly, setShowDepositsOnly] = useState(false)

  const [sortBy, setSortBy] = useState<keyof typeof OPTIONS_SORT_BY>("APR")

  const { user, signIn } = useWorldAuth()
  const address = user?.walletAddress

  const { wldPriceInUSD } = useWLDPriceInUSD()
  const { compoundRewardData } = useCompoundRewardData()

  const { data: TVL = 0 } = useSWR(
    `pools.metadata.${wldPriceInUSD}`,
    async () => {
      // Updated based on the WLD price
      if (!worldClient) return 0
      const tvlInWLD = await worldClient.readContract({
        abi: ABI_JUZ_POOLS,
        functionName: "totalValueInToken0",
        address: ADDRESS_POOL_WLD_ETH,
      })

      return Number(formatEther(tvlInWLD)) * wldPriceInUSD
    }
  )

  const { deposits } = useAccountPosition()

  async function handlePoolWithdraw() {
    if (!address) return signIn()
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: ABI_JUZ_POOLS,
          address: ADDRESS_POOL_WLD_ETH,
          functionName: "withdraw",
          args: [
            parseEther("0.26"), // shares
          ],
        },
      ],
    })

    console.debug({ finalPayload })
    console.log((finalPayload as any)?.details?.debugUrl)
    if (finalPayload.status === "success") {
      toast.success({
        title: "Withdrew 0.0001 WLD",
      })
    }
  }

  async function handlePoolDeposit() {
    if (!address) return signIn()

    const SENDING_WLD = parseEther("0.07")
    const SENDING_WETH = parseEther("0.00004")

    const pool = {
      token0: ADDRESS_WORLD_COIN,
      token1: ADDRESS_WETH,
    }

    const balances = {
      amount0: SENDING_WLD,
      amount1: SENDING_WETH,
    }

    const nonce0 = BigInt(Date.now())
    const nonce1 = BigInt(Date.now() + 4)

    const DEADLINE = BigInt(
      Math.floor(Date.now() / 1000) + ONE_HOUR_IN_BLOCK_TIME
    )

    const { finalPayload, commandPayload } =
      await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            abi: ABI_JUZ_POOLS,
            address: ADDRESS_POOL_WLD_ETH,
            functionName: "depositWithPermit",
            // function depositWithPermit(uint256, uint256, ((address,uint256),uint256,uint256), (address,uint256), bytes, ((address,uint256),uint256,uint256), (address,uint256), bytes) external
            args: [
              balances.amount0,
              balances.amount1,
              [[pool.token0, balances.amount0], nonce0, DEADLINE], // token, amount, nonce, deadline
              [ADDRESS_POOL_WLD_ETH, balances.amount0], // to, requested
              appendSignatureResult({ slot: 0 }) as any,
              [[pool.token1, balances.amount1], nonce1, DEADLINE], // token, amount, nonce, deadline
              [ADDRESS_POOL_WLD_ETH, balances.amount1], // to, requested
              appendSignatureResult({ slot: 1 }) as any,
            ] satisfies ContractFunctionArgs<typeof ABI_JUZ_POOLS>,
          },
        ],
        permit2: [
          {
            spender: ADDRESS_POOL_WLD_ETH,
            permitted: {
              token: pool.token0,
              amount: balances.amount0,
            },
            nonce: nonce0,
            deadline: DEADLINE,
          },
          {
            spender: ADDRESS_POOL_WLD_ETH,
            permitted: {
              token: pool.token1,
              amount: balances.amount1,
            },
            nonce: nonce1,
            deadline: DEADLINE,
          },
        ],
      })

    if (finalPayload.status === "error") {
      console.debug(finalPayload, commandPayload)
      console.log(finalPayload.details?.debugUrl)
    }
  }

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
      toast.success({
        title: `$${shortifyDecimals(
          compoundRewardData?.totalUSD || 0,
          5
        )} collected`,
      })
    }

    if (finalPayload.status === "error") {
      // Omit user rejection errors
      if (finalPayload.details) return genericError()
    }
  }

  const rawDeposits = deposits?.token0.value || deposits?.token1.value || 0
  const isUserInPool = rawDeposits > 1e13 // 0.00001 WLD or WETH

  // TODO: Make this dynamic to different pools
  // leaving as placeholder for now
  const isEmpty = !showActive || (showDepositsOnly && !isUserInPool)

  return (
    <Fragment>
      <h2 className="font-medium text-xl">Reward Pools</h2>

      <div className="flex justify-between items-start gap-7">
        <p className="mt-2 text-sm max-w-[14rem]">
          Deposit assets. Earn rewards. Compound and enjoy the JUZ of Yield
          farming.
        </p>

        <ReusableDialog
          title="What are JUZ Pools?"
          trigger={
            <button className="size-14 -mt-5 bg-gradient-to-bl from-juz-orange/15 to-juz-orange/3 border-juz-orange/40 border grid place-content-center shrink-0 rounded-2xl">
              <span className="text-2xl scale-105">🤔</span>
            </button>
          }
        >
          <p>
            JUZ Pools are smart vaults with custom strategies that compound
            rewards and create liquidity positions in incentivized pools to
            extract the most yield.
          </p>

          <p>
            Anyone can earn a share of the fees by calling the compound
            function.
          </p>

          <p>
            Compounder rewards are <strong>cap to 0.5%</strong> from the balance
            available to compound.
          </p>
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
          Claimable fees:{" "}
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

        <label className="flex select-none font-medium items-center gap-2">
          <Checkbox onChange={setShowActive} checked={showActive} />
          <span>Active</span>
        </label>

        <label className="flex select-none whitespace-nowrap font-medium items-center gap-2">
          <Checkbox onChange={setShowDepositsOnly} checked={showDepositsOnly} />
          <span>My pools</span>
        </label>
      </nav>

      {isEmpty ? (
        <div className="grid min-h-40 place-content-center">
          <p className="text-sm text-black/50 font-medium">Nothing to show</p>
        </div>
      ) : (
        <div className="mt-6 border-3 border-black shadow-3d-lg rounded-2xl p-4">
          <nav className="flex gap-5 items-center">
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

            <FaChevronRight className="text-lg scale-110" />
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
                <h2 className="text-sm text-black">Current TVL</h2>
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
