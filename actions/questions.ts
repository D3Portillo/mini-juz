"use server"

import { GPT4OMini, GROK3Mini } from "@/lib/openai"
import { generateObject } from "ai"
import { z } from "zod"

const QuestionListSchema = z.object({
  topic: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctOptionIndex: z.number(),
    })
  ),
})

export const generateQuestionsForTopic = async (
  lang: "English" | "Spanish",
  topic: string,
  amount: number,
  history: string[] = []
) => {
  const { object } = await generateObject({
    model: GROK3Mini,
    schema: QuestionListSchema,
    prompt: `
Generate a list of ${amount} questions about "${topic}".
- Each question should have 3 options.
- Correct option should be in the list of options.
- There can't be more than 1 correct option.
- The questions should be fun and interesting - for trivia or quiz games.
- The questions should be in ${lang}.
- Options should be in ${lang}.
- Options should be in the format: ["option1", "option2", "option3"]
- Options should be short: 6 words max.

${
  history.length > 0
    ? `
--------------
Please avoid asking the following questions:
${history.map((q, i) => `${i + 1}. ${q}\n`)}

And avoid permutations in this questions - Like I don't want shit to be:
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
  const questions = object.questions.map(
    ({ correctOptionIndex, options, question }) => {
      const correctOptionContent = options[correctOptionIndex]
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
    }
  )

  return {
    questions,
    topic: object.topic,
  }
}
