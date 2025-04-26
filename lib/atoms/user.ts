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

const atomPlayerHearts = atomWithStorage("juz.totalPlayerHearts", 3)
export const usePlayerHearts = () => {
  const [hearts, setHearts] = useAtom(atomPlayerHearts)

  return {
    hearts,
    setHearts,
    removeHeart: () => setHearts((current) => Math.max(current - 1, 0)),
  }
}

export const useNextRefillTime = () => {
  const { lastUpdated } = useUserTopics()

  return {
    lastUpdated,
    nextRefill: lastUpdated + ONE_DAY_IN_MS,
  }
}
