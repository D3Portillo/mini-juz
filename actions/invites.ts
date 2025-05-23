"use server"

import type { Address, Hash } from "viem"
import ProtocolKit, { hashSafeMessage } from "@safe-global/protocol-kit"
import { Redis } from "@upstash/redis"
import { getPlayerPoints, incrPlayerJUZEarned, isValidPlayer } from "./game"
import { worldchain } from "viem/chains"

const redis = Redis.fromEnv()

const getInviteKey = (sender: Address | "*", recipient: Address | "*") =>
  `${sender}.invited.${recipient}`

export const getTotalInteractions = async (account: Address) => {
  const [accepted, invited] = await Promise.all([
    redis.keys(getInviteKey("*", account)), // Someone invited me
    redis.keys(getInviteKey(account, "*")), // Invited by me
  ])

  return {
    accepted,
    invited,
    totalInterations: invited.length + accepted.length,
  }
}

export const inviteExits = async (person1: Address, person2: Address) => {
  const [personOneInvited = null, person2Invited = null] = await Promise.all([
    redis.get(getInviteKey(person1, person2)),
    redis.get(getInviteKey(person2, person1)),
  ])

  return [personOneInvited, person2Invited].some(Boolean)
}

type ClaimMessage = {
  sender: string
  deadline: number
  recipient: string
  nonce: number
  amount: number
}

const CLAIMABLE_AMOUNT = 10
export const claimFriendRewards = async ({
  message,
  signature,
}: {
  message: string
  signature: Hash
}) => {
  const formattedMessage = JSON.parse(message) as ClaimMessage | null

  const recipient = formattedMessage?.recipient as Address

  const Safe = await ProtocolKit.init({
    safeAddress: recipient,
    provider: worldchain.rpcUrls.default.http[0],
  })

  const isValidSignature = Safe.isValidSignature(
    hashSafeMessage(message),
    signature
  )

  if (!isValidSignature) {
    return errorState("InvalidSigner")
  }

  if (formattedMessage?.amount != CLAIMABLE_AMOUNT) {
    return errorState("InvalidAmount")
  }

  const nowInSeconds = Math.floor(Date.now() / 1_000)
  if (nowInSeconds > formattedMessage.deadline) {
    return errorState("InviteExpired")
  }

  // Check that gift sender has at least play a game
  const sender = formattedMessage.sender as Address

  // Can't self invite
  if (sender == recipient) {
    return errorState("CantSelfInvite")
  }

  // Can't invite same person back
  if (await inviteExits(sender, recipient)) {
    return errorState("AlreadyInvited")
  }

  const recipientPoints = (await getPlayerPoints(recipient)) || 0
  if (recipientPoints > CLAIMABLE_AMOUNT * 3) {
    // Allow people to farm at most 3-4 times the gifted JUZ
    return errorState("NotFreshRecipient")
  }

  // Must have played at least one game
  if (!(await isValidPlayer(sender))) {
    return errorState("InvalidadSender")
  }

  // Check nonce
  const nonce = (await getTotalInteractions(recipient)).totalInterations
  if (formattedMessage.nonce != nonce) {
    return errorState("InvalidNonce")
  }

  await Promise.all([
    // Store invites
    redis.set(getInviteKey(sender, recipient), nowInSeconds),

    // Disburse each one CLAIMABLE_AMOUNT in JUZ
    incrPlayerJUZEarned(sender, CLAIMABLE_AMOUNT),
    incrPlayerJUZEarned(recipient, CLAIMABLE_AMOUNT),
  ])

  return {
    success: true,
    error: null,
  }
}

const errorState = (error: string) => {
  return {
    success: false,
    error,
  }
}
