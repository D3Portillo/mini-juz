import { createWalletClient, http, parseAbi } from "viem"
import { ADDRESS_POOL_WLD_ETH } from "@/lib/constants"
import { worldchain } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"

const DISTRIBUTOR_ADDRESS_WORLD = "0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae"
const ABI = parseAbi([
  "function claim(address[] calldata users, address[] calldata tokens, uint256[] calldata amounts, bytes32[][] calldata proofs) external",
])

const account = privateKeyToAccount(process.env.CONTRACT_DEPLOYER_PK as any)
const walletClient = createWalletClient({
  chain: worldchain,
  account,
  transport: http(),
})

export const claimMerklRewards = async () => {
  const CHAIN_ID = worldchain.id
  const USER = ADDRESS_POOL_WLD_ETH

  const res = await fetch(
    `https://api.merkl.xyz/v4/users/${USER}/rewards?chainId=${CHAIN_ID}&breakdownPage=0&claimableOnly=true`
  )

  const data = await res.json()

  const users = []
  const tokens = []
  const amounts = []
  const proofs = []

  for (const rewards of data) {
    if (rewards.chain.id !== CHAIN_ID) continue
    for (const reward of rewards.rewards) {
      users.push(USER)
      tokens.push(reward.token.address)
      amounts.push(reward.amount)
      proofs.push(reward.proofs)
    }
  }

  if (tokens.length > 0) {
    const hash = await walletClient.writeContract({
      address: DISTRIBUTOR_ADDRESS_WORLD,
      abi: ABI,
      functionName: "claim",
      args: [users, tokens, amounts, proofs],
    })

    return {
      hash,
    }
  }

  return null
}
