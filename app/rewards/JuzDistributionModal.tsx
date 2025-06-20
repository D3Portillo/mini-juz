"use client"

import { Fragment, type PropsWithChildren } from "react"
import { atomWithStorage } from "jotai/utils"
import { useAtom } from "jotai"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useAccountBalances } from "@/lib/atoms/balances"
import { useWorldAuth } from "@radish-la/world-auth"
import { MiniKit } from "@worldcoin/minikit-js"
import { formatEther } from "viem"

import { shortifyDecimals } from "@/lib/numbers"
import { getDispenserPayload } from "@/actions/dispenser"
import { serializeBigint } from "@/lib/utils"
import { useHardwareType } from "@/lib/window"

import ReusableDialog from "@/components/ReusableDialog"
import { MdSwapCalls } from "react-icons/md"

import { ABI_DISPENSER, ADDRESS_DISPENSER } from "@/actions/internals"
import { ZERO } from "@/lib/constants"

const atomlastClaim = atomWithStorage("juz.canClaim", 0)
export function JUZDistributionModal({ children }: PropsWithChildren) {
  const t = useTranslations("JUZDistributionModal")
  const tglobal = useTranslations("global")
  const router = useRouter()

  const [lastClaim, setLastClaim] = useAtom(atomlastClaim)
  const { address, signIn } = useWorldAuth()
  const { toast } = useToast()
  const { isIOS } = useHardwareType()
  const { JUZToken, JUZPoints, VE_JUZ, lockedJUZ, mutate, data } =
    useAccountBalances()

  const canClaim = Date.now() - lastClaim > 7_000 // 7 seconds
  const JUZHoldings = JUZToken.balance + JUZPoints.balance
  const showClaimOnchain = canClaim && !JUZPoints.isOnchainSynced

  async function handleClaim() {
    if (!address) return signIn()
    if (!canClaim) {
      return toast.error({
        title: t("errors.waitabit"),
      })
    }

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

      // Store last claim time
      // to allow block confirmations to be processed
      // and avoid double claims
      setLastClaim(Date.now())

      toast.success({
        title: t("success.claimed", {
          amount: shortifyDecimals(formatEther(amount)),
        }),
      })
    }
  }

  return (
    <ReusableDialog
      title={t("title")}
      onClosePressed={() => {
        if (showClaimOnchain) return handleClaim()
        // Useful to know if people want to trade JUZ for WLD

        setTimeout(() => {
          // Wait for event stack to be freed
          // and open the deeplink
          router.push("/swap")
        })
      }}
      footNote={showClaimOnchain ? t("claimAvailable") : undefined}
      closeText={
        showClaimOnchain ? (
          t("claimTokens")
        ) : (
          <Fragment>
            <MdSwapCalls className="text-2xl scale-95" />
            <span className="ml-0.5">JUZ Swap</span>
          </Fragment>
        )
      }
      trigger={children}
    >
      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-green text-lg">JUZ</strong>
            <p className="text-xs opacity-75">
              {t("explainers.points", {
                isIOS: `${isIOS}`,
              })}
            </p>
          </div>
          <span className="text-xl mt-1 font-medium">
            {shortifyDecimals(formatEther(JUZHoldings), 5)}
          </span>
        </nav>
      </p>

      <p>
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-juz-orange whitespace-nowrap text-lg">
              JUZ {tglobal("locked")}
            </strong>
            <p className="text-xs opacity-75">{t("explainers.locked")}</p>
          </div>
          <span className="text-xl mt-1 font-medium">
            {shortifyDecimals(lockedJUZ.formatted, 5)}
          </span>
        </nav>
      </p>

      <p className="-mb-2">
        <nav className="flex justify-between gap-6 w-full">
          <div className="w-32">
            <strong className="text-black/70 text-lg">veJUZ</strong>
            <p className="text-xs opacity-75">{t("explainers.earned")}</p>
          </div>
          <span className="text-xl mt-1 font-medium">
            {shortifyDecimals(
              VE_JUZ.formatted,
              (VE_JUZ.formatted as any) > 1 ? 5 : 8
            )}
          </span>
        </nav>
      </p>
    </ReusableDialog>
  )
}
