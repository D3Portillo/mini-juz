import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MANAGE_HEARTS_TRIGGER_ID } from "./constants"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const beautifyAddress = (addr: string, size = 4, separator = "...") =>
  `${addr.substr(0, size)}${separator}${addr.substr(-size, size)}`

export const generateUUID = () => {
  return crypto.randomUUID().replace(/-/g, "")
}

export function noOp() {}

export function openHeartsDialog() {
  document.getElementById(MANAGE_HEARTS_TRIGGER_ID)?.click()
}

const MAX_LOCK_WEEKS = 52 // 1 year
export function calculateVeJUZ(lockAmount: number, lockWeeks: number) {
  if (lockWeeks < 2 || lockWeeks > MAX_LOCK_WEEKS) return 0
  return lockAmount * (lockWeeks / MAX_LOCK_WEEKS)
}

export const serializeBigint = (v: any): any => {
  return (
    typeof v === "bigint" || typeof v === "number"
      ? v.toString()
      : Array.isArray(v)
      ? v.map(serializeBigint)
      : v && typeof v === "object"
      ? Object.fromEntries(
          Object.entries(v).map(([k, val]) => [k, serializeBigint(val)])
        )
      : v
  ) as any
}
