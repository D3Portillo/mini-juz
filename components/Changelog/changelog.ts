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
          pt: " [QUESTS] Resolvidos problemas com estados sem recompensas.",
          fil: "[QUESTS] Naayos ang mga isyu sa mga estado na walang gantimpala.",
        },
      },
      {
        type: "FIX",
        description: {
          en: "[APP] Fixed minor issues. Performance improvements.",
          es: "[APP] Se corrigieron errores menores. Mejoras de rendimiento.",
          pt: "[APP] Corrigidos problemas menores. Melhorias de desempenho.",
          fil: "[APP] Naayos ang mga maliliit na isyu. Mga pagpapabuti sa pagganap.",
        },
      },
      {
        type: "IMPROVEMENT",
        description: {
          en: "Extended invites reward count",
          es: "Se incrementó el total de recompensas por invitación.",
          pt: "Contagem de recompensas por convite estendida",
          fil: "Pinalawak ang bilang ng gantimpala sa mga imbitasyon.",
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
          pt: "[PLAY] Corrigido problema de congelamento do jogo de trivia em alguns dispositivos.",
          fil: "[PLAY] Naayos ang isyu ng pag-freeze ng trivia game sa ilang mga device.",
        },
      },

      {
        type: "FEATURE",
        description: {
          en: "[DROPS] Earn rewards from community and partner drops.",
          es: "[DROPS] Gana recompensas en mini apps de la comunidad y partners.",
          pt: "[DROPS] Ganhe recompensas em mini apps da comunidade e parceiros.",
          fil: "[DROPS] Kumita ng mga gantimpala mula sa mga community at partner drops.",
        },
      },

      {
        type: "FEATURE",
        description: {
          en: "Added new quest: Trivia Master.",
          es: "Se agregó una nueva misión: Trivia Master.",
          pt: "Nova missão adicionada: Mestre da Trivia.",
          fil: "Nagdagdag ng bagong quest: Trivia Master.",
        },
      },

      {
        type: "IMPROVEMENT",
        description: {
          en: "Improved quest reward distribution logic.",
          es: "Mejorada la lógica de distribución de recompensas de misiones.",
          pt: "Lógica de distribuição de recompensas de missões aprimorada.",
          fil: "Pinahusay ang lohika ng pamamahagi ng gantimpala sa quest.",
        },
      },
    ],
  },
}
