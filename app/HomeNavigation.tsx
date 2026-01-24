"use client"

import Link from "next/link"

import { useTranslations } from "next-intl"
import { useWorldAuth } from "@radish-la/world-auth"
import { useRouter } from "next/navigation"

import { useAccountBalances } from "@/lib/atoms/balances"
import { useProfileImage } from "@/lib/atoms/user"
import { numberToShortWords, shortifyDecimals } from "@/lib/numbers"

import { FaRegLemon } from "react-icons/fa"

import { JUZDistributionModal } from "@/app/rewards/JuzDistributionModal"
import LemonIcon from "@/components/LemonIcon"
import FixedTopContainer from "@/components/FixedTopContainer"

export default function HomeNavigation() {
  const router = useRouter()
  const tglobal = useTranslations("global")

  const { user, signIn, isConnected } = useWorldAuth()
  const { image } = useProfileImage()

  return (
    <FixedTopContainer className="border-b px-5 flex items-center gap-4">
      <button
        onClick={
          isConnected
            ? () => {
                // Navigate to profile page
                router.push("/profile")
              }
            : signIn
        }
        className="flex outline-none text-left items-center gap-2"
      >
        <figure
          style={{
            backgroundImage: `url(${image})`,
          }}
          className="size-10 bg-cover bg-center bg-black/3 border-2 shadow-3d-bottom border-black rounded-full overflow-hidden"
        />
        <div>
          <p className="font-semibold text-lg">
            {user?.username || "Limoncito"}
          </p>
          <p className="text-xs -mt-1">
            {isConnected ? tglobal("connected") : tglobal("connectWallet")}
          </p>
        </div>
      </button>

      <div className="flex-grow" />

      <JUZDistributionModal>
        <JUZCounter />
      </JUZDistributionModal>
    </FixedTopContainer>
  )
}

export function JUZCounter({ asLink = false, href = "", ...props }) {
  const Container = asLink ? Link : "button"

  const { TotalJUZBalance, JUZPoints } = useAccountBalances()
  const BALANCE = Number(TotalJUZBalance.formatted)

  return (
    <Container {...props} href={href} className="flex items-center gap-2">
      <LemonIcon className="size-9 relative">
        {JUZPoints.isOnchainSynced ? null : (
          <figure className="absolute -bottom-1 -right-1 size-3.5 bg-juz-green-lime border-2 border-black rounded-full" />
        )}

        <FaRegLemon className="text-xl" />
      </LemonIcon>
      <span className="text-xl font-semibold">
        {BALANCE < 1_000
          ? shortifyDecimals(BALANCE, 2)
          : numberToShortWords(BALANCE)}{" "}
        JUZ
      </span>
    </Container>
  )
}
