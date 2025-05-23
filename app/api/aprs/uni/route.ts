const POOL_FEES = 0.3 / 100 // 0.3% fees for Uniswap V3
export async function GET(_: Request) {
  let result: any = {}
  let tvl = 0

  try {
    const r = await fetch("https://interface.gateway.uniswap.org/v1/graphql", {
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
          addressOrId: "0x494D68e3cAb640fa50F4c1B3E2499698D1a173A0",
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
    })

    result = await r.json()

    // TODO: Limit to 300 req / min
    // So we must cache in redis
    const tvlR = await fetch(
      "https://api.dexscreener.com/latest/dex/pairs/worldchain/0x494d68e3cab640fa50f4c1b3e2499698d1a173a0"
    )

    const data = (await tvlR.json()) as {
      pair: {
        liquidity: {
          usd: number
        }
      }
    }

    tvl = data.pair.liquidity.usd ?? 0
  } catch (_) {}

  const volumes: any[] = result.data.v3Pool.historicalVolume || []

  const totalDailyVolume = volumes.reduce(
    (sum: number, { value }: { value: number; timestamp: number }) =>
      sum + value,
    0
  )

  const feesEarned = totalDailyVolume * POOL_FEES
  // Fallback to totalDailyVolume if tvl is not available
  const dailyRate = feesEarned / (tvl ? tvl : totalDailyVolume)
  const annualizedRate = dailyRate * 365 * 100

  const isFallback = !Number.isFinite(annualizedRate) || volumes.length === 0

  return Response.json({
    apr: isFallback
      ? 3 // 3% fallback APR
      : annualizedRate,
    feesEarned,
    result,
    totalDailyVolume,
    isFallback,
  })
}
