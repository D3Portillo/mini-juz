import { TickMath, maxLiquidityForAmounts } from "@uniswap/v3-sdk"
import { parseAbi, parseUnits } from "viem"
import JSBI from "jsbi"

import { ZERO } from "./constants"
import { worldClient } from "./atoms/holdings"
import { formatUSDC } from "./tokens"

const Q96 = BigInt(
  JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96)).toString()
)

export const ABI_UNI_V3 = parseAbi([
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
])

export function getPairDepositRequired({
  amount0 = ZERO,
  amount1 = ZERO,
  sqrtPriceX96,
}: {
  amount0?: bigint
  amount1?: bigint
  sqrtPriceX96: bigint
}) {
  // Always use full range for ticks
  const sqrtLower = TickMath.getSqrtRatioAtTick(TickMath.MIN_TICK)
  const sqrtUpper = TickMath.getSqrtRatioAtTick(TickMath.MAX_TICK)

  const liquidity = maxLiquidityForAmounts(
    JSBI.BigInt(sqrtPriceX96.toString()),
    sqrtLower,
    sqrtUpper,
    amount0.toString(),
    amount1.toString(),
    false
  )

  const { amount0: required0, amount1: required1 } = getAmountsForLiquidity(
    sqrtPriceX96,
    BigInt(sqrtLower.toString()),
    BigInt(sqrtUpper.toString()),
    BigInt(liquidity.toString())
  )

  return [required0, required1]
}

function getAmountsForLiquidity(
  sqrtPriceX96: bigint,
  sqrtA: bigint,
  sqrtB: bigint,
  liquidity: bigint
): { amount0: bigint; amount1: bigint } {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA]
  if (sqrtPriceX96 <= sqrtA) {
    return {
      amount0: (liquidity * (sqrtB - sqrtA)) / ((sqrtA * sqrtB) / Q96),
      amount1: ZERO,
    }
  }

  if (sqrtPriceX96 < sqrtB) {
    return {
      amount0:
        (liquidity * (sqrtB - sqrtPriceX96)) / ((sqrtPriceX96 * sqrtB) / Q96),
      amount1: (liquidity * (sqrtPriceX96 - sqrtA)) / Q96,
    }
  }

  return {
    amount0: ZERO,
    amount1: (liquidity * (sqrtB - sqrtA)) / Q96,
  }
}

const WLD_USDC_POOL = "0x610e319b3a3ab56a0ed5562927d37c233774ba39" as const
export async function getWLDPriceinUSDC() {
  // Came up with this to reverse engineer the price of WLD in USDC
  // We get the price and get max liquidity amounts assuming the
  // top value of WLD is 1k USDC (I'd have time to update if we reach this point of 1WLD=1000USDC haha)
  const [sqrtPriceX96] = await worldClient.readContract({
    abi: ABI_UNI_V3,
    functionName: "slot0",
    address: WLD_USDC_POOL,
    args: [],
  })

  const [, amount1] = getPairDepositRequired({
    sqrtPriceX96,
    amount0: parseUnits("1", 18),
    amount1: parseUnits(
      // Lets assume for now the max value of WLD is 1k USDC
      (1_000).toString(),
      6
    ),
  })

  return Number(formatUSDC(amount1))
}
