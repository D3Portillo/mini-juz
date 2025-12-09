import {
  getLastLeaderboardUpdate,
  getLeaderBoard,
  getTotalPlayers,
} from "@/actions/game"
import { unstable_cache } from "next/cache"

export const revalidate = 60 * 5 // 5 minutes

const cachedLeaderboard = unstable_cache(
  async () => {
    const [leaderboard, lastUpdateTime, totalPlayers] = await Promise.all([
      getLeaderBoard(),
      getLastLeaderboardUpdate(),
      getTotalPlayers(),
    ])

    return { leaderboard, lastUpdateTime, totalPlayers }
  },
  ["juz-leaderboard-v2"],
  {
    revalidate,
  }
)

export async function GET() {
  const { leaderboard, lastUpdateTime, totalPlayers } =
    await cachedLeaderboard()

  return Response.json({
    leaderboard,
    lastUpdateTime,
    totalPlayers,
  })
}
