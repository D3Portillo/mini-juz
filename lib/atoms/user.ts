import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { ONE_DAY_IN_MS } from "@/lib/constants"
import { useUserTopics } from "./topics"

const atomIsExplainerConfirmed = atomWithStorage(
  "juz.isExplainerConfirmed",
  false
)

/**
 * Used to know if the user has confirmed the explainer in main page
 */
export const useAtomExplainerConfirmed = () => useAtom(atomIsExplainerConfirmed)

const INITIAL_PLAYER_HEARTS = 3
const atomPlayerHearts = atomWithStorage(
  "juz.totalPlayerHearts",
  INITIAL_PLAYER_HEARTS
)

const DEFAULT_REFILL_STATE = {
  zeroHeartsTimestamp: 0,
  isClaimed: false,
  isInitialState: true,
}

const atomHeartsRefill = atomWithStorage(
  "juz.heartsRefill",
  DEFAULT_REFILL_STATE
)

export const usePlayerHearts = () => {
  const [{ isClaimed, zeroHeartsTimestamp, isInitialState }, setHeartsRefill] =
    useAtom(atomHeartsRefill)
  const [hearts, setHearts] = useAtom(atomPlayerHearts)

  const removeHeart = () => setHearts((h) => Math.max(h - 1, 0))

  const refill = (opts?: { isForcedRefill?: boolean }) => {
    if (hearts < INITIAL_PLAYER_HEARTS) {
      setHearts(INITIAL_PLAYER_HEARTS)
    }

    if (!opts?.isForcedRefill) {
      setHeartsRefill({
        zeroHeartsTimestamp: Date.now(),
        isClaimed: false,
        isInitialState: false,
      })
    }
  }

  const nextRefillTime = zeroHeartsTimestamp
    ? zeroHeartsTimestamp + ONE_DAY_IN_MS
    : null

  return {
    refill,
    hearts,
    nextRefillTime,
    canBeRefilled: isClaimed
      ? false
      : (nextRefillTime && Date.now() > nextRefillTime) ||
        // Refill can be claimed if user has no hearts and
        // its first time to get cached state
        (isInitialState && hearts < 1),
    setHearts,
    removeHeart,
    isRefillClaimed: isClaimed,
    // Force null when invalid timestamp
    zeroHeartsTimestamp: zeroHeartsTimestamp || null,
  }
}
