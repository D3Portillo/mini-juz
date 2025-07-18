"use client"

import { useEffect } from "react"
import { initializeHoldStation } from "./setup"

export default function HoldStationSetup() {
  useEffect(() => initializeHoldStation(), [])

  return null
}
