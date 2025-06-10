"use client"

import { Fragment } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import { formatDistanceToNow } from "date-fns"
import { useLocale, useTranslations } from "next-intl"

import { useAccountBalances } from "@/lib/atoms/balances"
import { useLeaderboard } from "@/lib/atoms/leaderboard"
import { shortifyDecimals } from "@/lib/numbers"
import { formatUSDC } from "@/lib/tokens"
import { getDateFnsLocal } from "@/lib/date-locale"

import ReusableDialog from "@/components/ReusableDialog"
import { JUZDistributionModal } from "@/app/rewards/JuzDistributionModal"
import { useAccountData, useGameRank, useProfileImage } from "@/lib/atoms/user"
import { beautifyAddress } from "@/lib/utils"
import { useAddressMote } from "@/lib/motes"

// TODO: Notifications "It's trivia time!" at least once a day
// TODO: As Duolingo add a "unlimited hearts" game item that last for 15 minutes

export default function LeaderBoard() {
  const locale = useLocale()
  const t = useTranslations("LeaderBoard")

  const { user, isConnected } = useWorldAuth()
  const { TotalJUZBalance } = useAccountBalances()
  const {
    data: { lastUpdated, leaderboard },
  } = useLeaderboard()

  const { rank } = useGameRank(user?.walletAddress || null)
  const { image } = useProfileImage()

  const connectedUsername = user?.username
  const connectedUserAddress = user?.walletAddress!
  const isEmpty = leaderboard.length <= 0

  const { mote: connectedUserMote } = useAddressMote(
    Number(TotalJUZBalance.formatted)
  )

  return (
    <section className="px-4 mt-4 mb-10 flex flex-col gap-2">
      <div className="flex h-12 whitespace-nowrap px-5 gap-4 font-semibold rounded-2xl border-2 shadow-3d border-black items-center bg-gradient-to-bl from-juz-green-lime to-juz-green-ish">
        <div className="w-10">#</div>
        <div className="flex-grow">{t("user")}</div>
        <div className="w-24 text-end">{t("totalJUZ")}</div>
      </div>

      <div className="flex w-full min-h-[calc(25vh+4rem)] flex-col gap-2">
        {isEmpty &&
          Array.from({ length: 3 }).map((_, i) => (
            <PlayerSkeleton key={`skeleton-${i}`} />
          ))}

        {leaderboard.map((player, i) => (
          <PlayerData
            points={player.total}
            address={player.address}
            key={`l-data-${player.address}`}
            position={i + 1}
          />
        ))}

        <p className="max-w-xs mt-2 text-sm mx-auto text-center">
          {lastUpdated > 0 ? (
            <Fragment>
              {t("updated")}{" "}
              <strong className="font-medium">
                {formatDistanceToNow(lastUpdated, {
                  addSuffix: true,
                  locale: getDateFnsLocal(locale),
                  includeSeconds: false,
                })}
              </strong>
              .{" "}
            </Fragment>
          ) : null}
          {t("refreshMessage")}
        </p>
      </div>

      {isConnected ? (
        <Fragment>
          <hr className="mt-10 mb-5" />

          <div className="p-5 gap-4 font-semibold rounded-2xl shadow-3d-lg border-3 border-black">
            <nav className="flex items-center">
              <span className="text-2xl text-juz-green">
                #{rank ? rank : "99+"}
              </span>

              <div className="flex-grow" />

              {connectedUserMote ? (
                <ReusableDialog
                  title={`${connectedUserMote.mote} ${connectedUserMote.emoji}`}
                  trigger={
                    <button className="text-xl px-1.5">
                      {connectedUserMote.emoji}
                    </button>
                  }
                >
                  <p>
                    You have accumulated more than{" "}
                    <strong className="whitespace-nowrap">
                      {connectedUserMote.unlockPercentage}%
                    </strong>{" "}
                    of the total supply of JUZ.
                  </p>
                </ReusableDialog>
              ) : null}

              <JUZDistributionModal>
                <button className="bg-juz-green-lime text-sm px-3 py-0.5 rounded-full font-semibold text-black border-2 border-black">
                  {shortifyDecimals(TotalJUZBalance.formatted, 3)} JUZ
                </button>
              </JUZDistributionModal>
            </nav>

            <nav className="flex mt-3 items-center gap-2.5">
              <figure
                style={{
                  backgroundImage: `url(${image})`,
                }}
                className="size-10 bg-cover bg-center bg-black/10 border-black border-2 rounded-full"
              />
              <h3 className="font-semibold text-[1.35rem]">
                {connectedUsername ||
                  beautifyAddress(connectedUserAddress, 4, "")}{" "}
                ({t("you")})
              </h3>
            </nav>
          </div>
        </Fragment>
      ) : null}
    </section>
  )
}

function PlayerData({
  position = 1,
  address,
  points,
}: {
  position?: number
  address: string
  points: number
}) {
  const POINTS = Number(formatUSDC(points))
  const { mote } = useAddressMote(POINTS)
  const { data = null } = useAccountData(address as any)

  return (
    <div className="flex h-14 whitespace-nowrap px-5 gap-4 font-semibold rounded-xl border-2 shadow-3d border-black items-center bg-juz-green-ish/20 even:bg-juz-green-ish/3">
      <div className="w-10">{position}</div>
      <div className="flex-grow">
        {data?.username || beautifyAddress(address, 4, "")}{" "}
        {mote ? (
          <ReusableDialog
            title={`${mote.mote} ${mote.emoji}`}
            trigger={
              <button className="p-1 scale-110 -translate-y-0.5 underline underline-offset-4 decoration-dashed">
                {mote.emoji}
              </button>
            }
          >
            <p>
              This player has accumulated more than{" "}
              <strong className="whitespace-nowrap">
                {mote.unlockPercentage}%
              </strong>{" "}
              of the total supply of JUZ.
            </p>
          </ReusableDialog>
        ) : null}
      </div>
      <div className="w-24 text-end">{shortifyDecimals(POINTS)}</div>
    </div>
  )
}

function PlayerSkeleton() {
  return (
    <div className="flex h-14 whitespace-nowrap px-3 gap-4 rounded-xl border-2 shadow-3d border-black items-center bg-juz-green-ish/20 even:bg-juz-green-ish/3">
      <div className="w-10 bg-black/10 h-8 rounded-lg animate-pulse" />
      <div className="flex-grow bg-black/10 delay-100 h-8 rounded-lg animate-pulse" />
    </div>
  )
}
