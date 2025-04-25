"use client"

import { useEffect, useRef, useState } from "react"

export function useTimer(timeInSeconds: number) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const start = () => {
    stop() // ensure no overlapping intervals
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - (startTimeRef.current ?? 0)) / 1000)
      if (diff >= timeInSeconds) {
        setElapsedTime(timeInSeconds)
        stop()
      } else {
        setElapsedTime(diff)
      }
    }, 250)
  }

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setElapsedTime(0)
  }

  const restart = () => {
    setElapsedTime(0)
    start()
  }

  useEffect(() => {
    start()
    return stop
  }, [timeInSeconds])

  return { elapsedTime, restart, stop }
}
