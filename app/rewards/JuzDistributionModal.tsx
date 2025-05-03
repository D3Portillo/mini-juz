"use client"

import type { PropsWithChildren } from "react"

import { MiniKit } from "@worldcoin/minikit-js"
import { formatEther } from "viem"
import { shortifyDecimals } from "@/lib/numbers"
import { getDispenserPayload } from "@/actions/dispenser"
import { serializeBigint } from "@/lib/utils"

import ReusableDialog from "@/components/ReusableDialog"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useAccountBalances } from "@/lib/atoms/balances"
import { useWorldAuth } from "@radish-la/world-auth"
import { ABI_DISPENSER, ADDRESS_DISPENSER } from "@/actions/internals"
import { ZERO } from "@/lib/constants"

export function JUZDistributionModal({ children }: PropsWithChildren) {
  const { user, signIn } = useWorldAuth()
  const { toast } = useToast()
  const { JUZToken, JUZPoints, VE_JUZ, lockedJUZ, mutate, data } =
    useAccountBalances()

  const JUZHoldings = JUZToken.balance + JUZPoints.balance
  const showClaimOnchain = !JUZPoints.isOnchainSynced

  async function handleClaim() {
    const address = user?.walletAddress
    if (!address) return signIn()
    const { amount, deadline, signature } = await getDispenserPayload(address)
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          abi: ABI_DISPENSER,
          address: ADDRESS_DISPENSER,
          functionName: "claim",
          args: serializeBigint([amount, deadline, signature]),
        },
      ],
    })

    if (finalPayload.status === "success") {
      mutate(
        {
          ...data,
          // Optimistically sum-up balances as tokens in frontend
          JUZToken: JUZHoldings,
          // Remove JUZPoints to avoid re-claiming
          JUZPoints: ZERO,
        },
        {
          revalidate: false,
        }
      )

      toast.success({
        title: `Yaay. ${shortifyDecimals(formatEther(amount))} JUZ claimed!`,
      })
    }
  }

  return (
    <ReusableDialog
      title="JUZ Breakdown"
      onClosePressed={() => {
        if (showClaimOnchain) handleClaim()
      }}
      footNote={
        showClaimOnchain ? "You have JUZ Tokens available to claim" : undefined
      }
      closeText={showClaimOnchain ? "Claim tokens" : "Got it"}
      trigger={children}
    >
      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-green text-lg">JUZ</strong>
            <p className="text-xs opacity-75">Trivia earned + ERC20 Tokens</p>
          </div>
          <span className="text-xl mt-1 font-medium">
            {shortifyDecimals(formatEther(JUZHoldings))}
          </span>
        </nav>
      </p>

      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-orange text-lg">JUZ Locked</strong>
            <p className="text-xs opacity-75">Balance locked in pools</p>
          </div>
          <span className="text-xl mt-1 font-medium">
            {shortifyDecimals(lockedJUZ.formatted)}
          </span>
        </nav>
      </p>

      <p className="-mb-2">
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-black/70 text-lg">veJUZ</strong>
            <p className="text-xs opacity-75">
              Rewards claimed for JUZ locking
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
