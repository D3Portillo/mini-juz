import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MANAGE_HEARTS_TRIGGER_ID } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateUUID = () => {
  return crypto.randomUUID().replace(/-/g, "")
}

export function noOp() {}

export function openHeartsDialog() {
  document.getElementById(MANAGE_HEARTS_TRIGGER_ID)?.click()
}
