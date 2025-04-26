"use server"

import type { Address } from "viem"
import { Redis } from "@upstash/redis"
import { INTENT_PAID, INTENT_STARTED } from "./constants"

const redis = Redis.fromEnv()

const KEY_SEPARATOR = "." as const
const getIntentKey = (address: Address, uuid: string) =>
  `juz${KEY_SEPARATOR}intents${KEY_SEPARATOR}${address}${KEY_SEPARATOR}${uuid}`

export const createPaymentIntent = async (address: Address, uuid: string) => {
  await redis.set(getIntentKey(address, uuid), INTENT_STARTED, {
    ex: 3_600, // Valid for 1 hour
  })
}

export const completePaymentIntent = async (address: Address, uuid: string) => {
  const KEY = getIntentKey(address, uuid)
  await Promise.all([
    redis.set(KEY, INTENT_PAID),
    redis.persist(KEY), // Remove expiration of 1H
  ])
}

export const isValidPaymentIntent = async (address: Address, uuid: string) => {
  return (await redis.get<number>(getIntentKey(address, uuid))) != null
}
