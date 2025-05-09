"use client"

import Link from "next/link"

import { useTranslations } from "next-intl"
import { useWorldAuth } from "@radish-la/world-auth"
import { useRouter } from "next/navigation"

import { FaRegLemon } from "react-icons/fa"

import LemonIcon from "@/components/LemonIcon"
import MainSelect from "@/components/MainSelect"
import { useAccountBalances } from "@/lib/atoms/balances"
import { shortifyDecimals } from "@/lib/numbers"
import FixedTopContainer from "@/components/FixedTopContainer"

export default function HomeNavigation() {
  const router = useRouter()
  const t = useTranslations("HomeNavigation")
  const tglobal = useTranslations("global")

  const { user, signIn, signOut, isConnected } = useWorldAuth()

  const PROFILE = (
    <button
      onClick={isConnected ? undefined : signIn}
      className="flex outline-none text-left items-center gap-2"
    >
      <figure
        style={{
          backgroundImage: `url(${user?.profilePictureUrl || "/marble.png"})`,
        }}
        className="size-10 bg-cover bg-center bg-black/3 border-2 shadow-3d-bottom border-black rounded-full overflow-hidden"
      />
      <div>
        <p className="font-semibold text-lg">{user?.username || "Limoncito"}</p>
        <p className="text-xs -mt-1">
          {isConnected ? t("disconnect") : tglobal("connectWallet")}
        </p>
      </div>
    </button>
  )

  return (
    <FixedTopContainer className="border-b px-5 flex items-center gap-4">
      {isConnected ? (
        <MainSelect
          value="NONE" // Dummy value to trigger the select
          showSelectedItem={false}
          onValueChange={(value) => {
            if (value === "disconnect") {
              signOut()
            } else router.push("/profile")
          }}
          options={[
            {
              label: t("manageProfile"),
              value: "profile",
            },
            {
              label: t("disconnect"),
              value: "disconnect",
            },
          ]}
        >
          {PROFILE}
        </MainSelect>
      ) : (
        PROFILE
      )}

      <div className="flex-grow" />
      <JUZCounter asLink href="/rewards" />
    </FixedTopContainer>
  )
}

export function JUZCounter({ asLink = false, href = "", ...props }) {
  const { TotalJUZBalance, JUZPoints } = useAccountBalances()
  const Container = asLink ? Link : "button"

  return (
    <Container {...props} href={href} className="flex items-center gap-2">
      <LemonIcon className="size-9 relative">
        {JUZPoints.isOnchainSynced ? null : (
          <figure className="absolute -bottom-1 -right-1 size-3.5 bg-juz-green-lime border-2 border-black rounded-full" />
        )}

        <FaRegLemon className="text-xl" />
      </LemonIcon>
      <span className="text-xl font-semibold">
        {shortifyDecimals(TotalJUZBalance.formatted, 2)} JUZ
      </span>
    </Container>
  )
}
