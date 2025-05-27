import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()
const POOL_FEES = 0.3 / 100 // 0.3% fees for Uniswap V3

const PAIR_ADDRESS = "0x494d68e3cab640fa50f4c1b3e2499698d1a173a0"
const CACHE_TIME_IN_SECONDS = 10 * 60 // 10 minutes
export async function GET(_: Request) {
  let VOLUME_HISTORY: any[] = []
  let TVL = 0

  try {
    const res = await fetch(
      "https://interface.gateway.uniswap.org/v1/graphql",
      {
        method: "POST",
        headers: {
          // Yeah, dont care about the headers
          // Will rorate agents and other headers later
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          Referer: "https://app.uniswap.org/",
          "Content-Type": "application/json",
          "_dd-custom-header-graph-ql-operation-type": "query",
          "_dd-custom-header-graph-ql-operation-name": "PoolVolumeHistory",
          Origin: "https://app.uniswap.org",
          DNT: "1",
          "Sec-GPC": "1",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          Connection: "keep-alive",
          Priority: "u=4",
          TE: "trailers",
        },
        body: JSON.stringify({
          operationName: "PoolVolumeHistory",
          variables: {
            addressOrId: PAIR_ADDRESS,
            chain: "WORLDCHAIN",
            duration: "DAY",
            isV4: false,
            isV3: true,
            isV2: false,
          },
          query: `query PoolVolumeHistory($chain: Chain!, $addressOrId: String!, $duration: HistoryDuration!, $isV4: Boolean!, $isV3: Boolean!, $isV2: Boolean!) {
      v4Pool(chain: $chain, poolId: $addressOrId) @include(if: $isV4) {
        id
        historicalVolume(duration: $duration) {
          id
          value
          timestamp
          __typename
        }
        __typename
      }
      v3Pool(chain: $chain, address: $addressOrId) @include(if: $isV3) {
        id
        historicalVolume(duration: $duration) {
          id
          value
          timestamp
          __typename
        }
        __typename
      }
      v2Pair(chain: $chain, address: $addressOrId) @include(if: $isV2) {
        id
        historicalVolume(duration: $duration) {
          id
          value
          timestamp
          __typename
        }
        __typename
      }
    }`,
        }),
      }
    )

    VOLUME_HISTORY = (await res.json())?.data?.v3Pool?.historicalVolume || []

    const TVL_CACHE_KEY = `juz.cache.apr.${PAIR_ADDRESS}`
    const cachedTVL = await redis.get<number>(TVL_CACHE_KEY)

    if (cachedTVL) {
      // Use cached TVL if available
      TVL = cachedTVL
      console.debug(`Using cached TVL: ${TVL}`)
    } else {
      const tvlR = await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/worldchain/${PAIR_ADDRESS}`
      )

      const data = (await tvlR.json()) as {
        pair: {
          liquidity: {
            usd: number
          }
        }
      }

      TVL = data.pair.liquidity.usd ?? 0

      if (TVL > 0) {
        // Store the result in cache
        await redis.set(TVL_CACHE_KEY, TVL, {
          // Expires after 15 minutes
          ex: CACHE_TIME_IN_SECONDS,
        })
      }
    }
  } catch (_) {}

  const totalDailyVolume = VOLUME_HISTORY.reduce(
    (sum: number, { value }: { value: number; timestamp: number }) =>
      sum + value,
    0
  )

  const feesEarned = totalDailyVolume * POOL_FEES
  // Fallback to totalDailyVolume if tvl is not available
  const dailyRate = feesEarned / (TVL > 0 ? TVL : totalDailyVolume)
  const annualizedRate = dailyRate * 365 * 100

  const isFallback =
    !Number.isFinite(annualizedRate) || VOLUME_HISTORY.length === 0

  const response = Response.json({
    apr: isFallback
      ? 3 // 3% fallback APR
      : annualizedRate,
    feesEarned,
    history: VOLUME_HISTORY.map(({ value, timestamp }) => ({
      value,
      timestamp,
    })),
    totalDailyVolume,
    isFallback,
  })

  response.headers.set(
    // Keep the response staled for 15 seconds
    // and revalidate it after 29 seconds
    "Cache-Control",
    "public, s-maxage=15, stale-while-revalidate=29"
  )

  return response
}
