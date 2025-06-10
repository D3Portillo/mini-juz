"use client"

import useSWR from "swr"
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
    // Gift the user 2 shield to test out the feature
    amount: 2,
  },
  broom: {
    // Broom is a consumable item, so it can be used multiple times
    // and do not requires to have a equipped state
    amount: 2,
  },
}

const atomPowerups = atomWithStorage("juz.powerups", DEFAULT_STATE)

export const usePowerups = () => {
  const [state, setState] = useAtom(atomPowerups)

  const { booster } = state
  const { data: isBoostActive = false } = useSWR(
    `booster.${booster.timeSet}.${booster.ratioInPercentage}.${booster.durationInMinutes}`,
    () => {
      return booster.timeSet && booster.isActive
        ? booster.timeSet + booster.durationInMinutes * 60 * 1_000 > Date.now()
        : false
    },
    {
      refreshInterval: 5_000, // Check if active every 5 seconds
    }
  )

  return {
    powerups: {
      ...state,
      booster: {
        ...state.booster,
        isActive: isBoostActive,
        // Keep consistent to "active boost" state
        ratioInPercentage: isBoostActive ? booster.ratioInPercentage : 0,
      },
    },
    setState,
    consumeItem: (item: keyof typeof state) => {
      const STATE =
        item === "booster"
          ? // Reset state when consuming booster
            DEFAULT_STATE.booster
          : {
              amount: Math.max(0, state[item].amount - 1),
            }

      setState((prev) => ({
        ...prev,
        [item]: STATE,
      }))
    },
  }
}
