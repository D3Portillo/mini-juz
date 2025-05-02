"use client"

import { TopBar, useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import { executeWorldPyment } from "@/actions/payments"

import { FaChevronDown } from "react-icons/fa"

import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"
import MainSelect from "@/components/MainSelect"

import { useAccountBalances } from "@/lib/atoms/balances"
import { shortifyDecimals } from "@/lib/numbers"
import { usePlayerHearts } from "@/lib/atoms/user"

import { CURRENCY_TOKENS } from "@/lib/atoms/token"
import { incrPlayerJUZEarned } from "@/actions/game"

const HEART_HOLDING_LIMIT = 25 // 25 hearts
export default function PageProfile() {
  const { toast } = useToast()
  const { signIn, user } = useWorldAuth()
  const [payingToken, setPayingToken] = useState(CURRENCY_TOKENS.WLD)

  const { hearts, setHearts } = usePlayerHearts()
  const { JUZToken, WLD } = useAccountBalances()

  // @ts-ignore
  const isJUZPayment = payingToken.value === CURRENCY_TOKENS.JUZ.value

  async function handleBuyHearts(amount: number, cost: number) {
    if (hearts >= HEART_HOLDING_LIMIT) {
      // In pro of buys - we only limit based on the amount of holding hearts
      // not current + incoming hearts
      return toast.error({
        title: "Holding hearts limit reached",
      })
    }

    let isSuccess = false
    if (!user?.walletAddress) return signIn()

    if (isJUZPayment) {
      // TODO: Handle JUZ payment
    } else {
      const result = await executeWorldPyment({
        amount: cost, // in WLD
        initiatorAddress: user.walletAddress,
        paymentDescription: `Confirm to buy a Pack of ${amount} hearts in JUZ Mini App`,
      })

      isSuccess = Boolean(result)
    }

    if (isSuccess) {
      setHearts(hearts + amount)
      return toast.success({
        title: "Pack of hearts purchased",
      })
    }
  }

  async function handleBuyJUZ() {
    const address = user?.walletAddress
    if (!address) return signIn()

    const result = await executeWorldPyment({
      amount: 10, // 10 WLD
      initiatorAddress: address,
      paymentDescription: "Confirm to buy the JUZ Master NFT in JUZ Mini App",
    })

    if (result) {
      // TODO: Handle NFT Minting
      incrPlayerJUZEarned(
        address,
        300 // Add JUZ bought
      )
      return toast.success({
        title: "Long live the Master of JUZ",
      })
    }
  }

  const PAYING_LABEL = isJUZPayment ? "JUZ" : "WLD"

  return (
    <section className="min-h-screen">
      <nav className="border-b bg-white top-0 sticky z-10">
        <TopBar
          className="py-0 gap-5 px-5"
          startAdornment={<RouteBackButton />}
          title="Level up your profile"
        />
      </nav>

      <div className="flex [&_strong]:font-medium px-4 mt-2 mb-12 flex-col gap-4">
        <nav className="flex px-1 items-center justify-between gap-2">
          <MainSelect
            value={payingToken.value}
            options={Object.values(CURRENCY_TOKENS)}
            onValueChange={(value) => {
              setPayingToken((CURRENCY_TOKENS as any)[value])
            }}
          >
            <button className="flex outline-none py-2 items-center">
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

          <div>
            Balance:{" "}
            <strong>
              {shortifyDecimals((isJUZPayment ? JUZToken : WLD).formatted, 4)}{" "}
              {PAYING_LABEL}
            </strong>
          </div>
        </nav>

        {isJUZPayment ? null : (
          <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
            <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
              <div className="text-5xl">🍋</div>
            </figure>

            <div>
              <h2 className="font-medium text-xl">
                JUZ Master <span className="text-juz-orange">NFT</span>
              </h2>

              <p className="text-sm opacity-70">
                Get an exclusive early adopter NFT in{" "}
                <strong>worldchain</strong> your first purchase.
              </p>

              <p className="text-sm mt-2 opacity-70">
                <strong>300 JUZ</strong> to your account.
              </p>

              <LemonButton
                onClick={handleBuyJUZ}
                className="py-3 rounded-full text-base w-full mt-5"
              >
                Buy for 10 WLD
              </LemonButton>
            </div>
          </section>
        )}

        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl mt-1">🖤</div>
          </figure>

          <div>
            <h2 className="font-medium text-xl">
              Heart Pack <span className="text-juz-orange">#1</span>
            </h2>

            <p className="text-sm opacity-70">
              Buy a pack of 5 hearts. Hearts will be added to your current heart
              points.
            </p>

            <LemonButton
              onClick={() =>
                handleBuyHearts(
                  5,
                  isJUZPayment
                    ? 7 // JUZ
                    : 3 // WLD
                )
              }
              className="py-3 rounded-full text-base w-full mt-5"
            >
              Buy for {isJUZPayment ? 7 : 3} {PAYING_LABEL}
            </LemonButton>
          </div>
        </section>

        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl">❤️‍🔥</div>
          </figure>

          <div>
            <h2 className="font-medium text-xl">
              Heart Pack <span className="text-juz-orange">#2</span>
            </h2>

            <p className="text-sm opacity-70">
              Buy a pack of 10 hearts. Hearts will be added to your current
              heart points.
            </p>

            <LemonButton
              onClick={() =>
                handleBuyHearts(
                  10,
                  isJUZPayment
                    ? 12 // JUZ
                    : 5 // WLD
                )
              }
              className="py-3 rounded-full text-base w-full mt-5"
            >
              Buy for {isJUZPayment ? 10 : 5} {PAYING_LABEL}
            </LemonButton>
          </div>
        </section>

        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl mt-1">🛡️</div>
          </figure>

          <div>
            <h2 className="font-medium text-xl">
              Last resort <span className="text-juz-orange">(Powerup)</span>
            </h2>

            <p className="text-sm text-black/70">
              Use a shield to give your <strong>last heart</strong> a second
              chance in the trivia. Item will expire after use.
            </p>

            <LemonButton className="py-3 rounded-full text-base w-full mt-5">
              Buy for {isJUZPayment ? 2 : 0.5} {PAYING_LABEL}
            </LemonButton>
          </div>
        </section>
      </div>
    </section>
  )
}
