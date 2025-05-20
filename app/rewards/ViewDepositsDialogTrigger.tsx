import { shortifyDecimals } from "@/lib/numbers"

import { GiPieChart } from "react-icons/gi"
import ReusableDialog from "@/components/ReusableDialog"
import { useAccountPosition } from "./balances"
import { cn } from "@/lib/utils"

export default function ViewDepositsDialogTrigger() {
  const { deposits, poolShare } = useAccountPosition()

  const earningUSD = (poolShare?.totalUSD || 0) - (deposits?.totalUSD || 0)

  return (
    <ReusableDialog
      title="My Deposits"
      closeText="Increase"
      enabled={!!deposits?.totalUSD}
      onClosePressed={() => {
        // TODO: Handle deposit
      }}
      secondaryAction={{
        text: "Withdraw",
        onPressed: () => {
          // TODO: Show withdraw dialog
        },
      }}
      trigger={
        <button
          onClick={
            deposits?.totalUSD
              ? undefined
              : () => {
                  // TODO: Show deposit dialog
                }
          }
          className="flex gap-1 items-center"
        >
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
      <p>The total assets you have deposited in the WLD/WETH pool</p>

      <p>
        <table className="mt-8 w-full [&_td]:py-1 [&_td]:px-2">
          <thead>
            <tr className="border-b text-black">
              <th />
              <th className="text-right font-medium py-1 px-2">Deposit</th>
              <th className="text-right font-medium py-1 px-2">Earned</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>WLD</td>
              <td className="text-right">
                {shortifyDecimals(deposits?.token0.formatted || 0, 5)}
              </td>
              <td className="text-right">
                {shortifyDecimals(
                  // Subtract deposits from total share
                  (poolShare?.token0.formatted || 0) -
                    (deposits?.token0.formatted || 0),
                  5
                )}
              </td>
            </tr>

            <tr>
              <td>WETH</td>
              <td className="text-right">
                {shortifyDecimals(deposits?.token1.formatted || 0, 5)}
              </td>
              <td className="text-right">
                {shortifyDecimals(
                  // Subtract deposits from total share
                  (poolShare?.token1.formatted || 0) -
                    (deposits?.token1.formatted || 0),
                  5
                )}
              </td>
            </tr>

            <tr className="border-t">
              <td className="text-black font-medium">TOTAL</td>
              <td className="text-right">
                ${shortifyDecimals(deposits?.totalUSD || 0, 5)}
              </td>

              <td
                className={cn(
                  earningUSD < 0
                    ? "text-juz-red"
                    : earningUSD > 0
                    ? "text-juz-green"
                    : "",
                  "text-right font-medium"
                )}
              >
                ${shortifyDecimals(earningUSD, 5)}
              </td>
            </tr>
          </tbody>
        </table>
      </p>
    </ReusableDialog>
  )
}
