"use client"

import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const DEFAULT_STATE = {
  booster: {
    isActive: false,
    /** Time booster was initialized */
    timeSet: 0,
    durationInMinutes: 0,
    /** Ratio in percentage (e.g., 15 means 15%) */
    ratioInPercentage: 0,
  },
  shields: {
    amount: 0,
  },
  broom: {
    // Broom is a consumable item, so it can be used multiple times
    // and do not requires to have a equipped state
    amount: 0,
  },
}

const atomPowerups = atomWithStorage("juz.powerups", DEFAULT_STATE)

export const usePowerups = () => {
  const [state, setState] = useAtom(atomPowerups)
  return {
    powerups: state,
  }
}
