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
}
