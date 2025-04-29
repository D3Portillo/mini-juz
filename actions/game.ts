"use server"

import type { Address } from "viem"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

const getPlayedGameKey = (address: Address) => `juz.games.played.${address}`
const getWonGamesKey = (address: Address) => `juz.games.won.${address}`
const getJUZEarnedKey = (address: Address) => `juz.games.earned.${address}`

export const incrementGamesPlayed = async (address: Address) => {
  await redis.incr(getPlayedGameKey(address))
}

export const incrementGamesWon = async (address: Address) => {
  await redis.incr(getWonGamesKey(address))
}

export const getPlayerGameData = async (address: Address) => {
  const [gamesPlayed = 0, gamesWon = 0] = await Promise.all([
    redis.get(getPlayedGameKey(address)),
    redis.get(getWonGamesKey(address)),
  ])

  return {
    played: Number(gamesPlayed),
    won: Number(gamesWon),
  }
}

export const incrPlayerJUZEarned = async (address: Address, amount: number) => {
  await redis.incrby(getJUZEarnedKey(address), amount)
}

export const getPlayerJUZEarned = async (address: Address) => {
  const earned = await redis.get<number>(getJUZEarnedKey(address))
  return Number(earned || 0)
}
