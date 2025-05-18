"use server"

import { getModelForTask } from "@/lib/openai"
import { generateObject } from "ai"
import { z } from "zod"

const TopicsSchema = z.object({
  topics: z.array(z.string()),
})

export const generateTopicList = async (
  lang: "English" | "Spanish",
  opts?: { omitted?: string[] }
) => {
  const { object } = await generateObject({
    model: getModelForTask(),
    schema: TopicsSchema,
    prompt: `
Generate a list of 10 single word topics in ${lang} language that can be considered "fun" or "interesting" to have trivia about.
- Must be "general knowledge" topics, not specific to any field.
- Must be topics that are not too serious or heavy.
- Remember that topmics MUST be in ${lang}
- You can include thins about crypto, blockchain but not too much or too technical.

${
  opts?.omitted
    ? `
-------------
Omit the following topics: ${opts.omitted.join(", ")}`
    : ""
}
    `,
  })

  return object.topics
}
