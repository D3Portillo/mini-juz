"use server"

import { type Address, encodePacked, keccak256, parseEther } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { worldchain } from "viem/chains"
import { worldClient } from "@/lib/atoms/holdings"

import { getPlayerJUZEarned } from "./game"
import { ABI_DISPENSER, ADDRESS_DISPENSER } from "./internals"

const account = privateKeyToAccount(process.env.DEV_JUZ_PK as `0x${string}`)

export async function getDispenserPayload(address: Address) {
  const [points, nonce] = await Promise.all([
    getPlayerJUZEarned(address),
    worldClient.readContract({
      abi: ABI_DISPENSER,
      functionName: "nonces",
      address: ADDRESS_DISPENSER,
      args: [address],
    }),
  ])

  const amount = parseEther(`${points}`)
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5) // 5 minutes
  const encoded = encodePacked(
    [
      "string",
      "uint256",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
    ],
    [
      "JUZDispenser",
      BigInt(worldchain.id),
      ADDRESS_DISPENSER,
      address,
      nonce,
      amount,
      deadline,
    ]
  )

  const signature = await account.signMessage({
    message: { raw: keccak256(encoded) },
  })

  return { signature, amount, deadline }
}
