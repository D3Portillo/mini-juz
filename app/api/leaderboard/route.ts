import { getLastLeaderboardUpdate, getLeaderBoard } from "@/actions/game"
import { unstable_cache } from "next/cache"

export const revalidate = 60 * 5 // 5 minutes

const cachedLeaderboard = unstable_cache(
  async () => {
    const [leaderboard, lastUpdateTime] = await Promise.all([
      getLeaderBoard(),
      getLastLeaderboardUpdate(),
    ])

    return { leaderboard, lastUpdateTime }
  },
  ["juz-leaderboard-stuff"],
  {
    revalidate,
  }
)

export async function GET() {
  const { leaderboard, lastUpdateTime } = await cachedLeaderboard()
  return Response.json({
    leaderboard,
    lastUpdateTime,
  })
}
