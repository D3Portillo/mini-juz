"use server"

import type { TopicLanguage } from "@/actions/words"
import { getModelForTask } from "@/lib/openai"
import { generateObject } from "ai"
import { z } from "zod"

const QuestionListSchema = z.object({
  topic: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
    }),
  ),
})

export type TopicStats = {
  gamesPlayed: number
  gamesWon: number
}

const DIFFICULTY_MAP = {
  1: "easy",
  2: "easy",
  3: "medium",
  4: "medium",
  5: "hard",
} as const

export const generateQuestionsForTopic = async (
  lang: TopicLanguage,
  topic: string,
  amount: number,
  history: string[] = [],
  stats?: TopicStats,
) => {
  const winRate = stats?.gamesPlayed
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0

  const difficultyPrompt = Array.from({ length: amount }, (_, i) => {
    const questionNum = i + 1
    const difficulty =
      DIFFICULTY_MAP[questionNum as keyof typeof DIFFICULTY_MAP] || "medium"
    return `- Question ${questionNum}: ${difficulty} difficulty`
  }).join("\n")

  const { object } = await generateObject({
    model: getModelForTask(),
    schema: QuestionListSchema,
    prompt: `
Generate ${amount} questions about "${topic}" with varying difficulty.

User Context:
- Games played in this topic: ${stats?.gamesPlayed || 0}
- Win rate: ${winRate}%
${winRate > 75 ? "- This user is experienced, make questions more challenging" : ""}

Difficulty Progression:
${difficultyPrompt}

Rules:
- Each question must have exactly 3 options
- There must be ONE (only 1) correct option, other 2 are incorrect
- Correct option MUST be the first element in the array
- Questions should be engaging and educational
- All content in ${lang}
- Options max 6 words each

About repeated correct answers:
Example Question: What animal is black and white?
- Correct Answer: Panda
- Incorrect Answers: Skunk, Donkey (must freaking ai will say - Zebra, but it's wrong, both Panda and Zebra are black and white, byatch!)

${
  history.length > 0
    ? `
--------------
Avoid asking the following questions or variations of them, as the user has seen them recently:
${history.map((q, i) => `${i + 1}. ${q}\n`)}

And avoid permutations in this question list - Like I don't want shit to be:
- Question to avoid: What's the longest river in the World?
- And you say: What's the worlds largest river?

Thanks.
`
    : ""
}
    `,
  })

  // The prompt wasn't giving me good "random" position results and for 3 elements
  // most of the time the "correct" option was the first one so was ass easy to get points.
  const questions = object.questions.map(({ options, question }) => {
    // Prompt has to give FIRST element as correct now
    const correctOptionContent = options[0]
    const shuffled = [...options]

    // Shuffle by swapping random pairs
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return {
      question,
      options: shuffled,
      correctOptionIndex: shuffled.indexOf(correctOptionContent),
    }
  })

  return {
    questions,
    topic: object.topic,
  }
}
