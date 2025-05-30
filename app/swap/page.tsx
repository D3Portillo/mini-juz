"use client"

import useSWR from "swr"
import { TopBar, useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { Fragment, useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"

import { FaArrowRight, FaChevronDown, FaGift } from "react-icons/fa"

import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"
import MainSelect from "@/components/MainSelect"
import FixedTopContainer from "@/components/FixedTopContainer"

import { shortifyDecimals } from "@/lib/numbers"
import { type Address, erc20Abi, formatEther } from "viem"
import { executeWorldPayment, MINI_APP_RECIPIENT } from "@/actions/payments"
import { worldClient } from "@/lib/atoms/holdings"
import { formatUSDC } from "@/lib/tokens"
import { incrPlayerJUZEarned } from "@/actions/game"

import { JUZCounter } from "@/app/HomeNavigation"
import { JUZDistributionModal } from "@/app/rewards/JuzDistributionModal"
import { ALL_TOKENS } from "@/lib/atoms/token"
import { MiniKit } from "@worldcoin/minikit-js"

import { trackEvent } from "@/components/posthog"
import { beautifyAddress } from "@/lib/utils"
import { getUnoDeeplinkUrl } from "@/lib/deeplinks"

import { useFormattedInputHandler } from "@/lib/input"
import { useAccountBalances } from "@/lib/atoms/balances"
import { useWLDPerETH } from "@/app/rewards/internals"
import { useOroPriceInUSD, useWLDPriceInUSD } from "@/lib/atoms/prices"

import { ADDRESS_JUZ, ADDRESS_WORLD_COIN, ZERO } from "@/lib/constants"

export default function PageSwap() {
  const { toast } = useToast()
  const { signIn, address } = useWorldAuth()

  const [payingToken, setPayingToken] = useState(ALL_TOKENS.WLD)
  const { WLD } = useAccountBalances()
  const { wldPriceInUSD } = useWLDPriceInUSD()
  const { oroPriceInUSD } = useOroPriceInUSD()
  const { wldPerETH } = useWLDPerETH()

  const handler = useFormattedInputHandler({
    decimals: payingToken.decimals,
  })

  const { data: queryResult = null } = useSWR(
    `juz-price-feed`,
    async () => {
      const [usdcBalance, wethBalance, oroBalance, juzPrice = 0] =
        await Promise.all([
          address
            ? worldClient.readContract({
                abi: erc20Abi,
                functionName: "balanceOf",
                address: ALL_TOKENS["USDC.E"].address,
                args: [address],
              })
            : Promise.resolve(ZERO),
          address
            ? worldClient.readContract({
                abi: erc20Abi,
                functionName: "balanceOf",
                address: ALL_TOKENS.WETH.address,
                args: [address],
              })
            : Promise.resolve(ZERO),
          address
            ? worldClient.readContract({
                abi: erc20Abi,
                functionName: "balanceOf",
                address: ALL_TOKENS.ORO.address,
                args: [address],
              })
            : Promise.resolve(ZERO),
          fetch("/api/juz-price")
            .then((res) => res.json())
            .then((d) => d.price),
        ])

      return {
        usdceBalance: formatUSDC(usdcBalance),
        oroBalance: {
          formatted: formatEther(oroBalance),
          value: oroBalance,
        },
        wethBalance: {
          formatted: formatEther(wethBalance),
          value: wethBalance,
        },
        juzPrice: juzPrice as number,
      }
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      refreshInterval: 3_500, // 3.5 seconds
    }
  )

  const { data: leaderboard = [] } = useSWR<
    {
      timestamp: string
      amount: number
      address: Address
    }[]
  >(
    `buying-board-data`,
    async () => {
      const data = await fetch("/api/juz-price/buys")
      return await data.json()
    },
    {
      keepPreviousData: true,
      refreshInterval: 7_500, // 7.5 seconds
    }
  )

  const JUZ_PRICE = Number(queryResult?.juzPrice || "0.0138")

  const BALANCE =
    payingToken.value === ALL_TOKENS.WLD.value
      ? WLD.formatted
      : payingToken.value === ALL_TOKENS.WETH.value
      ? queryResult?.wethBalance?.formatted || "0"
      : payingToken.value === ALL_TOKENS.ORO.value
      ? queryResult?.oroBalance?.formatted || "0"
      : queryResult?.usdceBalance || "0"

  function handleMax() {
    handler.setValue(shortifyDecimals(BALANCE, 5))
  }

  function calculateJUZFromToken(token: string, amount: number | string) {
    if (token === ALL_TOKENS.ORO.value) {
      // ORO Calculation
      return Number(amount) * (oroPriceInUSD / JUZ_PRICE)
    }

    return token === ALL_TOKENS.WLD.value
      ? Number(amount) * (wldPriceInUSD / JUZ_PRICE)
      : token === ALL_TOKENS.WETH.value // WETH Calculation
      ? Number(amount) * wldPerETH * (wldPriceInUSD / JUZ_PRICE)
      : Number(amount) / JUZ_PRICE
  }

  const RECEIVING_JUZ = calculateJUZFromToken(payingToken.value, handler.value)

  async function handleConfirmSwap() {
    if (!address) return signIn()
    if (handler.formattedValue <= 0) {
      return toast.error({
        title: "Invalid amount",
      })
    }

    const QUOTE = RECEIVING_JUZ
    let isSuccess = false

    if (["WETH", "ORO"].includes(payingToken.value)) {
      // Process WETH/ORO transfer
      const FORMATTED_BIG_BALANCE =
        ((payingToken as any).value === "WETH"
          ? queryResult?.wethBalance?.value
          : queryResult?.oroBalance?.value) || ZERO

      if (handler.formattedValue > FORMATTED_BIG_BALANCE) {
        return toast.error({
          title: "Insufficient balance",
        })
      }

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            abi: erc20Abi,
            address: payingToken.address,
            functionName: "transfer",
            args: [MINI_APP_RECIPIENT, handler.formattedValue],
          },
        ],
      })

      isSuccess = finalPayload.status === "success"
    } else {
      // We cotinuew with payment flow for WLD / USDC.E
      if (handler.value < 1e-1) {
        return toast.error({
          title: "Minimum amount is 0.1",
        })
      }

      const result = await executeWorldPayment({
        token: payingToken.value === "WLD" ? "WLD" : "USDCE",
        amount: Number(handler.value),
        initiatorAddress: address,
        paymentDescription: `Receiving ${shortifyDecimals(QUOTE, 4)} JUZ`,
      })

      isSuccess = result !== null
    }

    if (isSuccess) {
      // Update JUZ Earned
      incrPlayerJUZEarned(address, Number(RECEIVING_JUZ.toFixed(6)))
      trackEvent("otc-swap", {
        address,
        token: payingToken.value,
        amount: QUOTE,
      })

      handler.resetValue()
      return toast.success({
        title: `${shortifyDecimals(QUOTE, 4)} JUZ received!`,
      })
    }
  }

  return (
    <main>
      <FixedTopContainer className="border-b">
        <TopBar
          className="[&_.text-lg]:text-left"
          startAdornment={<RouteBackButton />}
          endAdornment={
            <JUZDistributionModal>
              <JUZCounter />
            </JUZDistributionModal>
          }
          title="JUZ Swap"
        />
      </FixedTopContainer>

      <div className="flex flex-grow [&_strong]:font-medium px-4 mt-4 mb-12 flex-col gap-5">
        <nav className="flex items-center gap-3.5">
          <span className="text-sm font-medium">JUZ Price (5min)</span>
          <div className="flex-grow" />
          <span className="rounded-full whitespace-nowrap text-sm font-semibold text-center bg-juz-orange/10 border-2 border-juz-orange text-black py-1 px-3">
            ${shortifyDecimals(JUZ_PRICE, 4)} 💰
          </span>
          <button
            onClick={() => {
              window.open(
                getUnoDeeplinkUrl({
                  fromToken: ADDRESS_JUZ,
                  toToken: ADDRESS_WORLD_COIN,
                })
              )
            }}
            className="pt-1 pb-1.5 text-xl"
          >
            <FaGift className="scale-110" />
          </button>
        </nav>

        <section className="border-3 -mt-0.5 p-3 rounded-2xl border-black shadow-3d-lg">
          <nav className="flex px-1 items-center justify-between gap-2">
            <MainSelect
              value={payingToken.value}
              options={Object.values(ALL_TOKENS)}
              onValueChange={(value) =>
                setPayingToken((ALL_TOKENS as any)[value])
              }
            >
              <button className="flex pt-1 outline-none items-center">
                <figure
                  style={{
                    backgroundImage: `url(/token/${payingToken?.value}.png)`,
                  }}
                  className="size-6 scale-105 bg-cover bg-center bg-black/80 shrink-0 rounded-full"
                />
                <strong className="ml-2.5">{payingToken.label}</strong>
                <FaChevronDown className="ml-1 scale-105" />
              </button>
            </MainSelect>

            <div className="whitespace-nowrap">
              Balance:{" "}
              <strong>
                {shortifyDecimals(BALANCE, 4)} {payingToken.label}
              </strong>
            </div>
          </nav>

          <label className="flex px-1 pt-4 gap-1 items-center">
            <div className="w-full">
              <input
                value={handler.value}
                onChange={handler.onChangeHandler}
                placeholder={`0 ${payingToken.label}`}
                className="font-medium text-2xl w-full bg-transparent outline-none placeholder:text-black/50 flex-grow"
              />
              <div className="text-xs text-black font-medium pointer-events-none mt-2 mb-0.5">
                1 {payingToken.label} ={" "}
                <strong className="text-juz-green">
                  {shortifyDecimals(
                    calculateJUZFromToken(payingToken.value, "1")
                  )}{" "}
                  JUZ
                </strong>
              </div>
            </div>

            <LemonButton
              onClick={handleMax}
              className="bg-black text-sm px-3 text-white"
            >
              MAX
            </LemonButton>
          </label>
        </section>

        <LemonButton
          onClick={handleConfirmSwap}
          className="w-full bg-juz-green-lime rounded-full text-base py-3.5 flex gap-4 justify-between items-center"
        >
          <span className="text-base">Confirm swap</span>
          <FaArrowRight className="text-lg" />
        </LemonButton>

        <div className="min-h-14 grid place-items-center">
          {RECEIVING_JUZ > 0 && (
            <div className="max-w-md mx-auto text-center text-sm">
              You will receive{" "}
              <strong>{shortifyDecimals(RECEIVING_JUZ, 5)} JUZ</strong>
            </div>
          )}
        </div>

        {leaderboard.length > 0 && (
          <Fragment>
            <section className="mt-5 flex flex-col">
              <div className="text-sm font-medium gap-5 border-y py-3.5 whitespace-nowrap flex items-center">
                <div className="w-20 pl-2">Time</div>
                <div className="flex-grow text-juz-green">JUZ Balance</div>
                <div className="w-20">User</div>
              </div>

              {leaderboard.map(({ address, amount, timestamp }) => {
                const date = new Date(timestamp)

                return (
                  <div
                    key={`${address}-${date.getTime()}-${amount}`}
                    className="text-xs gap-5 py-3 even:bg-black/3 whitespace-nowrap flex items-center"
                  >
                    <div className="w-20 pl-2 tabular-nums">
                      {date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    <div className="tabular-nums flex-grow">
                      <strong className="tabular-nums">
                        {shortifyDecimals(amount, 3)} JUZ
                      </strong>
                    </div>

                    <div className="w-20 tabular-nums">
                      {beautifyAddress(address)}
                    </div>
                  </div>
                )
              })}
            </section>
            <p className="max-w-xs mt-10 text-sm mx-auto text-center">
              Showing latest user transactions
            </p>
          </Fragment>
        )}
      </div>
    </main>
  )
}
