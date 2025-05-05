import { ONE_YEAR_IN_BLOCK_TIME } from "./constants"

const CLIFF_DURATION = 1209600 // 2 weeks
const START_TIME = 1746321375 + CLIFF_DURATION
const END_TIME = 1777857375
const EMISSION_PERIOD = END_TIME - START_TIME
const MIN_APR = 3
const MAX_APR = 200
const BASE_APR = 100 // Locking for 1 year

/**
 * Linear APR calculation based on emisions and lock time.
 */
export function calculateAPR(lockTimeInSeconds: number): number {
  if (lockTimeInSeconds >= END_TIME) return MIN_APR

  const actualLockDuration = END_TIME - lockTimeInSeconds
  const isBeforeStart = lockTimeInSeconds < START_TIME

  let initialAPR = isBeforeStart ? BASE_APR : MIN_APR

  const ratio =
    ((isBeforeStart ? START_TIME : END_TIME) - lockTimeInSeconds) /
    EMISSION_PERIOD

  if (isBeforeStart) {
    // Boosted APR
    initialAPR += MIN_APR + ratio * (MAX_APR - BASE_APR)
  } else {
    // Regular linear APR
    initialAPR += ratio * (BASE_APR - MIN_APR)
  }

  const adjustedAPR = (initialAPR * ONE_YEAR_IN_BLOCK_TIME) / actualLockDuration
  return Math.max(MIN_APR, Math.min(adjustedAPR, MAX_APR))
}
