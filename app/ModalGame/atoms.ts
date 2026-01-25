"use client"

import useSWRImmutable from "swr/immutable"
import { useLocale } from "next-intl"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { generateQuestionsForTopic, type TopicStats } from "@/actions/questions"
import { formatLocaleToTopicLanguage } from "@/lib/atoms/topics"

type HistoryStore = {
  history: Record<string, string[]>
  addQuestion: (key: string, question: string) => void
}

type StatsStore = {
  stats: Record<string, TopicStats>
  recordGame: (key: string, won: boolean) => void
}

const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: {},
      addQuestion: (key, question) =>
        set((state) => ({
          history: {
            ...state.history,
            [key]: [
              ...(state.history[key] || []).filter((q) => q !== question),
              question,
            ]
              // Take the last 15 questions only
              .slice(-15),
          },
        })),
    }),
    { name: "juz.topic.history" },
  ),
)

const useStatsStore = create<StatsStore>()(
  persist(
    (set) => ({
      stats: {},
      recordGame: (key, won) =>
        set((state) => {
          const current = state.stats[key] || { gamesPlayed: 0, gamesWon: 0 }
          return {
            stats: {
              ...state.stats,
              [key]: {
                gamesPlayed: current.gamesPlayed + 1,
                gamesWon: current.gamesWon + (won ? 1 : 0),
              },
            },
          }
        }),
    }),
    { name: "juz.topic.stats" },
  ),
)

export const useQuestionHistory = (topic: string | null) => {
  const locale = useLocale()
  const historyKey =
    topic && locale ? `${locale}.${topic.toLowerCase()}` : "VOID"

  const { history, addQuestion: add } = useHistoryStore()
  const questionHistory = history[historyKey] || []

  const addQuestion = (question: string) => add(historyKey, question)

  return { questionHistory, addQuestion }
}

export const useTopicStats = (topic: string | null) => {
  const locale = useLocale()
  const statsKey = topic && locale ? `${locale}.${topic.toLowerCase()}` : "VOID"

  const { stats, recordGame: record } = useStatsStore()
  const topicStats = stats[statsKey] || { gamesPlayed: 0, gamesWon: 0 }

  const recordGame = (won: boolean) => record(statsKey, won)

  return { stats: topicStats, recordGame }
}

export const useGameQuestions = (
  cacheKey: string | null,
  config: {
    topic?: string
    questionCount: number
  },
) => {
  const topic = config?.topic
  const locale = useLocale()
  const { questionHistory } = useQuestionHistory(topic || "")
  const { stats } = useTopicStats(topic || null)

  const { data, ...query } = useSWRImmutable(
    cacheKey,
    async (): Promise<
      Awaited<ReturnType<typeof generateQuestionsForTopic>>
    > => {
      if (!topic) return {} as any
      return await generateQuestionsForTopic(
        formatLocaleToTopicLanguage(locale),
        topic,
        config.questionCount,
        questionHistory,
        stats,
      )
    },
  )

  return {
    data: {
      questions: data?.questions || [],
      translatedTopic: data?.topic || topic,
    },
    ...query,
  }
}
