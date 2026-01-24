"use client"

import type { AppLocales } from "@/global"

import { useAtom } from "jotai"
import { useEffect } from "react"
import { useLocale } from "next-intl"

import { generateTopicList, type TopicLanguage } from "@/actions/words"
import { atomWithStorage } from "jotai/utils"
import { ONE_DAY_IN_MS } from "@/lib/constants"

const atomUserTopics = atomWithStorage("juz.atomUserTopics", {
  topics: [] as string[],
  lastUpdated: 0,
  locale: "en",
})

let timer: NodeJS.Timeout | undefined
let timerForLocaleUpdate: NodeJS.Timeout | undefined

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

export const useUserTopics = () => {
  const locale = useLocale()
  const [{ lastUpdated, topics = [], locale: topicsLocale }, setData] =
    useAtom(atomUserTopics)

  async function fetchTopics() {
    console.debug("Fetching fresh topics")

    const newTopics = await generateTopicList(
      formatLocaleToTopicLanguage(locale),
      {
        omitted: topics.filter(() => {
          // Russian roulette to remove 30% of the topics
          return Math.random() > 0.7
        }),
      },
    )

    setData({
      locale,
      lastUpdated: Date.now(),
      topics: newTopics,
    })
  }

  useEffect(() => {
    clearTimeout(timerForLocaleUpdate)
    // Fetch new topics when changing language
    if (locale !== topicsLocale && topicsLocale !== "") {
      timerForLocaleUpdate = setTimeout(() => {
        setData({
          locale,
          lastUpdated: 0, // Reset to trigger fetch in other effect
          topics: [], // Force loading state in Spinning Wheel
        })
      }, 200)
    }
  }, [locale, topicsLocale])

  useEffect(() => {
    clearTimeout(timer)
    // User topics are updated every 3 days to reduce API calls
    const isStale =
      Date.now() - lastUpdated > ONE_DAY_IN_MS * 3 || lastUpdated === 0

    if (isStale) {
      timer = setTimeout(fetchTopics, 200)
      // 250ms delay to avoid too many requests
    }
  }, [lastUpdated])

  const gameTopics = topics.slice(0, 3) as [string, string, string]

  return {
    gameTopics,
    allTopics: topics,
    shuffleTopics: () => {
      const newTopics = topics.sort(() => Math.random() - 0.5)
      setData({
        lastUpdated,
        locale,
        // We keep same topics but shuffle them
        topics: newTopics,
      })
    },
    lastUpdated,
    isEmpty: gameTopics.length !== 3,
  }
}
