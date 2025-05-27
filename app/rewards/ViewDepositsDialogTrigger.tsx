"use client"

import useSWR from "swr"
import { Fragment } from "react"
import { shortifyDecimals } from "@/lib/numbers"

import { GiPieChart } from "react-icons/gi"
import ReusableDialog from "@/components/ReusableDialog"
import { useAccountPosition } from "./balances"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useWorldAuth } from "@radish-la/world-auth"

function formatNumber(num: number | string) {
  return shortifyDecimals(num, 5).replace(
    // Remove non valid number
    "-0",
    "0"
  )
}

export const ID_VIEW_DEPOSITS = "view-deposits"
export default function ViewDepositsDialogTrigger({
  onIncreasePressed,
  onWithdrawPressed,
}: {
  onIncreasePressed?: () => void
  onWithdrawPressed?: () => void
}) {
  const { address } = useWorldAuth()

  const { data, error } = useSWR(
    address ? `/api/solution/0/${address}` : null,
    async () => {
      const r = await fetch(`/api/solution/0/${address}`)
      const data = await r.json()
      return {
        paymentTx: data.paymentTx as string | null,
      }
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  console.debug({ data, error })

  const { deposits, poolShare } = useAccountPosition()

  const earningUSD = formatNumber(
    (poolShare?.totalUSD || 0) - (deposits?.totalUSD || 0)
  )

  const earningToken0 = formatNumber(
    (poolShare?.token0.formatted || 0) - (deposits?.token0.formatted || 0)
  ) as any

  const earningToken1 = formatNumber(
    (poolShare?.token1.formatted || 0) - (deposits?.token1.formatted || 0)
  ) as any

  return (
    <ReusableDialog
      title={
        data?.paymentTx ? "Withdrawal complete" : "Paused" // "My Deposits"
      }
      closeText={data?.paymentTx ? "View transaction" : "Request withdrawal"} //"Add balance"
      enabled={!!deposits?.totalUSD}
      onClosePressed={() => {
        if (data?.paymentTx) {
          return window.open(
            `https://worldscan.org/tx/${data.paymentTx}`,
            "_blank"
          )
        }

        window.open("https://tally.so/r/wQyZLY", "_blank")
        // onIncreasePressed?.()
      }}
      /**
      *  secondaryAction={{
        text: "Withdraw",
        onPressed: () => onWithdrawPressed?.(),
      }}
      */
      trigger={
        <button
          id={ID_VIEW_DEPOSITS}
          onClick={deposits?.totalUSD ? undefined : onIncreasePressed}
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
      {data?.paymentTx ? null : (
        <Fragment>
          <p className="hidden">
            The total assets you have deposited in the WLD/WETH pool + earnings.
          </p>

          <p>We are fixing issues with the withdraw contract.</p>

          <p>
            You see your balances and rewards, but won't be able to withdraw or
            add liquidity. In the meantime if you want us to remove your assets
            + any rewards fill out{" "}
            <Link
              className="underline underline-offset-4"
              target="_blank"
              href="https://tally.so/r/wQyZLY"
            >
              this form
            </Link>{" "}
            or join the{" "}
            <Link
              className="underline underline-offset-4"
              target="_blank"
              href="https://t.me/+KSntxdij5QwzYTkx"
            >
              support group.
            </Link>
          </p>
        </Fragment>
      )}

      {data?.paymentTx ? (
        <p>
          You requested us to withdraw your assets from the WLD/WETH. And we've
          completed your request. Below you can see the transaction with the
          pending deposits to withdraw from the pool + any earned rewards.
          Thanks!
        </p>
      ) : (
        <p>
          <table className="mt-8 table-fixed w-full [&_td]:py-1 [&_td]:px-3">
            <thead>
              <tr className="border-b text-black">
                <th className="w-20" />
                <th className="text-right border-r font-medium py-1 px-3">
                  Deposit
                </th>
                <th className="text-right font-medium py-1 px-3">Earned</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="w-20 border-r">WLD</td>
                <td className="text-right border-r">
                  {shortifyDecimals(deposits?.token0.formatted || 0, 5)}
                </td>
                <td className="text-right">
                  {earningToken0 > 0 ? "+" : ""}
                  {earningToken0}
                </td>
              </tr>

              <tr>
                <td className="w-20 border-r">WETH</td>
                <td className="text-right border-r">
                  {shortifyDecimals(deposits?.token1.formatted || 0, 5)}
                </td>
                <td className="text-right">
                  {earningToken1 > 0 ? "+" : ""}
                  {earningToken1}
                </td>
              </tr>

              <tr className="border-t">
                <td className="w-20 border-r text-black font-medium">TOTAL</td>
                <td className="text-right border-r">
                  ${shortifyDecimals(deposits?.totalUSD || 0, 5)}
                </td>

                <td
                  className={cn(
                    (earningUSD as any) < 0
                      ? "text-juz-red"
                      : (earningUSD as any) > 0
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
      )}
    </ReusableDialog>
  )
}
