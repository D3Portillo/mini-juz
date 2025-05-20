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
import { GiPieChart } from "react-icons/gi"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"

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
import Link from "next/link"

const OPTIONS_SORT_BY = {
  APR: "APR",
  TVL: "TVL",
}

export default function RewardPool() {
  const { toast } = useToast()
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

        <label className="flex font-medium items-center gap-2">
          <Checkbox defaultChecked />
          <span>Active</span>
        </label>

        <label className="flex whitespace-nowrap font-medium items-center gap-2">
          <Checkbox />
          <span>My pools</span>
        </label>
      </nav>

      <div className="mt-6 border-3 border-black shadow-3d-lg rounded-2xl p-4">
        <nav className="flex gap-5 items-center">
          <div className="flex shrink-0 -space-x-3.5">
            <img
              alt=""
              className="size-[3.25rem] rounded-full border-3 border-black"
              src="/token/WETH.png"
            />
            <img alt="" className="size-10 rounded-full" src="/token/WLD.png" />
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
              The total value locked in the WLD/WETH pool is the sum of the
              assets deposited by all users.
            </p>
          </ReusableDialog>

          <div className="flex-grow whitespace-nowrap shrink-0">
            <ReusableDialog
              title="My Deposits"
              closeText="Collect Rewards"
              onClosePressed={handleCompound}
              secondaryAction={{
                text: "Withdraw",
                onPressed: () => {
                  // TODO: Show withdraw dialog
                },
              }}
              trigger={
                <button className="flex gap-1 items-center">
                  <GiPieChart className="text-lg scale-110" />
                  <span className="text-base">$24</span>
                </button>
              }
            >
              <p>The total assets you have deposited in the WLD/WETH pool</p>

              <p>
                <table className="mt-8 w-full [&_td]:py-1 [&_td]:px-2">
                  <thead>
                    <tr className="border-b text-black">
                      <th />
                      <th className="text-right font-medium py-1 px-2">
                        Deposit
                      </th>
                      <th className="text-right font-medium py-1 px-2">
                        Earned
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>WLD</td>
                      <td className="text-right">0.0001</td>
                      <td className="text-right">0.0001</td>
                    </tr>

                    <tr>
                      <td>WETH</td>
                      <td className="text-right">0.00004</td>
                      <td className="text-right">0.00004</td>
                    </tr>

                    <tr className="border-t">
                      <td className="text-black font-medium">TOTAL</td>
                      <td className="text-right">0.00014</td>
                      <td className="text-right text-juz-green font-medium">
                        $0.00014
                      </td>
                    </tr>
                  </tbody>
                </table>
              </p>
            </ReusableDialog>
          </div>

          <ReusableDialog
            closeText="Earn now"
            onClosePressed={() => {}}
            title="Reward Tokens"
            trigger={
              <button className="flex -mb-1 flex-col items-end">
                <div className="flex justify-end shrink-0 -space-x-1.5">
                  <img
                    alt=""
                    className="size-6 rounded-full border-2 border-black"
                    src="/token/WETH.png"
                  />
                  <img
                    alt=""
                    className="size-6 rounded-full"
                    src="/token/WLD.png"
                  />
                  <img
                    alt=""
                    className="size-6 rounded-full border border-black"
                    src="/token/JUZ.png"
                  />
                </div>
                <div className="text-xs">REWARDS</div>
              </button>
            }
          >
            <p>
              A list of assets to be earned by depositing in the WLD/WETH pool.
            </p>

            <p>
              <div className="flex gap-2 flex-col shrink-0">
                <div className="flex bg-black/3 rounded-2xl py-2 pl-2 pr-4 items-center gap-2">
                  <div className="w-6 grid place-content-center text-black">
                    1.
                  </div>
                  <nav className="flex pr-4 gap-2 items-center bg-gradient-to-br from-black/80 to-black/90 rounded-xl overflow-hidden">
                    <img
                      alt=""
                      className="size-8 rounded-xl border-2 border-black"
                      src="/token/WETH.png"
                    />
                    <span className="text-white text-sm font-medium">WETH</span>
                  </nav>
                  <div className="flex-grow" />
                  <Link
                    className="text-sm flex items-center gap-2"
                    target="_blank"
                    href="/"
                  >
                    <span>Worldscan</span>
                    <FaArrowUpRightFromSquare className="text-sm" />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 text-black">#2</div>

                  <nav className="flex pr-4 gap-2 items-center bg-black rounded-full">
                    <img
                      alt=""
                      className="size-8 rounded-full"
                      src="/token/WLD.png"
                    />
                    <span className="text-white text-sm font-medium">WLD</span>
                  </nav>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 text-black">#3</div>

                  <nav className="flex pr-4 gap-2 items-center bg-black rounded-full">
                    <img
                      alt=""
                      className="size-8 rounded-full border border-black"
                      src="/token/JUZ.png"
                    />
                    <span className="text-white text-sm font-medium">JUZ</span>
                  </nav>
                </div>
              </div>
            </p>
          </ReusableDialog>
        </nav>
      </div>
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
