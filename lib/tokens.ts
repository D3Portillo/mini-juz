import { formatUnits, parseUnits } from "viem"

export const formatUSDC = (value: number | bigint) => {
  return parseUnits(value.toString(), 6)
}

export const parseUSDC = (value: number | bigint) => {
  return formatUnits(BigInt(value), 6)
}
