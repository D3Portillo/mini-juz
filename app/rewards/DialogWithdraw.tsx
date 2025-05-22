"use client"

import { useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { formatEther } from "viem"
import { useWorldAuth } from "@radish-la/world-auth"
import { usePoolTVL } from "./balances"
import useSWR from "swr"

import { cn } from "@/lib/utils"
import { shortifyDecimals } from "@/lib/numbers"
import { ABI_JUZ_POOLS, worldClient } from "@/lib/atoms/holdings"
import { ADDRESS_POOL_WLD_ETH, ZERO } from "@/lib/constants"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"
import { Slider } from "@/components/ui/slider"

const DEFAULT_PERCENTAGE = 75
export default function DialogWithdraw({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [withdrawPercentage, setShowWithdrawPercentage] =
    useState(DEFAULT_PERCENTAGE)
  const { user, signIn } = useWorldAuth()
  const { toast } = useToast()
  const address = user?.walletAddress

  const { liquidityInUSD } = usePoolTVL()

  const { data: ownedShares = null } = useSWR(
    address ? `user.shares.${address}` : null,
    async () => {
      if (!address) return null
      const [shares, totalShares] = await Promise.all([
        worldClient.readContract({
          abi: ABI_JUZ_POOLS,
          functionName: "addressShares",
          args: [address],
          address: ADDRESS_POOL_WLD_ETH,
        }),
        worldClient.readContract({
          abi: ABI_JUZ_POOLS,
          functionName: "totalShares",
          address: ADDRESS_POOL_WLD_ETH,
        }),
      ])

      return {
        formatted: formatEther(shares) as any,
        value: shares,
        vsTotalShares: {
          formatted: formatEther(totalShares) as any,
          value: totalShares,
        },
      }
    },
    {
      keepPreviousData: true,
    }
  )

  const ownedLiquidityInUSD = ownedShares
    ? (ownedShares.formatted / ownedShares.vsTotalShares.formatted) *
      liquidityInUSD
    : 0

  const withdrawWingLiquidity = (ownedLiquidityInUSD * withdrawPercentage) / 100

  useEffect(() => {
    if (!open) setShowWithdrawPercentage(DEFAULT_PERCENTAGE)
  }, [open])

  async function handlePoolWithdraw() {
    const AMOUNT = ownedShares?.value
      ? (ownedShares.value * BigInt(withdrawPercentage)) / BigInt(100)
      : ZERO

    if (!address) return signIn()
    if (AMOUNT <= 0) return toast.error({ title: "Invalid balance" })

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: ABI_JUZ_POOLS,
          address: ADDRESS_POOL_WLD_ETH,
          functionName: "withdraw",
          args: [AMOUNT],
        },
      ],
    })

    const debugUrl = (finalPayload as any)?.details?.debugUrl
    const isError = Boolean(debugUrl)

    if (isError) {
      console.debug("Error in transaction", debugUrl)
      return toast.error({
        title: "Transaction failed",
      })
    }

    if (finalPayload.status === "success") {
      toast.success({
        title: `$${shortifyDecimals(
          withdrawWingLiquidity,
          withdrawWingLiquidity < 1 ? 5 : 3
        )} claimed`,
      })

      // Close the dialog
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Withdraw</h2>
        </AlertDialogHeader>

        <section className="p-4 -mt-1 rounded-2xl border-3 border-black shadow-3d-lg">
          <h2 className="text-sm text-black">Available balance</h2>
          <p className="text-2xl text-black font-semibold">
            ${shortifyDecimals(ownedLiquidityInUSD, 5)}
          </p>
        </section>

        <hr className="mt-7" />

        <section className="mt-2 flex items-center justify-between">
          <span>Remove</span>
          <strong className="font-medium">
            ${shortifyDecimals(withdrawWingLiquidity, 5)}
          </strong>
        </section>

        <section className="mt-2.5 mb-6">
          <Slider
            value={[withdrawPercentage]}
            onValueChange={([value]) => setShowWithdrawPercentage(value)}
            max={100}
            step={1}
          />

          <div className="mt-4 text-sm font-semibold items-center gap-2 grid grid-cols-5">
            {[0, 25, 50, 75, 100].map((ratio) => {
              const isActive = withdrawPercentage === ratio

              return (
                <button
                  onClick={() => setShowWithdrawPercentage(ratio)}
                  key={`withdraw-ratio-${ratio}`}
                  className={cn(
                    "rounded-full outline-none text-center py-1 px-2",
                    isActive
                      ? "bg-black text-white"
                      : "bg-black/5 text-black/70"
                  )}
                >
                  {ratio}%
                </button>
              )
            })}
          </div>
        </section>

        <AlertDialogFooter>
          <Button onClick={handlePoolWithdraw}>Confirm</Button>
        </AlertDialogFooter>

        <p className="text-sm mt-3 -mb-3 text-center max-w-xs mx-auto text-black/50">
          <strong className="font-medium">Management fee: 3%</strong>
        </p>
      </AlertDialogContent>
    </AlertDialog>
  )
}
