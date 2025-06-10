import { useEffect } from "react"
import { useTimer } from "@/lib/time"
import { usePowerups } from "./atoms"

export default function TimeLeftVisualizer({ timeLeftInSeconds = 0 }) {
  const { elapsedTime } = useTimer(timeLeftInSeconds)
  const { consumeItem, powerups } = usePowerups()
  const timeLeft = Math.max(0, timeLeftInSeconds - elapsedTime)

  useEffect(() => {
    if (timeLeft <= 1 && powerups.booster.isActive) {
      consumeItem("booster")
    }
  }, [timeLeft])

  return (
    <div className="text-sm mt-2 -mb-2 px-1 flex items-center justify-between">
      <strong className="font-medium text-black">⏰ Time left</strong>
      <span>
        {timeLeft < 60 ? timeLeft : Math.round(timeLeft / 60)}{" "}
        {timeLeft < 60 ? "seconds" : "minute(s)"}
      </span>
    </div>
  )
}
