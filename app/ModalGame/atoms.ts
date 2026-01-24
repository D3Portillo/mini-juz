"use client"

import { useEffect, useState } from "react"
import useSWRImmutable from "swr/immutable"

import { atomWithStorage } from "jotai/utils"
import { atomFamily } from "jotai/utils"
import { useAtom } from "jotai"
import { useLocale } from "next-intl"

import { generateQuestionsForTopic } from "@/actions/questions"
import { formatLocaleToTopicLanguage } from "@/lib/atoms/topics"

const familyAtomHistory = atomFamily((topic: string | null) =>
  atomWithStorage(
    `juz.topic.history.${topic ? topic.toLowerCase() : "VOID"}`,
    [] as string[],
  ),
)

export const useQuestionHistory = (topic: string | null) => {
  const locale = useLocale()
  const [ready, setReady] = useState(false)
  const [questionHistory, setHistory] = useAtom(familyAtomHistory(topic))

  const addQuestion = (question: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((q) => q !== question)
      return [...filtered, question].slice(-15) // Keep latest 15 questions
    })
  }

  useEffect(() => {
    setReady(Boolean(topic && locale))
  }, [topic, locale])

  return { questionHistory, ready, addQuestion }
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
  const { questionHistory, ready } = useQuestionHistory(topic || "")

  const { data, ...query } = useSWRImmutable(
    `${cacheKey}.${ready && "ready"}`,
    async (): Promise<
      Awaited<ReturnType<typeof generateQuestionsForTopic>>
    > => {
      if (!topic || !ready) return {} as any
      return await generateQuestionsForTopic(
        formatLocaleToTopicLanguage(locale),
        topic,
        config.questionCount,
        questionHistory,
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
