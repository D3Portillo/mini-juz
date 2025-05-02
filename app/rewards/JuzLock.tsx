import { useState } from "react"
import { FaRegLemon } from "react-icons/fa"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { calculateVeJUZ, cn } from "@/lib/utils"
import { useFormattedInputHandler } from "@/lib/input"
import { useAccountBalances } from "@/lib/atoms/balances"
import { shortifyDecimals } from "@/lib/numbers"

import LemonButton from "@/components/LemonButton"
import LemonIcon from "@/components/LemonIcon"
import ReusableDialog from "@/components/ReusableDialog"
import { useLockJUZ } from "@/lib/atoms/lock"

const LOCK_2W = "2W" as const
const LOCK_1Y = "1Y" as const
const LOCKED_PERIODS = [LOCK_2W, "1M", "3M", "6M", LOCK_1Y] as const

export default function JuzLock() {
  const inputHandler = useFormattedInputHandler()
  const [lockPeriod, setLockPeriod] = useState<string>(LOCK_1Y)

  const { toast } = useToast()
  const { lock } = useLockJUZ(inputHandler.formattedValue)
  const { isConnected, signIn } = useWorldAuth()
  const { JUZToken } = useAccountBalances()

  const isStakingZero = !(inputHandler.value > 0)

  const FORMATTED_PERIOD = lockPeriod
    .replace("M", ` month${lockPeriod.includes("1") ? "" : "s"}`)
    .replace("2W", "2 weeks")
    .replace("1Y", "1 year")

  const isValidStaking =
    !isStakingZero && LOCKED_PERIODS.includes(lockPeriod as any)

  function handleMax() {
    inputHandler.setValue(JUZToken.formatted)
  }

  async function handleLock() {
    if (!isConnected) return signIn()
    if (await lock(getPeriodInWeeks(lockPeriod))) {
      toast.success({
        title: "JUZ locked successfully",
      })
    }
  }

  return (
    <div className="mt-8 border-3 border-black shadow-3d-lg rounded-2xl p-6">
      <h2 className="font-semibold text-xl">Lock JUZ. Get veJUZ 🍋</h2>

      <fieldset className="mt-4">
        <p className="font-semibold">Lock amount</p>

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
            const lockingAmount = (Number(JUZToken.formatted) * lockRatio) / 100
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
        <p className="font-semibold">Lock duration</p>

        <div className="flex mt-1 gap-2 p-3 bg-juz-green/10 rounded-xl items-center border-2 border-black shadow-3d">
          <LemonIcon className="size-7">⏰</LemonIcon>
          <span className="font-medium flex-grow capitalize">
            {FORMATTED_PERIOD}
          </span>
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
        {isConnected ? "Confirm & Lock" : "Connect Wallet"}
      </LemonButton>

      {isValidStaking ? (
        <div className="mt-3 max-w-md mx-auto text-center text-sm">
          By locking <strong>{inputHandler.value} JUZ</strong> for{" "}
          <strong>{FORMATTED_PERIOD}</strong> you will receive an estimated{" "}
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
        </div>
      ) : (
        <div className="py-1" />
      )}
    </div>
  )
}

export function LockedJuzExplainer({ trigger }: { trigger: JSX.Element }) {
  return (
    <ReusableDialog title="What's veJUZ?" trigger={trigger}>
      <p>
        Vote-Escrowed JUZ (<strong>veJUZ</strong>) is a protocol token that can
        be obtained by locking JUZ for period of time. The longer you lock, the
        greater the earning potential.
      </p>

      <p>
        <strong>veJUZ</strong> is summed up to your total JUZ balance and can be
        used to vote in future governance proposals and earn rewards.
      </p>
    </ReusableDialog>
  )
}

function getPeriodInWeeks(period: string) {
  if (period === LOCK_1Y) return 52
  if (period === LOCK_2W) return 2
  return Number(period.at(0)) * 4 // 1 month = 4 weeks
}
