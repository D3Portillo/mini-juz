"use client"

import { shortifyDecimals } from "@/lib/numbers"

import { GiPieChart } from "react-icons/gi"
import ReusableDialog from "@/components/ReusableDialog"
import { useAccountPosition } from "./balances"

export const ID_VIEW_DEPOSITS = "view-deposits"
export default function ViewDepositsDialogTrigger() {
  const { deposits } = useAccountPosition()

  return (
    <ReusableDialog
      title="Deposits Overview"
      trigger={
        <button id={ID_VIEW_DEPOSITS} className="flex gap-1 items-center">
          <GiPieChart className="text-lg scale-110" />
          <span className="text-base">
            $
            {deposits?.totalUSD
              ? shortifyDecimals(deposits.totalUSD, 5)
              : "0.00"}
          </span>
        </button>
      }
    >
      <p>
        Pools deposits are currently paused while we perform maintenance to
        enhance JUZ. Thank you for your patience!
      </p>
    </ReusableDialog>
  )
}
