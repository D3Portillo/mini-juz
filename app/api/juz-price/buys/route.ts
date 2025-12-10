import { Redis } from "@upstash/redis"
import { unstable_cache } from "next/cache"

const redis = Redis.fromEnv()
const KEY_BOARD_PH = "juz.price.buys"

export const revalidate = 120 // 2 minutes

const getCachedPostHogData = unstable_cache(
  async () => {
    // Try Redis first
    const cached = await redis.get(KEY_BOARD_PH)
    if (cached) {
      return cached as any[]
    }

    // Fetch from PostHog
    const res = await fetch(
      "https://app.posthog.com/api/projects/155375/events?event=otc-swap&order=-timestamp&limit=10",
      {
        headers: {
          Authorization: `Bearer ${process.env.POSTHOG}`,
        },
      }
    )

    const data = ((await res.json())?.results || []).map((event: any) => ({
      timestamp: event.timestamp,
      amount: event.properties.amount,
      address: event.properties.address,
    }))

    if (data.length > 0) {
      // Expire in Redis after revalidate time
      await redis.set(KEY_BOARD_PH, JSON.stringify(data), { ex: revalidate })
    }

    return data
  },
  [KEY_BOARD_PH],
  {
    revalidate: 120,
  }
)

export async function GET() {
  const data = await getCachedPostHogData()
  return Response.json(data)
}
