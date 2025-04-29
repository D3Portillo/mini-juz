"use server"

import { GPT4OMini } from "@/lib/openai"
import { generateObject } from "ai"
import { z } from "zod"

const QuestionListSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctOptionIndex: z.number(),
    })
  ),
})

export const generateQuestionsForTopic = async (
  topic: string,
  amount: number,
  history: string[] = []
) => {
  const { object } = await generateObject({
    model: GPT4OMini,
    schema: QuestionListSchema,
    prompt: `
Generate a list of ${amount} questions about "${topic}".
- Each question should have 3 options.
- Correct option should be in the list of options.
- The questions should be fun and interesting - for trivia or quiz games.
- The questions should be in English.
- Options should be in English.
- Options should be in the format: ["option1", "option2", "option3"]
- Options should be short: 6 words max.
- There can't be more than 1 correct answer in the options.
- The correct answer should be in the options.

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

  return object.questions
}
