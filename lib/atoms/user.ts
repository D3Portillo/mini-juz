import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const atomIsExplainerConfirmed = atomWithStorage(
  "juz.atomIsExplainerConfirmed",
  false
)

/**
 * Used to know if the user has confirmed the explainer in main page
 */
export const useAtomExplainerConfirmed = () => useAtom(atomIsExplainerConfirmed)
