import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()
const KEY_BOARD_PH = "juz.price.buys"

export async function GET() {
  const cached = await redis.get(KEY_BOARD_PH)
  let data = []

  if (cached) {
    // Use cached data if available
    data = cached as any
    console.debug("Using cached data")
  } else {
    /**
     * Posthog has a rate limit of 120 queries/ hour
     * So we cache the result for 2min (120s)
     */
    const res = await fetch(
      "https://app.posthog.com/api/projects/155375/events?event=otc-swap&order=-timestamp&limit=10",
      {
        headers: {
          Authorization: `Bearer ${process.env.POSTHOG}`,
        },
      }
    )

    data = ((await res.json())?.results || []).map((event: any) => {
      return {
        timestamp: event.timestamp,
        amount: event.properties.amount,
        address: event.properties.address,
      }
    })

    if (data.length > 0) {
      // Store result in cache
      await redis.set(KEY_BOARD_PH, JSON.stringify(data), {
        ex: 120, // 120s
      })
    }
  }

  const response = Response.json(data)

  response.headers.set(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=29"
  )

  return response
}
