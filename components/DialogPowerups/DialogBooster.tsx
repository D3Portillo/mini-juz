import ReusableDialog from "@/components/ReusableDialog"

import { cn } from "@/lib/utils"
import { FaFireAlt } from "react-icons/fa"

import { usePowerups } from "./atoms"

export default function DialogBooster() {
  const {
    powerups: { booster },
  } = usePowerups()

  return (
    <ReusableDialog
      title="JUZ Booster"
      closeText={booster.equipped ? undefined : "Setup Booster"}
      trigger={
        <div
          role="button"
          tabIndex={-1}
          className="flex flex-col items-center justify-center"
        >
          <FaFireAlt
            className={cn(
              "text-sm scale-125",
              booster.equipped ? "text-juz-orange" : "text-white/80"
            )}
          />
          <span className="font-bold text-xs mt-0.5">
            {booster.amount * 100}%
          </span>
        </div>
      }
    >
      <p>
        Increase the amount of JUZ to be earned in the trivia game for the next
        10 minutes.
      </p>

      <p>
        ⏰ Time left: <span className="font-bold">6 minutes</span>
      </p>
    </ReusableDialog>
  )
}
