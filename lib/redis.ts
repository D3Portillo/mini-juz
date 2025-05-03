"use server"

import type { Address } from "viem"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

const getIntentKey = (address: Address, uuid: string) =>
  `juz.intents.${address}.${uuid}`

export const completePaymentIntent = async (
  address: Address,
  uuid: string,
  txId?: string
) => {
  const KEY = getIntentKey(address, uuid)
  await redis.set(KEY, txId || "NO_TX")
}

export const isValidPaymentIntent = async (address: Address, uuid: string) => {
  return (await redis.get<number>(getIntentKey(address, uuid))) != null
}
