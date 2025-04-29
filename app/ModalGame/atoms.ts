"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"

import { atomWithStorage } from "jotai/utils"
import { atomFamily } from "jotai/utils"
import { useAtom } from "jotai"

import { generateQuestionsForTopic } from "@/actions/questions"

const familyAtomHistory = atomFamily((topic: string | null) =>
  atomWithStorage(
    `juz.topic.history.${topic ? topic.toLowerCase() : "VOID"}`,
    [] as string[]
  )
)

export const useQuestionHistory = (topic: string | null) => {
  const [ready, setReady] = useState(false)
  const [questionHistory, setHistory] = useAtom(familyAtomHistory(topic))

  const addQuestion = (question: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((q) => q !== question)
      return [...filtered, question].slice(-15) // Keep latest 15 questions
    })
  }

  useEffect(() => {
    setReady(true)
  }, [topic])

  return { questionHistory, ready, addQuestion }
}

export const useGameQuestions = (
  cacheKey: string | null,
  config: {
    topic?: string
    questionCount: number
  }
) => {
  const topic = config?.topic
  const { questionHistory, ready } = useQuestionHistory(topic || "")

  return useSWR(
    `${cacheKey}.${ready && "ready"}`,
    async () => {
      if (!topic || !ready) return []
      const questions = await generateQuestionsForTopic(
        topic,
        config.questionCount,
        questionHistory
      )
      return questions
    },
    {
      // Keep staled data until key changes
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
}
