import { createOpenAI } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict", // strict mode, enable when using the OpenAI API
})

export const GPT4OMini = openai("gpt-4o-mini-2024-07-18")
export const GPTO3Mini = openai("o3-mini-2025-01-31")
export const GROK3Mini = xai("grok-3-mini-fast-latest")
