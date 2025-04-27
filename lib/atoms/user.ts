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
}

const atomHeartsRefill = atomWithStorage(
  "juz.heartsRefill",
  DEFAULT_REFILL_STATE
)

export const usePlayerHearts = () => {
  const [{ isClaimed, zeroHeartsTimestamp }, setHeartsRefill] =
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
      })
    }
  }

  const NEXT_REFILL_TIME = zeroHeartsTimestamp
    ? zeroHeartsTimestamp + ONE_DAY_IN_MS
    : 0

  return {
    refill,
    hearts,
    nextRefillTime: NEXT_REFILL_TIME < 1 ? null : NEXT_REFILL_TIME,
    canBeRefilled:
      NEXT_REFILL_TIME < 1 || isClaimed ? false : Date.now() > NEXT_REFILL_TIME,
    setHearts,
    removeHeart,
    isRefillClaimed: isClaimed,
    // Force null when invalid timestamp
    zeroHeartsTimestamp: zeroHeartsTimestamp || null,
  }
}
