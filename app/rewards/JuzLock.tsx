"use client"

import { useState } from "react"
import { FaRegLemon } from "react-icons/fa"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useLocale, useTranslations } from "next-intl"

import { calculateVeJUZ, cn } from "@/lib/utils"
import { useFormattedInputHandler } from "@/lib/input"
import { useAccountBalances } from "@/lib/atoms/balances"
import { shortifyDecimals } from "@/lib/numbers"

import { useLockJUZ } from "@/lib/atoms/lock"
import { trackEvent } from "@/components/posthog"

import LemonButton from "@/components/LemonButton"
import LemonIcon from "@/components/LemonIcon"
import ReusableDialog from "@/components/ReusableDialog"
import { JUZDistributionModal } from "./JuzDistributionModal"

const LOCK_2W = "2W" as const
const LOCK_1Y = "1Y" as const
const LOCKED_PERIODS = [LOCK_2W, "1M", "3M", "6M", LOCK_1Y] as const

export default function JuzLock() {
  const t = useTranslations("JuzLock")
  const tglobal = useTranslations("global")

  const inputHandler = useFormattedInputHandler()
  const [lockPeriod, setLockPeriod] = useState<string>(LOCK_1Y)

  const { toast } = useToast()
  const { lock } = useLockJUZ()
  const { isConnected, signIn } = useWorldAuth()
  const { JUZToken, lockedJUZ } = useAccountBalances()

  const isStakingZero = !(inputHandler.value > 0)

  const FORMATTED_PERIOD = t(`periods.${lockPeriod as "2W"}`)

  const isValidStaking =
    !isStakingZero && LOCKED_PERIODS.includes(lockPeriod as any)

  const VALUE_MAX = shortifyDecimals(JUZToken.formatted, 6) as any

  function handleMax() {
    inputHandler.setValue(VALUE_MAX)
  }

  async function handleLock() {
    if (!isConnected) return signIn()
    if (isStakingZero) {
      return toast.error({
        title: t("errors.validAmount"),
      })
    }

    const isSuccess = Boolean(
      await lock(inputHandler.formattedValue, getPeriodInWeeks(lockPeriod))
    )

    if (isSuccess) {
      trackEvent("locked-JUZ", {
        amount: inputHandler.value,
        period: lockPeriod,
      })

      toast.success({
        title: t("success.locked"),
      })

      // Reset input
      inputHandler.resetValue()
      setLockPeriod(LOCK_1Y)
    }
  }

  return (
    <div className="mt-8 border-3 border-black shadow-3d-lg rounded-2xl p-6">
      <h2 className="font-semibold whitespace-nowrap text-xl">{t("title")}</h2>

      <fieldset className="mt-4">
        <nav className="flex items-center justify-between">
          <strong className="font-semibold">{t("lockAmount")}</strong>
          {(lockedJUZ.formatted as any) > 1e-3 ? (
            <JUZDistributionModal>
              <button className="text-sm fade-in animate-in font-semibold">
                {tglobal("locked")}: {shortifyDecimals(lockedJUZ.formatted)} JUZ
              </button>
            </JUZDistributionModal>
          ) : null}
        </nav>

        <label className="flex mt-1 gap-2 p-3 bg-juz-green/10 rounded-xl items-center border-2 border-black shadow-3d">
          <LemonIcon className="size-7 shrink-0">
            <FaRegLemon />
          </LemonIcon>

          <input
            value={inputHandler.value}
            onChange={inputHandler.onChangeHandler}
            placeholder="0 JUZ"
            className="font-medium w-full bg-transparent outline-none placeholder:text-black flex-grow"
          />

          <button onClick={handleMax} className="font-semibold">
            MAX
          </button>
        </label>

        <div className="mt-2 text-sm font-semibold items-center gap-2 grid grid-cols-5">
          {[0, 25, 50, 75, 100].map((lockRatio) => {
            const lockingAmount = (VALUE_MAX * lockRatio) / 100
            const isActivePeriod =
              lockRatio == 0
                ? inputHandler.value == 0
                : lockingAmount > 0 && inputHandler.value == lockingAmount

            return (
              <button
                key={`lock-ratio-${lockRatio}`}
                onClick={() => inputHandler.setValue(lockingAmount)}
                className={cn(
                  "rounded-full outline-none text-center py-1 px-2",
                  isActivePeriod
                    ? "bg-black text-white"
                    : "bg-black/5 text-black/70"
                )}
              >
                {lockRatio}%
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="mt-8 select-none">
        <p className="font-semibold">{t("lockDuration")}</p>

        <div className="flex mt-1 gap-2 p-3 bg-juz-green/10 rounded-xl items-center border-2 border-black shadow-3d">
          <LemonIcon className="size-7">⏰</LemonIcon>
          <span className="font-medium flex-grow">{FORMATTED_PERIOD}</span>
          <button
            onClick={() => setLockPeriod(LOCK_1Y)}
            className="font-semibold"
          >
            MAX
          </button>
        </div>

        <div className="mt-2 text-sm font-semibold items-center gap-2 grid grid-cols-5">
          {LOCKED_PERIODS.map((period) => {
            const isActivePeriod = period === lockPeriod
            return (
              <button
                key={`locked-${period}`}
                onClick={() => setLockPeriod(period)}
                className={cn(
                  "rounded-full outline-none text-center py-1 px-2",
                  isActivePeriod
                    ? "bg-black text-white"
                    : "bg-black/5 text-black/70"
                )}
              >
                {period}
              </button>
            )
          })}
        </div>
      </fieldset>

      <LemonButton
        onClick={handleLock}
        className="text-base py-3 mt-6 bg-black text-white w-full"
      >
        {isConnected ? t("confirmLock") : tglobal("connectWallet")}
      </LemonButton>

      {isValidStaking ? (
        <div className="mt-3 max-w-md mx-auto text-center text-sm">
          {t("byLocking")} <strong>{inputHandler.value} JUZ</strong> {t("for")}{" "}
          <strong className="lowercase">{FORMATTED_PERIOD}</strong>{" "}
          {t.rich("youWillReceiveEstimated", {
            Estimate: () => (
              <LockedJuzExplainer
                trigger={
                  <button className="underline font-semibold underline-offset-2">
                    {shortifyDecimals(
                      calculateVeJUZ(
                        Number(inputHandler.value),
                        getPeriodInWeeks(lockPeriod)
                      ),
                      3
                    )}{" "}
                    veJUZ
                  </button>
                }
              />
            ),
          })}
        </div>
      ) : (
        <div className="py-1" />
      )}
    </div>
  )
}

export function LockedJuzExplainer({ trigger }: { trigger: JSX.Element }) {
  const locale = useLocale()
  const t = useTranslations("JuzLock.explainers.veJUZ")

  const contents = Array.from({ length: Number(t("contents.size")) }).map(
    (_, i) =>
      t.rich(`contents.${i}` as "contents.0", {
        strong: (children) => <strong>{children}</strong>,
      })
  )

  return (
    <ReusableDialog title={t("title")} trigger={trigger}>
      {contents.map((content, i) => (
        <p key={`juz.content-${i}-${locale}`}>{content}</p>
      ))}
    </ReusableDialog>
  )
}

function getPeriodInWeeks(period: string) {
  if (period === LOCK_1Y) return 52
  if (period === LOCK_2W) return 2
  return Number(period.at(0)) * 4 // 1 month = 4 weeks
}
