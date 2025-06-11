import { createOpenAI } from "@ai-sdk/openai"

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict", // strict mode, enable when using the OpenAI API
})

export const GPT4OMini = openai("gpt-4o-mini-2024-07-18")
export const GPTO3Mini = openai("o3-mini-2025-01-31")
export const GPT41Mini = openai("gpt-4.1-mini-2025-04-14")
export const GPT41Nano = openai("gpt-4.1-nano-2025-04-14")

const getRandomModel = () => {
  // Randomly weigh the models, we prefer Mini over Nano
  const sample = Math.random()

  if (sample < 0.97) return GPT41Nano // 97%
  return GPT41Mini
}

export const getModelForTask = () => {
  const model = getRandomModel()
  return console.log({ model: model.modelId }), model
}
