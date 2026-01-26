import { createOpenAI } from "@ai-sdk/openai"

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict", // strict mode, enable when using the OpenAI API
})

export const GPT41Mini = openai("gpt-4.1-mini")
export const GPT41Nano = openai("gpt-4.1-nano")

const getRandomModel = () => {
  // Randomly weigh the models
  const sample = Math.random()

  if (sample < 0.15) return GPT41Nano // 15% Nano models
  return GPT41Mini
}

export const getModelForTask = () => {
  const model = getRandomModel()
  return (console.log({ model: model.modelId }), model)
}
