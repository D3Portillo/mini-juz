import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const atomIsExplainerConfirmed = atomWithStorage(
  "juz.isExplainerConfirmed",
  false
)

/**
 * Used to know if the user has confirmed the explainer in main page
 */
export const useAtomExplainerConfirmed = () => useAtom(atomIsExplainerConfirmed)

const atomPlayerHearts = atomWithStorage("juz.totalPlayerHearts", 3)
export const usePlayerHearts = () => useAtom(atomPlayerHearts)
