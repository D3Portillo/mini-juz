export async function GET(_: Request) {
  const min = 0.008897
  const max = 0.01154

  // Stable time bucket: one value every 30 seconds
  const now = Date.now()
  const bucketMs = 30_000
  const bucketStart = Math.floor(now / bucketMs) * bucketMs

  // Deterministic pseudo-random cycle length between 2-4 minutes (ms)
  const cycleSeed = Math.floor(now / 120_000) // seed for 2min chunks
  const cycleRandom = Math.sin(cycleSeed) * 10000
  const cycleRandomComponent = cycleRandom - Math.floor(cycleRandom)
  const cycleLength = 120_000 + cycleRandomComponent * 120_000

  // Progress through the cycle (0 to 1), snapped to 30s
  const timeInCycle = bucketStart % cycleLength
  const progress = timeInCycle / cycleLength

  // Smooth wave using sine function (0 → 1 → 0)
  const wave = Math.sin(Math.PI * progress)

  // Calculate final price
  const price = parseFloat((min + wave * (max - min)).toFixed(6))

  const response = Response.json({ price })

  response.headers.set(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=29"
  )

  return response
}
