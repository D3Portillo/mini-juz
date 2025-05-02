"use client"

import type { PropsWithChildren } from "react"
import ReusableDialog from "@/components/ReusableDialog"
import { useAccountBalances } from "@/lib/atoms/balances"
import { formatEther } from "viem"
import { shortifyDecimals } from "@/lib/numbers"

export function JUZDistributionModal({ children }: PropsWithChildren) {
  const { JUZToken, JUZPoints, VE_JUZ, lockedJUZ } = useAccountBalances()
  const JUZHoldings = JUZToken.balance + JUZPoints.balance

  return (
    <ReusableDialog trigger={children} title="JUZ Breakdown">
      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-green">JUZ</strong>
            <p className="text-xs opacity-75">Trivia earned + Bought/Owned</p>
          </div>
          <span className="text-xl mt-1 font-medium">
            {shortifyDecimals(formatEther(JUZHoldings))}
          </span>
        </nav>
      </p>

      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-orange">JUZ Locked</strong>
            <p className="text-xs opacity-75">Balance locked in pools</p>
          </div>
          <span className="text-xl mt-1 font-medium">
            {shortifyDecimals(lockedJUZ.formatted)}
          </span>
        </nav>
      </p>

      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-black/70">veJUZ</strong>
            <p className="text-xs opacity-75">
              Rewards claimed for JUZ Token locking
            </p>
          </div>
          <span className="text-xl mt-1 font-medium">
            {shortifyDecimals(VE_JUZ.formatted)}
          </span>
        </nav>
      </p>
    </ReusableDialog>
  )
}
