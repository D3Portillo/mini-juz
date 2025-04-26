"use server"

import { GPT4OMini } from "@/lib/openai"
import { generateObject } from "ai"
import { z } from "zod"

const TopicsSchema = z.object({
  topics: z.array(z.string()),
})

export const generateTopicList = async (opts?: { omitted?: string[] }) => {
  const { object } = await generateObject({
    model: GPT4OMini,
    schema: TopicsSchema,
    prompt: `
Generate a lsit of 10 topics in a single word that can be considered "fun" or "interesting" to talk about.
- Must be "general knowledge" topics, not specific to any field.
- Must be topics that are not too serious or heavy.
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
