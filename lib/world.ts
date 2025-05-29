import { type Address, parseAbi } from "viem"
import { worldClient } from "./atoms/holdings"

const ADDRESS_BOOK = "0x57b930D551e677CC36e2fA036Ae2fe8FdaE0330D" as const

const ABI = parseAbi([
  "function addressVerifiedUntil(address) view returns (uint256)",
])

export const isWorldVerified = async (walletAddress: Address) => {
  try {
    const verifiedUntilResponse = await worldClient.readContract({
      address: ADDRESS_BOOK,
      abi: ABI,
      functionName: "addressVerifiedUntil",
      args: [walletAddress],
    })

    const verifiedUntil = Number(verifiedUntilResponse)

    if (Number.isFinite(verifiedUntil)) {
      const now = Math.floor(Date.now() / 1000)
      return verifiedUntil > now
    }
  } catch (_) {}

  return false
}
