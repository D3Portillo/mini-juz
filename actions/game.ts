"use server"

import { formatEther, type Address } from "viem"
import { Redis } from "@upstash/redis"
import { getClaimedJUZ } from "@/lib/atoms/holdings"

import { KEY_BATCHED_PARTICIPANTS } from "./internals"

const redis = Redis.fromEnv()

const getPlayedGameKey = (address: Address) => `juz.games.played.${address}`
const getWonGamesKey = (address: Address) => `juz.games.won.${address}`
const getJUZEarnedKey = (address: Address) => `juz.earned.${address}`

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
  await Promise.all([
    redis.sadd(KEY_BATCHED_PARTICIPANTS, address),
    redis.incrby(getJUZEarnedKey(address), amount),
  ])
}
const normalizeJUZEarned = ({
  erc20Claimed,
  gamePoints,
}: {
  erc20Claimed: number
  gamePoints: number
}) => {
  // We subtract the JUZ tokens from points earned
  return Math.max(0, gamePoints > erc20Claimed ? gamePoints - erc20Claimed : 0)
}

export const getPlayerJUZEarned = async (address: Address) => {
  const [claimedJUZ, gamePoints] = await Promise.all([
    getClaimedJUZ(address),
    redis.get<number>(getJUZEarnedKey(address)),
  ])

  return normalizeJUZEarned({
    erc20Claimed: Number(formatEther(claimedJUZ)),
    gamePoints: gamePoints || 0,
  })
}

export const getPlayerJUZEarnedBatch = async (addresses: Address[]) => {
  const keys = addresses.map(getJUZEarnedKey)
  const pipeline = redis.pipeline()

  // Execute the batch (pipeline) and get all results
  keys.forEach((key) => pipeline.get(key))
  const results = await pipeline.exec()

  const earnedPoints: Record<Address, number> = {}

  // Process results
  await Promise.all(
    results.map(async (result: any, index) => {
      try {
        const address = addresses[index]
        const gamePoints = result as number
        earnedPoints[address] = normalizeJUZEarned({
          gamePoints,
          erc20Claimed: Number(formatEther(await getClaimedJUZ(address))),
        })
      } catch (_) {}
    })
  )

  return earnedPoints
}

export const getLeaderBoard = async () => {
  // Get the top 10 players from the leaderboard
  const leaderboard = (await redis.zrange("juz.leaderboard", 0, 10, {
    rev: true,
    withScores: true,
  })) as any[]

  const players: Array<{
    address: Address
    total: number
  }> = []

  for (let i = 0; i < leaderboard.length; i += 2) {
    const address = leaderboard[i] as Address
    const total = Number(leaderboard[i + 1])
    players.push({ address, total })
  }

  return players
}
