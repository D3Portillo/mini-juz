import { locales } from "@/global"

export type ChangeType = "FEATURE" | "FIX" | "IMPROVEMENT"

interface Change {
  type: ChangeType
  description: Record<(typeof locales)[number], string>
}

export const CHANGELOG: Record<
  `${number}.${number}.${number}`,
  { date: `${string} ${number} ${number}`; changes: Change[] }
> = {
  "0.1.1": {
    date: "JAN 01 2025",
    changes: [
      {
        type: "FIX",
        description: {
          en: "[QUESTS] Solve issues with no-reward states and edge cases.",
          es: "[QUESTS] Se resolvieron problemas con recompensas no otorgadas.",
        },
      },
      {
        type: "FIX",
        description: {
          en: "[APP] Fixed minor issues. Performance improvements.",
          es: "[APP] Se corrigieron errores menores. Mejoras de rendimiento.",
        },
      },
      {
        type: "IMPROVEMENT",
        description: {
          en: "Extended invites reward count",
          es: "Se incrementó el total de recompensas por invitación.",
        },
      },
    ],
  },
  "0.1.2": {
    date: "JAN 22 2025",
    changes: [
      {
        type: "FIX",
        description: {
          en: "[PLAY] Fixed trivia game freezing issue on some devices.",
          es: "[PLAY] Se corrigió un problema que hacía que la trivia se congelara en algunos dispositivos.",
        },
      },

      {
        type: "FEATURE",
        description: {
          en: "[DROPS] Earn rewards from community and partner drops.",
          es: "[DROPS] Gana recompensas en mini apps de la comunidad y partners.",
        },
      },

      {
        type: "FEATURE",
        description: {
          en: "Added new quest: Trivia Master.",
          es: "Se agregó una nueva misión: Trivia Master.",
        },
      },

      {
        type: "IMPROVEMENT",
        description: {
          en: "Improved quest reward distribution logic.",
          es: "Mejorada la lógica de distribución de recompensas de misiones.",
        },
      },
    ],
  },
}
