import {
  type Address,
  createPublicClient,
  fallback,
  http,
  parseAbi,
} from "viem"
import { worldchain } from "viem/chains"
import { TokenProvider } from "@holdstation/worldchain-sdk"
import { Client, Multicall3 } from "@holdstation/worldchain-viem"

import { ABI_DISPENSER, ADDRESS_DISPENSER } from "@/actions/internals"

import {
  ADDRESS_JUZ,
  ADDRESS_LOCK_CONTRACT,
  ADDRESS_VE_JUZ,
  ADDRESS_WORLD_COIN,
  ZERO,
} from "@/lib/constants"
import { ALCHEMY_RPC } from "@/lib/alchemy"
import { initializeHoldStation } from "@/app/HoldStationSetup/setup"

// Prepare HoldStation
initializeHoldStation()

export const worldClient = createPublicClient({
  chain: worldchain,
  transport: fallback([
    http(),
    http("https://worldchain.drpc.org"),
    http(ALCHEMY_RPC.http),
  ]),
})

export const ABI_LOCKED_JUZ = parseAbi([
  "function claimVeJUZ() public",
  "function getLockData(address) external view returns ((uint256 lockedJUZ, uint256 unlockTime, uint256 lockTime, uint256 veJUZClaimed))",
  "function getRewardData(address) external view returns (uint256 earned, uint256 claimable)",
])

export const ABI_JUZ_POOLS = parseAbi([
  "function depositWithPermit(uint256, uint256, ((address,uint256),uint256,uint256), (address,uint256), bytes, ((address,uint256),uint256,uint256), (address,uint256), bytes) external",
  "function compound() external returns (uint256 reward0, uint256 reward1)",
  "function withdraw(uint256 shares) external",
  "function addressDeposits(address user) public view returns (uint256 amount0, uint256 amount1)",
  "function addressShares(address) public view returns (uint256)",
  "function totalShares() external view returns (uint256)",
  // Used to simulate the rewards for the user
  // We need to passon the owner as account to view since its an onlyOwner function
  "function recklesslyCompound() external returns (uint256 reward0, uint256 reward1, uint256 nextClaimTime, bool isTimeLocked)",
  "function POSITION_NFT_ID() external view returns (uint256)",
  // Used to get TVL in token0 terms (need to get USD by multiplying with price)
  "function totalValueInToken0() public view returns (uint256)",
  // Get amounts in the LP position of token pair
  "function getLiquidityAmounts() public view returns (uint256 amount0, uint256 amount1)",
])

export const getClaimedJUZ = async (address: Address) => {
  return await worldClient.readContract({
    abi: ABI_DISPENSER,
    functionName: "claimed",
    address: ADDRESS_DISPENSER,
    args: [address],
  })
}

export const getTotalUserHoldings = async (
  address: Address,
  customRPCURL?: string
) => {
  const publicClient = customRPCURL
    ? createPublicClient({
        transport: http(customRPCURL),
        chain: worldchain,
      })
    : worldClient

  const tokenProvider = new TokenProvider({
    client: new Client(publicClient as any),
    multicall3: new Multicall3(publicClient as any),
  })

  const [erc20Balances, lockData] = await Promise.all([
    tokenProvider.balanceOf({
      wallet: address,
      tokens: [ADDRESS_WORLD_COIN, ADDRESS_JUZ, ADDRESS_VE_JUZ],
    }),
    worldClient.readContract({
      abi: ABI_LOCKED_JUZ,
      functionName: "getLockData",
      address: ADDRESS_LOCK_CONTRACT,
      args: [address as any],
    }),
  ])

  const WLD = erc20Balances?.[ADDRESS_WORLD_COIN]
  const JUZ = erc20Balances?.[ADDRESS_JUZ]
  const VE_JUZ = erc20Balances?.[ADDRESS_VE_JUZ]

  return {
    WLD: WLD || ZERO,
    VE_JUZ: VE_JUZ || ZERO,
    JUZ: JUZ || ZERO,
    lockedJUZ: lockData?.lockedJUZ || ZERO,
  }
}

export type Holdings = Awaited<ReturnType<typeof getTotalUserHoldings>>
