import { useEffect, useRef } from "react"
import { noOp } from "./utils"

const ASSETS = {
  success: "/sound/success.mp3",
  failure: "/sound/error.mp3",
  wheelSpin: "/sound/spin.mp3",
  bell: "/sound/bell.mp3",
  shield: "/sound/shield.mp3",
  broom: "/sound/broom.mp3",
  slot: "/sound/slot.mp3",
  win: "/sound/win.mp3",
}

type AudioAssets = keyof typeof ASSETS
type ZeroToOneString = "0" | `0.${number}` | "1"
export const useAudioMachine = <T extends AudioAssets>(assets: Array<T>) => {
  const audioAssets = useRef(null as Record<T, HTMLAudioElement> | null)

  useEffect(() => {
    audioAssets.current = Object.fromEntries(
      assets.map((key) => {
        console.debug(`Loading audio asset: ${key}`)
        const audio = new Audio(ASSETS[key])
        audio.load() // Preload audio
        return [key, audio]
      })
    ) as any
  }, assets)

  const playSound = (type: T, volumeLevel: ZeroToOneString = "1") => {
    if (!audioAssets.current?.[type]) {
      return console.error(`Audio asset ${type} not found`)
    }

    audioAssets.current[type].volume = Number(volumeLevel) // Set volume
    audioAssets.current[type].currentTime = 0 // Reset to start
    audioAssets.current[type].play().catch(noOp)
  }

  return {
    playSound,
  }
}
