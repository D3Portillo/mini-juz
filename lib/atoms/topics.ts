"use client"

import type { AppLocales } from "@/global"

import { useLocale } from "next-intl"
import useSWR from "swr"

import { generateTopicList, type TopicLanguage } from "@/actions/words"
import { ONE_DAY_IN_MS } from "@/lib/constants"

export const formatLocaleToTopicLanguage = (
  locale: AppLocales,
): TopicLanguage => {
  switch (locale) {
    case "es":
      return "Spanish"
    case "pt":
      return "Portuguese"
    case "fil":
      return "Filipino"
    case "en":
    default:
      return "English"
  }
}

const getStorageKey = (locale: string) => `juz.topics.${locale}`

const loadTopicsFromStorage = (locale: string): string[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(getStorageKey(locale))
    if (!stored) return []

    const { topics, timestamp } = JSON.parse(stored)
    const isStale = Date.now() - timestamp > ONE_DAY_IN_MS * 3

    return isStale ? [] : topics
  } catch {
    return []
  }
}

const saveTopicsToStorage = (locale: string, topics: string[]) => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(
      getStorageKey(locale),
      JSON.stringify({ topics, timestamp: Date.now() }),
    )
  } catch (error) {
    console.error("[Topics] Failed to save to localStorage", { error })
  }
}

export const useUserTopics = () => {
  const locale = useLocale()

  const {
    data: topics = [],
    isLoading,
    mutate,
  } = useSWR(
    ["topics", locale],
    async ([, currentLocale]) => {
      const cached = loadTopicsFromStorage(currentLocale)
      if (cached.length > 0) return cached

      console.debug(
        `[Topics] Generating new topics for locale: ${currentLocale}`,
      )

      const newTopics = await generateTopicList(
        formatLocaleToTopicLanguage(currentLocale as AppLocales),
        {
          // Omit some topics to add variability
          omitted: cached.filter(() => Math.random() > 0.7),
        },
      )

      saveTopicsToStorage(currentLocale, newTopics)
      return newTopics
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: ONE_DAY_IN_MS * 3, // 3 days
      fallbackData: loadTopicsFromStorage(locale),
    },
  )

  const gameTopics = topics.slice(0, 3) as [string, string, string]
  const isEmpty = gameTopics.length !== 3

  return {
    gameTopics,
    allTopics: topics,
    shuffleTopics: () => {
      const shuffled = [...topics].sort(() => Math.random() - 0.5)
      saveTopicsToStorage(locale, shuffled)
      mutate(shuffled, {
        revalidate: false,
      })
    },
    isReady: !isEmpty && !isLoading,
    isLoading,
    isEmpty,
  }
}
