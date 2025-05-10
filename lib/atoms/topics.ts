"use client"

import { useAtom } from "jotai"
import { useEffect } from "react"
import { useLocale } from "next-intl"

import { atomWithStorage } from "jotai/utils"
import { SIX_HOURS_IN_MS } from "@/lib/constants"
import { generateTopicList } from "@/actions/words"

const atomUserTopics = atomWithStorage("juz.atomUserTopics", {
  topics: [] as string[],
  lastUpdated: 0,
  locale: "en",
})

let timer: NodeJS.Timeout | undefined
let timerForLocaleUpdate: NodeJS.Timeout | undefined
export const useUserTopics = () => {
  const locale = useLocale()
  const [{ lastUpdated, topics = [], locale: topicsLocale }, setData] =
    useAtom(atomUserTopics)

  async function fetchTopics() {
    console.debug("Fetching fresh topics")

    const newTopics = await generateTopicList(
      locale === "es" ? "Spanish" : "English",
      {
        omitted: topics.filter(() => {
          // Russian roulette to remove 30% of the topics
          return Math.random() > 0.7
        }),
      }
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
    if (locale != topicsLocale) {
      timerForLocaleUpdate = setTimeout(() => {
        setData({
          locale,
          lastUpdated: Date.now(),
          topics: [], // Force loading state in Spinning Wheel
        })
        fetchTopics()
      }, 200)
    }
  }, [locale, topicsLocale])

  useEffect(() => {
    clearTimeout(timer)
    // User topics are updated every 6 hours
    if (lastUpdated > Date.now() + SIX_HOURS_IN_MS || lastUpdated === 0) {
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
