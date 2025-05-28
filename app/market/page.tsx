"use client"

import { TopBar, useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { Fragment, useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import { useTranslations } from "next-intl"

import { executeJUZPayment, executeWorldPayment } from "@/actions/payments"
import { incrPlayerJUZEarned } from "@/actions/game"

import { FaChevronDown } from "react-icons/fa"

import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"
import MainSelect from "@/components/MainSelect"
import FixedTopContainer from "@/components/FixedTopContainer"

import { getHardwareType, useHardwareType } from "@/lib/window"
import { useAccountBalances } from "@/lib/atoms/balances"
import { shortifyDecimals } from "@/lib/numbers"
import { usePlayerHearts } from "@/lib/atoms/user"

import { CURRENCY_TOKENS } from "@/lib/atoms/token"

const HEART_HOLDING_LIMIT = 20 // 20 hearts
export default function PageMarket() {
  const t = useTranslations("Market")
  const { toast } = useToast()
  const { isIOS } = useHardwareType()
  const { signIn, user, address } = useWorldAuth()

  const [payingToken, setPayingToken] = useState(
    // Set default token based on platform
    // Since IOS wont allow WLD payments
    getHardwareType().isIOS ? CURRENCY_TOKENS.JUZ : CURRENCY_TOKENS.WLD
  )

  const { hearts, setHearts } = usePlayerHearts()
  const {
    JUZToken: Token,
    JUZPoints: Points,
    WLD,
    mutate: mutateBalances,
    data,
  } = useAccountBalances()

  // So, new rule - we can only do transactions in points format not tokens
  // for IOS devices
  const JUZ = isIOS ? Points : Token

  // @ts-ignore
  const isJUZPayment = payingToken.value === CURRENCY_TOKENS.JUZ.value

  async function handleBuyHearts(amount: number, cost: number) {
    if (hearts >= HEART_HOLDING_LIMIT) {
      // In pro of buys - we only limit based on the amount of holding hearts
      // not current + incoming hearts
      return toast.error({
        title: t("errors.maxHearts"),
      })
    }

    let isSuccess = false
    if (!user?.walletAddress) return signIn()
    const initiatorAddress = user.walletAddress

    if (isJUZPayment) {
      if (cost > Number(JUZ.formatted)) {
        return toast.error({
          title: t("errors.noBalance"),
        })
      }

      isSuccess = Boolean(
        await executeJUZPayment({
          initiatorAddress,
          amount: cost, // in JUZ
        })
      )

      // Revalidate account balances
      if (isSuccess) mutateBalances(data)
    } else {
      isSuccess = Boolean(
        await executeWorldPayment({
          token: "WLD",
          amount: cost, // in WLD
          initiatorAddress,
          paymentDescription: t("templates.buyHearts", {
            amount,
          }),
        })
      )
    }

    if (isSuccess) {
      setHearts(hearts + amount)
      return toast.success({
        title: t("success.purchagedHearts"),
      })
    }
  }

  async function handleBuyJUZ(juzAmount: number, costInWLD: number) {
    if (!address) return signIn()

    const result = await executeWorldPayment({
      token: "WLD",
      amount: costInWLD,
      initiatorAddress: address,
      paymentDescription: t("templates.confirmBuyJUZ", {
        amount: juzAmount,
      }),
    })

    if (result) {
      incrPlayerJUZEarned(
        address,
        juzAmount // Add JUZ bought
      )

      return toast.success({
        title: t("success.juzBought"),
      })
    }
  }

  const PAYING_LABEL = isJUZPayment ? "JUZ" : "WLD"

  return (
    <main>
      <FixedTopContainer className="border-b">
        <TopBar startAdornment={<RouteBackButton />} title={t("title")} />
      </FixedTopContainer>

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
              {shortifyDecimals((isJUZPayment ? JUZ : WLD).formatted, 4)}{" "}
              {PAYING_LABEL}
            </strong>
          </div>
        </nav>

        {isJUZPayment ? null : (
          <Fragment>
            <section
              // TODO: Include after mini app approval
              className="p-4 hidden -flex gap-6 rounded-2xl border-2 border-black shadow-3d"
            >
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

                <LemonButton className="py-3 rounded-full text-base w-full mt-5">
                  Buy for 10 WLD
                </LemonButton>
              </div>
            </section>

            <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
              <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
                <div className="text-5xl">🤠</div>
              </figure>

              <div className="w-full">
                <h2 className="font-medium whitespace-nowrap text-xl">
                  THE JUZ <span className="text-juz-orange">#MASTER</span>
                </h2>

                <p className="text-sm opacity-70">
                  {t.rich("templates.buyJUZ", {
                    amount: () => <strong>1400 JUZ</strong>,
                  })}
                </p>

                <LemonButton
                  onClick={() => handleBuyJUZ(1400, 10)}
                  className="py-3 rounded-full text-base w-full mt-5"
                >
                  {t("buyFor")} 10 WLD
                </LemonButton>
              </div>
            </section>

            <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
              <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
                <div className="text-5xl">🍎</div>
              </figure>

              <div className="w-full">
                <h2 className="font-medium whitespace-nowrap text-xl">
                  JUZ Pack <span className="text-juz-orange">#ULTRA</span>
                </h2>

                <p className="text-sm opacity-70">
                  {t.rich("templates.buyJUZ", {
                    amount: () => <strong>600 JUZ</strong>,
                  })}
                </p>

                <LemonButton
                  onClick={() => handleBuyJUZ(600, 5)}
                  className="py-3 rounded-full text-base w-full mt-5"
                >
                  {t("buyFor")} 5 WLD
                </LemonButton>
              </div>
            </section>

            <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
              <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
                <div className="text-5xl scale-105">🍋</div>
              </figure>

              <div className="w-full">
                <h2 className="font-medium whitespace-nowrap text-xl">
                  JUZ Pack <span className="text-juz-orange">#PRO</span>
                </h2>

                <p className="text-sm opacity-70">
                  {t.rich("templates.buyJUZ", {
                    amount: () => <strong>300 JUZ</strong>,
                  })}
                </p>

                <LemonButton
                  onClick={() => handleBuyJUZ(300, 3)}
                  className="py-3 rounded-full text-base w-full mt-5"
                >
                  {t("buyFor")} 3 WLD
                </LemonButton>
              </div>
            </section>

            <hr className="-mx-4 my-1.5" />
          </Fragment>
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
              {t("templates.heartPointsExplainer", { amount: 5 })}
            </p>

            <LemonButton
              onClick={() =>
                handleBuyHearts(
                  5,
                  isJUZPayment
                    ? 10 // JUZ
                    : 1 // WLD
                )
              }
              className="py-3 whitespace-nowrap rounded-full text-base w-full mt-5"
            >
              {t(isIOS ? "exchangeFor" : "buyFor")} {isJUZPayment ? 10 : 1}{" "}
              {PAYING_LABEL}
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
              {t("templates.heartPointsExplainer", { amount: 10 })}
            </p>

            <LemonButton
              onClick={() =>
                handleBuyHearts(
                  10,
                  isJUZPayment
                    ? 15 // JUZ
                    : 1.5 // WLD
                )
              }
              className="py-3 whitespace-nowrap rounded-full text-base w-full mt-5"
            >
              {t(isIOS ? "exchangeFor" : "buyFor")} {isJUZPayment ? 15 : 1.5}{" "}
              {PAYING_LABEL}
            </LemonButton>
          </div>
        </section>

        <section
          // TODO: Include after mini app approval
          className="p-4 hidden -flex gap-6 rounded-2xl border-2 border-black shadow-3d"
        >
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
    </main>
  )
}
