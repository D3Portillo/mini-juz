import {
  type Address,
  createPublicClient,
  erc20Abi,
  http,
  parseAbi,
} from "viem"
import { worldchain } from "viem/chains"

import { ABI_DISPENSER, ADDRESS_DISPENSER } from "@/actions/internals"

import {
  ADDRESS_JUZ,
  ADDRESS_LOCK_CONTRACT,
  ADDRESS_VE_JUZ,
  ADDRESS_WORLD_COIN,
  ZERO,
} from "@/lib/constants"

export const worldClient = createPublicClient({
  chain: worldchain,
  transport: http(),
})

export const ABI_LOCKED_JUZ = parseAbi([
  "function claimVeJUZ() public",
  "function getLockData(address) external view returns ((uint256 lockedJUZ, uint256 unlockTime, uint256 lockTime, uint256 veJUZClaimed))",
  "function getRewardData(address) external view returns (uint256 earned, uint256 claimable)",
])

export const ABI_JUZ_POOLS = parseAbi([
  "function depositWithPermit(uint256, uint256, ((address,uint256),uint256,uint256), (address,uint256), bytes, ((address,uint256),uint256,uint256), (address,uint256), bytes) external",
  "function compound() external returns (uint256 reward0, uint256 reward1)",
  "function addressShares(address) public view returns (uint256 shares)",
  "function withdraw(uint256 shares) external",
  "function totalShares() external view returns (uint256 shares)",
  // Used to simulate the rewards for the user
  // We need to passon the owner as account to view since its an onlyOwner function
  "function recklesslyCompound() external returns (uint256 reward0, uint256 reward1, uint256 nextClaimTime, bool isTimeLocked)",
  "function POSITION_NFT_ID() external view returns (uint256)",
  "function totalValueInToken0() public view returns (uint256)",
])

export const getClaimedJUZ = async (address: Address) => {
  return await worldClient.readContract({
    abi: ABI_DISPENSER,
    functionName: "claimed",
    address: ADDRESS_DISPENSER,
    args: [address],
  })
}

const ERC20_BALANCE = {
  abi: erc20Abi,
  functionName: "balanceOf",
} as const

export const getTotalUserHoldings = async (address: Address) => {
  const [WLD, JUZ, VE_JUZ, lockData] = await worldClient.multicall({
    contracts: [
      {
        ...ERC20_BALANCE,
        address: ADDRESS_WORLD_COIN,
        args: [address as any],
      },
      {
        ...ERC20_BALANCE,
        address: ADDRESS_JUZ,
        args: [address as any],
      },
      {
        ...ERC20_BALANCE,
        address: ADDRESS_VE_JUZ,
        args: [address as any],
      },
      {
        abi: ABI_LOCKED_JUZ,
        functionName: "getLockData",
        address: ADDRESS_LOCK_CONTRACT,
        args: [address as any],
      },
    ],
  })

  return {
    WLD: WLD?.result || ZERO,
    VE_JUZ: VE_JUZ?.result || ZERO,
    JUZ: JUZ?.result || ZERO,
    lockedJUZ: lockData?.result?.lockedJUZ || ZERO,
  }
}

export type Holdings = Awaited<ReturnType<typeof getTotalUserHoldings>>
