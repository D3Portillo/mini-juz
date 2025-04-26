"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Drawer, DrawerContent } from "@worldcoin/mini-apps-ui-kit-react"
import useSWR from "swr"

import LemonButton from "@/components/LemonButton"

import { usePlayerHearts } from "@/lib/atoms/user"
import { useTimer } from "@/lib/time"
import { cn, noOp } from "@/lib/utils"

import { GiDiceTarget } from "react-icons/gi"
import { FaHeart, FaHeartBroken } from "react-icons/fa"
import { MdOutlineExitToApp } from "react-icons/md"
import { generateQuestionsForTopic } from "@/actions/questions"

const TOTAL_QUESTIONS = 5
const PER_QUESTION_TIME = 10 // seconds
export default function ModalGame({
  open,
  onOpenChange,
  topic,
}: Pick<React.ComponentProps<typeof Drawer>, "open" | "onOpenChange"> & {
  topic?: string
}) {
  const [hearts, setHearts] = usePlayerHearts()
  const { elapsedTime, restart, stop } = useTimer(PER_QUESTION_TIME)

  const gameStartedTimestamp = useMemo(() => {
    // Key used to reset question fetching and make each
    // request from same topics fresh with swr
    return Date.now()
  }, [open])

  const { data: questions = [], isLoading } = useSWR(
    open ? `questions.${topic || ""}.${gameStartedTimestamp}` : null,
    async () => {
      if (!topic) return []
      const questions = await generateQuestionsForTopic(topic, TOTAL_QUESTIONS)
      return questions
    }
  )

  const [currentQuestion, setCurrentQuestion] = useState(1)
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

  const QUESTION = questions?.[currentQuestion - 1]
  const correctOptionIndex = QUESTION?.correctOptionIndex

  function handleContinue() {
    if (currentQuestion >= TOTAL_QUESTIONS) {
      // Handle game termination and success
      return onOpenChange?.(false)
    }

    if (hearts <= 0) {
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
      setIsAnswered(false)
      setSelectedOption(null)
      setCurrentQuestion(1)
      restart()
    } else {
      stop()
    }
  }, [open])

  const triggerFailure = () => {
    setHearts((prev) => Math.max(prev - 1, 0))
    playAsset("failure")
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-5">
        <nav className="flex justify-between items-center">
          <div className="flex text-xl items-center gap-1">
            {Array.from({ length: 3 }).map((_, index) => {
              const isActive = index < hearts
              const isLastActiveHeart = index === hearts - 1

              return isActive ? (
                <FaHeart
                  key={`h.active.${index}`}
                  className={cn(
                    isLastActiveHeart && "animate-zelda-pulse",
                    "text-juz-green drop-shadow"
                  )}
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
            {topic || "General Knowledge"}
          </div>
          <h2 className="text-2xl min-h-20 font-medium text-center">
            {QUESTION?.question}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex-grow p-4 !pb-12 text-center flex flex-col items-center justify-center gap-6">
            <GiDiceTarget className="text-6xl scale-125" />

            <p className="text-sm max-w-xs">
              Buckle up! We are preparing the trivia for you...
            </p>
          </div>
        ) : (
          <div className="mt-12 flex gap-3 w-full flex-col">
            {(QUESTION?.options || []).map((option, itemIndex) => {
              const isCorrectOption = itemIndex === correctOptionIndex
              const isSelected = selectedOption === itemIndex
              const isWrongOption =
                (isAnswered && isSelected && !isCorrectOption) ||
                (isAnswered && selectedOption === null)
              const isCorrectAnswer =
                isAnswered && isSelected && isCorrectOption

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
                    isWrongOption &&
                      "bg-gradient-to-bl from-juz-red/20 to-red-50"
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex-grow" />

        {isLoading ? null : isAnswered ? (
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
