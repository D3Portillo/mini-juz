"use client"

import { useAtom } from "jotai"
import { useEffect } from "react"

import { atomWithStorage } from "jotai/utils"
import { ONE_DAY_IN_MS } from "@/lib/constants"
import { generateTopicList } from "@/actions/words"

const atomUserTopics = atomWithStorage("juz.atomUserTopics", {
  topics: [] as string[],
  lastUpdated: 0,
})

export const useUserTopics = () => {
  const [{ lastUpdated, topics }, setData] = useAtom(atomUserTopics)

  async function fetchTopics() {
    const newTopics = await generateTopicList({
      omitted: topics.filter(() => {
        // Russian roulette to remove 30% of the topics
        return Math.random() > 0.7
      }),
    })

    setData({
      lastUpdated: Date.now(),
      topics: newTopics,
    })
  }

  useEffect(() => {
    if (lastUpdated > Date.now() + ONE_DAY_IN_MS) {
      console.debug("Refreshing topics")
      fetchTopics()
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
        // We keep same topics but shuffle them
        topics: newTopics,
      })
    },
    lastUpdated,
    isEmpty: gameTopics.length !== 3,
  }
}
