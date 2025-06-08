export const usePowerups = () => {
  const powerups = {
    booster: {
      equipped: true,
      timeSet: 0, // Timestamp when the booster was set
      amount: 0.15, // 15% boost
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

  return {
    powerups,
  }
}
