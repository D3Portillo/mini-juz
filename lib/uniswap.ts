import { TickMath, maxLiquidityForAmounts } from "@uniswap/v3-sdk"
import JSBI from "jsbi"

import { ZERO } from "./constants"
const Q96 = BigInt(2 ** 96)

export function getPairDepositRequired({
  amount0 = ZERO,
  amount1 = ZERO,
  sqrtPriceX96,
  tickLower,
  tickUpper,
}: {
  amount0?: bigint
  amount1?: bigint
  sqrtPriceX96: bigint
  tickLower: number
  tickUpper: number
}) {
  const sqrtLower = TickMath.getSqrtRatioAtTick(tickLower)
  const sqrtUpper = TickMath.getSqrtRatioAtTick(tickUpper)
  let liquidity = maxLiquidityForAmounts(
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

export function getAmountsForLiquidity(
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
