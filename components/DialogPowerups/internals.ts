export const MIN_BOOST_PRICE = 0.1 // 0.1 WLD
export const MAX_BOOST_PRICE = 1.55 // 1.55 WLD
export const MIN_BOOST_PERCENT = 15 // 15%
export const MAX_BOOST_PERCENT = 150 // 150%
export const MIN_DURATION_MINUTES = 5 // 5 minutes
export const MAX_DURATION_MINUTES = 30 // 30 minutes
export const UNLOCK_BOOST_VALUE = 45 // 45% boost to get a reduced price

export function calculateBoostPriceInWLD({
  durationMinutes,
  boostPercent,
}: {
  durationMinutes: number
  boostPercent: number
}): number {
  if (durationMinutes <= 0 || boostPercent <= 0) return 0

  const clampedBoost = Math.max(
    MIN_BOOST_PERCENT,
    Math.min(boostPercent, MAX_BOOST_PERCENT)
  )
  const clampedDuration = Math.max(
    MIN_DURATION_MINUTES,
    Math.min(durationMinutes, MAX_DURATION_MINUTES)
  )

  // Normalize both to 0–1 range
  const boostRatio =
    (clampedBoost - MIN_BOOST_PERCENT) / (MAX_BOOST_PERCENT - MIN_BOOST_PERCENT)
  const durationRatio =
    (clampedDuration - MIN_DURATION_MINUTES) /
    (MAX_DURATION_MINUTES - MIN_DURATION_MINUTES)

  // Take average of both to reflect weight
  const baseRatio = (boostRatio + durationRatio) / 2

  // Linear price calculation
  let price = MIN_BOOST_PRICE + baseRatio * (MAX_BOOST_PRICE - MIN_BOOST_PRICE)

  // Apply discount if boost >= UNLOCK_BOOST_VALUE
  if (clampedBoost >= UNLOCK_BOOST_VALUE) price *= 0.95

  // Additional discount if duration >= 10min
  if (clampedDuration >= 10) price *= 0.95

  return parseFloat(price.toFixed(2))
}
