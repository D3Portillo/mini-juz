import { useState } from "react"
import { FaRegLemon } from "react-icons/fa"

import LemonButton from "@/components/LemonButton"
import LemonIcon from "@/components/LemonIcon"
import ReusableDialog from "@/components/ReusableDialog"
import { cn } from "@/lib/utils"

const LOCK_2W = "2W" as const
const LOCK_1Y = "1Y" as const
const LOCKED_PERIODS = [LOCK_2W, "1M", "3M", "6M", LOCK_1Y] as const

export default function JuzLock() {
  const [lockPeriod, setLockPeriod] = useState<string>()

  const FORMATTED_PERIOD = lockPeriod
    ? lockPeriod
        .replace("M", ` month${lockPeriod.includes("1") ? "" : "s"}`)
        .replace("2W", "2 weeks")
        .replace("1Y", "1 year")
    : "0 weeks"
  return (
    <div className="mt-8 border-3 border-black shadow-3d-lg rounded-2xl p-6">
      <h2 className="font-semibold text-xl">Lock JUZ. Get veJUZ 🍋</h2>

      <fieldset className="mt-4">
        <p className="font-semibold">Lock amount</p>

        <div className="flex mt-1 gap-2 p-3 bg-juz-green/10 rounded-xl items-center border-2 border-black shadow-3d">
          <LemonIcon className="size-7">
            <FaRegLemon />
          </LemonIcon>

          <span className="font-medium flex-grow">0 JUZ</span>

          <button className="font-semibold">MAX</button>
        </div>

        <div className="mt-2 text-sm font-semibold items-center gap-2 grid grid-cols-5">
          <button className="rounded-full text-center bg-black text-white py-1 px-2">
            0%
          </button>
          <button className="rounded-full text-center  py-1 px-2">25%</button>
          <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
            50%
          </button>
          <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
            75%
          </button>
          <button className="rounded-full text-center bg-black/5 text-black/70 py-1 px-2">
            100%
          </button>
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

      <LemonButton className="text-base py-3 mt-6 bg-black text-white w-full">
        Confirm & Lock
      </LemonButton>

      <div className="mt-3 text-center text-sm">
        By locking <strong>24 JUZ</strong> for{" "}
        <strong>{FORMATTED_PERIOD}</strong> you will receive an estimated{" "}
        <LockedJuzExplainer
          trigger={
            <button className="underline font-semibold underline-offset-2">
              4 veJUZ.
            </button>
          }
        />
      </div>
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
