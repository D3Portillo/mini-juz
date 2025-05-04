import { parseAbi } from "viem"

export const KEY_BATCHED_PARTICIPANTS = "juz.batched.participants" as const
export const KEY_LEADERBOARD = "juz.leaderboard" as const

export const ADDRESS_DISPENSER =
  "0xAB4D207cEe831bD1f1a785B344c8d94252dE1967" as const

export const ABI_DISPENSER = parseAbi([
  "function claim(uint256 amount, uint256 deadline, bytes calldata signature) external",
  "function nonces(address) public view returns (uint256)",
  "function claimed(address) view returns (uint256)",
])
