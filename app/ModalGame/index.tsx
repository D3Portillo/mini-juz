"use client"

import LemonButton from "@/components/LemonButton"
import { useTimer } from "@/lib/time"
import { cn, noOp } from "@/lib/utils"
import { Drawer, DrawerContent } from "@worldcoin/mini-apps-ui-kit-react"
import { useEffect, useRef, useState } from "react"
import { FaHeart, FaHeartBroken } from "react-icons/fa"
import { MdOutlineExitToApp } from "react-icons/md"

const TOTAL_QUESTIONS = 5
const PER_QUESTION_TIME = 10 // seconds
export default function ModalGame({
  open,
  onOpenChange,
}: Pick<React.ComponentProps<typeof Drawer>, "open" | "onOpenChange">) {
  const { elapsedTime, restart, stop } = useTimer(PER_QUESTION_TIME)

  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [heartPoints, setHeartPoints] = useState(3)
  const [isAnswered, setIsAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const audioAssets = useRef({
    success: new Audio("/success.mp3"),
    failure: new Audio("/error.mp3"),
  })

  const playAsset = (type: "success" | "failure") => {
    audioAssets.current[type].currentTime = 0 // Reset to start
    audioAssets.current[type].play().catch(noOp)
  }

  const correctOptionIndex = 1

  function handleContinue() {
    if (currentQuestion >= TOTAL_QUESTIONS) {
      // Handle game termination and success
      return onOpenChange?.(false)
    }

    if (heartPoints <= 0) {
      // Terminate game
      return onOpenChange?.(false)
    }

    restart()
    setCurrentQuestion((current) => current + 1)
    setIsAnswered(false)
    setSelectedOption(null)
  }

  useEffect(() => {
    if (open) {
      // Reset state when the modal opens
      setHeartPoints(3)
      setIsAnswered(false)
      setSelectedOption(null)
      setCurrentQuestion(1)
      restart()
    } else {
      stop()
    }
  }, [open])

  const triggerFailure = () => {
    setHeartPoints((prev) => Math.max(prev - 1, 0))
    playAsset("failure")
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-5">
        <nav className="flex justify-between items-center">
          <div className="flex text-xl items-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => {
              const isActive = index < heartPoints
              return isActive ? (
                <FaHeart
                  key={`h.active.${index}`}
                  className="text-juz-green drop-shadow"
                />
              ) : (
                <FaHeartBroken
                  key={`h.inactive.${index}`}
                  className="text-black/35"
                />
              )
            })}
          </div>

          <button onClick={() => onOpenChange?.(false)} className="text-2xl">
            <MdOutlineExitToApp />
          </button>
        </nav>

        <div className="grid place-items-center gap-4 mt-12">
          <div className="bg-juz-green-lime/10 text-sm px-3 py-0.5 rounded-full font-semibold text-black border-2 border-juz-green-lime">
            React
          </div>
          <h2 className="text-2xl min-h-[7rem] font-medium text-center">
            What is the primary purpose of the useState hook in React?
          </h2>
        </div>

        <div className="mt-12 flex gap-3 w-full flex-col">
          {[
            "To manage component state",
            "To handle side effects",
            "To create class components",
          ].map((option, itemIndex) => {
            const isCorrectOption = itemIndex === correctOptionIndex
            const isSelected = selectedOption === itemIndex
            const isWrongOption =
              (isAnswered && isSelected && !isCorrectOption) ||
              (isAnswered && selectedOption === null)
            const isCorrectAnswer = isAnswered && isSelected && isCorrectOption

            return (
              <button
                onClick={() => {
                  if (isAnswered) return

                  setIsAnswered(true)
                  setSelectedOption(itemIndex)
                  if (isCorrectOption) {
                    playAsset("success")
                  } else triggerFailure()
                }}
                key={`option-${option}`}
                className={cn(
                  "border-2 border-black",
                  "text-sm font-medium py-3 px-4 whitespace-nowrap rounded-full",
                  isCorrectAnswer &&
                    "bg-gradient-to-bl from-juz-green-ish to-juz-green-lime",
                  isWrongOption && "bg-gradient-to-bl from-juz-red/20 to-red-50"
                )}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="flex-grow" />

        {isAnswered ? (
          <LemonButton onClick={handleContinue} className="py-3 rounded-full">
            Continue
          </LemonButton>
        ) : (
          <nav className="flex flex-col gap-2">
            <div className="bg-black/3 rounded-full overflow-hidden h-3.5">
              <div
                onAnimationEnd={() => {
                  setIsAnswered(true)
                  triggerFailure()
                }}
                key={`animation-${currentQuestion}`}
                className="bar rounded-full h-full"
              >
                <style jsx scoped>
                  {`
                    .bar {
                      width: 100%;
                      background: #0dfe66;
                      animation: progress ${PER_QUESTION_TIME}s linear forwards;
                    }

                    @keyframes progress {
                      0% {
                        width: 100%;
                      }
                      70% {
                        background: #0dfe66;
                      }
                      75% {
                        background: #f26767;
                      }
                      100% {
                        background: #f73a3a;
                        width: 0%;
                      }
                    }
                  `}
                </style>
              </div>
            </div>
            <div className="flex text-sm items-center justify-between">
              <div>
                Time left: <strong>{PER_QUESTION_TIME - elapsedTime}s</strong>
              </div>
              <div>
                Progress:{" "}
                <strong>
                  {currentQuestion}/{TOTAL_QUESTIONS}
                </strong>
              </div>
            </div>
          </nav>
        )}
      </DrawerContent>
    </Drawer>
  )
}
