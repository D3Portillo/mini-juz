"use client"

import Link from "next/link"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"

import ReusableDialog from "@/components/ReusableDialog"

import { usePoolAPRData } from "./internals"
import { shortifyDecimals } from "@/lib/numbers"
import { APRBadge } from "./RewardPool"

export default function APRDialogTrigger({
  className,
}: {
  className?: string
}) {
  const { aprData } = usePoolAPRData()

  return (
    <ReusableDialog
      title="APR Breakdown"
      trigger={
        <APRBadge className={className}>
          🔥 {shortifyDecimals(aprData.total)}% APR
        </APRBadge>
      }
    >
      <p>
        The Pool automatically compounds rewards and fees to create liquidity
        positions in incentivized programs to extract the most yield.
      </p>

      <hr className="mt-6 mb-4" />

      <p>
        <nav className="flex items-center gap-3">
          <span className="inline-block font-medium w-28">Uniswap</span>
          <span className="flex-grow" />
          <span className="font-semibold">
            {shortifyDecimals(aprData.uni)}%
          </span>
          <Link
            target="_blank"
            className="scale-95"
            href="https://app.uniswap.org/explore/pools/worldchain/0x494d68e3cab640fa50f4c1b3e2499698d1a173a0"
          >
            <FaArrowUpRightFromSquare />
          </Link>
        </nav>
      </p>

      <p>
        <nav className="flex items-center gap-3">
          <span className="inline-block font-medium w-28">Merkl</span>
          <span className="flex-grow" />
          <span className="font-semibold">
            {shortifyDecimals(aprData.merkl)}%
          </span>
          <Link
            target="_blank"
            className="scale-95"
            href="https://app.merkl.xyz/opportunities/world-chain/CLAMM/0x494D68e3cAb640fa50F4c1B3E2499698D1a173A0"
          >
            <FaArrowUpRightFromSquare />
          </Link>
        </nav>
      </p>

      <p>
        <nav className="flex items-center gap-3">
          <span className="inline-block font-medium w-28">JUZ Token</span>
          <span className="flex-grow" />
          <span className="font-semibold">{aprData.juzToken}%</span>
          <Link
            target="_blank"
            className="scale-95"
            href="https://x.com/lemon_dapp"
          >
            <FaArrowUpRightFromSquare />
          </Link>
        </nav>
      </p>
    </ReusableDialog>
  )
}
