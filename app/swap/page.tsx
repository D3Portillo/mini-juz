"use client"

import useSWR from "swr"
import { TopBar, useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"

import { FaArrowRight, FaChevronDown } from "react-icons/fa"

import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"
import MainSelect from "@/components/MainSelect"
import FixedTopContainer from "@/components/FixedTopContainer"

import { shortifyDecimals } from "@/lib/numbers"
import { erc20Abi } from "viem"
import { executeWorldPayment } from "@/actions/payments"
import { worldClient } from "@/lib/atoms/holdings"
import { formatUSDC } from "@/lib/tokens"
import { incrPlayerJUZEarned } from "@/actions/game"

import { JUZCounter } from "@/app/HomeNavigation"
import { JUZDistributionModal } from "@/app/rewards/JuzDistributionModal"
import { ALL_TOKENS } from "@/lib/atoms/token"

import { useFormattedInputHandler } from "@/lib/input"
import { useAccountBalances } from "@/lib/atoms/balances"
import { useWLDPriceInUSD } from "@/lib/atoms/prices"

const TOKENS = {
  WLD: ALL_TOKENS.WLD,
  "USDC.E": ALL_TOKENS["USDC.E"],
}

export default function PageSwap() {
  const { toast } = useToast()
  const { signIn, address } = useWorldAuth()

  const [payingToken, setPayingToken] = useState(TOKENS.WLD)
  const { WLD } = useAccountBalances()
  const { wldPriceInUSD } = useWLDPriceInUSD()

  const handler = useFormattedInputHandler({
    decimals: payingToken.decimals,
  })

  const { data: queryResult = null } = useSWR(
    address ? `token.${payingToken.address}` : null,
    async () => {
      if (!address) return null
      const [balance, juzPrice = 0] = await Promise.all([
        worldClient.readContract({
          abi: erc20Abi,
          functionName: "balanceOf",
          address: ALL_TOKENS["USDC.E"].address,
          args: [address],
        }),
        fetch("/api/juz-price")
          .then((res) => res.json())
          .then((d) => d.price),
      ])

      return {
        usdceBalance: formatUSDC(balance),
        juzPrice: juzPrice as number,
      }
    },
    {
      keepPreviousData: true,
      refreshInterval: 3_000, // 3 seconds
    }
  )

  const JUZ_PRICE = Number(queryResult?.juzPrice || "0.03")

  const BALANCE =
    payingToken.value === "WLD"
      ? WLD.formatted
      : queryResult?.usdceBalance || "0"

  function handleMax() {
    handler.setValue(shortifyDecimals(BALANCE, 5))
  }

  const RECEIVING_JUZ =
    payingToken.value === "WLD"
      ? Number(handler.value) * (wldPriceInUSD / JUZ_PRICE)
      : Number(handler.value) / JUZ_PRICE

  async function handleConfirmSwap() {
    if (!address) return signIn()
    if (handler.formattedValue <= 0) {
      return toast.error({
        title: "Invalid amount",
      })
    }

    if (handler.value < 1e-1) {
      return toast.error({
        title: "Minimum amount is 0.1",
      })
    }

    const QUOTE = RECEIVING_JUZ

    const finalPayload = await executeWorldPayment({
      token: payingToken.value === "WLD" ? "WLD" : "USDCE",
      amount: Number(handler.value),
      initiatorAddress: address,
      paymentDescription: `Receiving ${shortifyDecimals(QUOTE, 4)} JUZ`,
    })

    /**
     * TODO: Replace with this logic when Approved from reviewers
     * const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: erc20Abi,
          address: payingToken.address,
          functionName: "transfer",
          args: [MINI_APP_RECIPIENT, handler.formattedValue],
        },
      ],
    })

    const debuglUrl = (finalPayload as any)?.details?.debugUrl
     */

    if (finalPayload) {
      // Update JUZ Earned
      incrPlayerJUZEarned(address, Number(RECEIVING_JUZ.toFixed(6)))
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
        <nav className="flex pt-1 items-center gap-4">
          <span className="text-sm font-medium">JUZ Price (24h):</span>

          <span className="rounded-full whitespace-nowrap text-sm font-semibold text-center bg-juz-orange/10 border-2 border-juz-orange text-black py-1 px-3">
            🍋 ${shortifyDecimals(JUZ_PRICE, 4)}
          </span>
        </nav>

        <section className="border-3 p-3 rounded-2xl border-black shadow-3d-lg">
          <nav className="flex px-1 items-center justify-between gap-2">
            <MainSelect
              value={payingToken.value}
              options={Object.values(TOKENS)}
              onValueChange={(value) => {
                setPayingToken((TOKENS as any)[value])
              }}
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

          <label className="flex px-1 pt-4 pb-2 gap-1 items-center">
            <input
              value={handler.value}
              onChange={handler.onChangeHandler}
              placeholder={`0 ${payingToken.label}`}
              className="font-medium text-2xl w-full bg-transparent outline-none placeholder:text-black/50 flex-grow"
            />

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

        {handler.value <= 0 ? null : (
          <div className="mt-5 max-w-md mx-auto text-center text-sm">
            You will receive{" "}
            <strong>{shortifyDecimals(RECEIVING_JUZ, 5)} JUZ</strong> for{" "}
            <strong>{shortifyDecimals(handler.value, 5)} WLD</strong>
          </div>
        )}
      </div>
    </main>
  )
}
