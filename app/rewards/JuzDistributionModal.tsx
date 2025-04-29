"use client"

import type { PropsWithChildren } from "react"
import ReusableDialog from "@/components/ReusableDialog"

export function JUZDistributionModal({ children }: PropsWithChildren) {
  return (
    <ReusableDialog trigger={children} title="JUZ Breakdown">
      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-green">JUZ</strong>
            <p className="text-xs opacity-75">Trivia earned + Bought</p>
          </div>
          <span className="text-xl mt-1 font-medium">242.00</span>
        </nav>
      </p>

      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-orange">JUZ Locked</strong>
            <p className="text-xs opacity-75">Balance in staking pools</p>
          </div>
          <span className="text-xl mt-1 font-medium">242.00</span>
        </nav>
      </p>

      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-black/70">veJUZ</strong>
            <p className="text-xs opacity-75">
              Rewards claimed for JUZ Locking
            </p>
          </div>
          <span className="text-xl mt-1 font-medium">242.00</span>
        </nav>
      </p>
    </ReusableDialog>
  )
}
