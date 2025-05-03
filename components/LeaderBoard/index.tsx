"use client"

import { Fragment } from "react"
import { useWorldAuth } from "@radish-la/world-auth"

import { useAccountBalances } from "@/lib/atoms/balances"
import { useLeaderboard } from "@/lib/atoms/leaderboard"
import { shortifyDecimals } from "@/lib/numbers"
import { formatUSDC } from "@/lib/tokens"

import { JUZDistributionModal } from "@/app/rewards/JuzDistributionModal"
import { useAccountData } from "@/lib/atoms/user"
import { beautifyAddress } from "@/lib/utils"

export default function LeaderBoard() {
  const { user, isConnected } = useWorldAuth()
  const { TotalJUZBalance } = useAccountBalances()
  const { data: leaderboard = [] } = useLeaderboard()

  const connectedUsername = user?.username
  const connectedUserAddress = user?.walletAddress!

  return (
    <section className="px-4 mt-4 mb-10 flex flex-col gap-2">
      <div className="flex h-12 whitespace-nowrap px-5 gap-4 font-semibold rounded-2xl border-2 shadow-3d border-black items-center bg-gradient-to-bl from-juz-green-lime to-juz-green-ish">
        <div className="w-12">#</div>
        <div className="flex-grow">User</div>
        <div className="w-24 text-end">Total JUZ</div>
      </div>

      <div className="flex w-full min-h-[calc(25vh+4rem)] flex-col gap-2">
        {leaderboard.map((player, i) => (
          <PlayerData
            points={player.total}
            address={player.address}
            key={`l-data-${player.address}`}
            position={i + 1}
          />
        ))}

        <p className="max-w-xs mt-2 text-sm mx-auto text-center">
          It can take a while to update the leaderboard. Thanks for your
          patience!
        </p>
      </div>

      {isConnected ? (
        <Fragment>
          <hr className="mt-10 mb-5" />

          <div className="p-5 gap-4 font-semibold rounded-2xl shadow-3d-lg border-3 border-black">
            <nav className="flex items-center justify-between">
              <span className="text-2xl text-juz-green">#32</span>

              <JUZDistributionModal>
                <button className="bg-juz-green-lime text-sm px-3 py-0.5 rounded-full font-semibold text-black border-2 border-black">
                  {shortifyDecimals(TotalJUZBalance.formatted, 3)} JUZ
                </button>
              </JUZDistributionModal>
            </nav>

            <nav className="flex mt-3 items-center gap-2">
              <figure className="size-8 bg-black rounded-full" />
              <h3 className="font-semibold text-xl">
                {connectedUsername ||
                  beautifyAddress(connectedUserAddress, 4, "")}{" "}
                (You)
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
  const { data = null } = useAccountData(address as any)

  return (
    <div className="flex h-14 whitespace-nowrap px-5 gap-4 font-semibold rounded-xl border-2 shadow-3d border-black items-center bg-juz-green-ish/20 even:bg-juz-green-ish/3">
      <div className="w-12">{position}</div>
      <div className="flex-grow">
        {data?.username || beautifyAddress(address, 4, "")}
      </div>
      <div className="w-24 text-end">
        {shortifyDecimals(formatUSDC(points), 3)}
      </div>
    </div>
  )
}
