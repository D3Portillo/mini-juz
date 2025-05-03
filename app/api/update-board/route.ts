import { parseEther, type Address } from "viem"

import { Redis } from "@upstash/redis"
import { getPlayerJUZEarnedBatch } from "@/actions/game"
import { KEY_BATCHED_PARTICIPANTS, KEY_LEADERBOARD } from "@/actions/internals"
import { getTotalUserHoldings } from "@/lib/atoms/holdings"
import { parseUSDC } from "@/lib/tokens"

const redis = Redis.fromEnv()

const STALE_WINDOW = 20 * 60 // 20 minutes
const KEY = "update-board.last-run"

export async function GET() {
  const now = Math.floor(Date.now() / 1000)
  const lastRun = (await redis.get<number>(KEY)) || 0

  let updatedRecords = 0
  if (now - lastRun > STALE_WINDOW) {
    const batched_participants = await redis.smembers(KEY_BATCHED_PARTICIPANTS)

    if (batched_participants.length > 0) {
      const participantsWithPoints = await getPlayerJUZEarnedBatch(
        batched_participants as Address[]
      )
      const participants = Object.entries(participantsWithPoints)
      const pipeline = redis.pipeline()
      await Promise.all(
        participants.map(async ([address, juzPoints]) => {
          const { JUZ, VE_JUZ, lockedJUZ } = await getTotalUserHoldings(
            address as any
          )

          const DIVIDER = BigInt(1e12)
          // Shorten to 6 decimals
          // Coming from 18 decimals
          const scaledJUZ = JUZ / DIVIDER
          const scaledVE_JUZ = VE_JUZ / DIVIDER
          const scaledLockedJUZ = lockedJUZ / DIVIDER

          const TOTAL_JUZ = scaledJUZ + scaledVE_JUZ + scaledLockedJUZ

          // We want to add a mantissa to the score
          // to avoid collisions in the leaderboard
          // since score can be float
          const score = Math.floor(Number(parseUSDC(juzPoints) + TOTAL_JUZ))

          pipeline.zadd(KEY_LEADERBOARD, {
            member: address,
            score: Number.isFinite(score) ? score : 0,
          })
        })
      )

      // Notify the number of records updated
      updatedRecords = participants.length

      await Promise.all([
        // Execute pipeline with new leaderboard
        pipeline.exec(),
        // Store new timestamp
        redis.set(KEY, now),
        // Remove the batched participants
        redis.del(KEY_BATCHED_PARTICIPANTS),
      ])
    }
  }

  return new Response(JSON.stringify({ updatedRecords }), {
    headers: {
      "Cache-Control": "s-maxage=1200, stale-while-revalidate=60",
      "Content-Type": "application/json",
    },
  })
}
