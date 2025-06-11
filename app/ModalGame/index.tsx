"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Drawer,
  DrawerContent,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"

import LemonButton from "@/components/LemonButton"

import { usePlayerHearts } from "@/lib/atoms/user"
import { useTimer } from "@/lib/time"
import { cn } from "@/lib/utils"

import { GiBroom, GiDiceTarget } from "react-icons/gi"
import { MdError, MdOutlineExitToApp } from "react-icons/md"
import { FaFireAlt } from "react-icons/fa"

import { useTranslations } from "next-intl"
import { useAudioMachine } from "@/lib/sounds"
import { useIsGameActive } from "@/lib/atoms/game"
import { useGameQuestions, useQuestionHistory } from "./atoms"

import { usePowerups } from "@/components/DialogPowerups/atoms"
import HeartsVisualizer from "./HeartsVisualizer"

const TOTAL_QUESTIONS = 5
const PER_QUESTION_TIME = 15 // seconds
const DEFAULT_ITEM_STATE = {
  shields: 0,
  broom: {
    hiddenOptionIndex: -1,
  },
}

export default function ModalGame({
  open,
  onOpenChange,
  onGameWon,
  topic,
}: Pick<React.ComponentProps<typeof Drawer>, "open" | "onOpenChange"> & {
  topic?: string
  onGameWon?: (juzEarned: number) => void
}) {
  const t = useTranslations("ModalGame")

  const { addQuestion } = useQuestionHistory(topic || null)
  const { hearts, removeHeart } = usePlayerHearts()
  const { playSound } = useAudioMachine([
    "success",
    "failure",
    "broom",
    "shield",
  ])

  const { elapsedTime, restart, stop } = useTimer(PER_QUESTION_TIME)
  const [, setIsGameActive] = useIsGameActive()
  const { powerups, consumeItem } = usePowerups()

  const [usedItems, setUsedItems] = useState(DEFAULT_ITEM_STATE)
  const { toast } = useToast()

  // Used to track the total points earned
  const gameStartHeartCount = useMemo(() => hearts, [open])

  const gameStartedTimestamp = useMemo(() => {
    // Key used to reset question fetching and make each
    // request from same topics fresh with swr
    return Date.now()
  }, [open])

  // We want to allow users to claim a boosted reward
  // if they start a game with the booster active
  // and, even if the boost goes inactive during the game
  const boost = useMemo(() => powerups.booster, [open])

  const closeModal = () => {
    onOpenChange?.(false)

    // User exited or in game logic requested exit
    // So we mark the game as not ACTIVE
    setIsGameActive(false)
  }

  const {
    data: { questions, translatedTopic },
    isLoading: isFetching,
    isValidating,
    mutate,
    error: isError,
  } = useGameQuestions(
    open ? `questions.${topic || ""}.${gameStartedTimestamp}` : null,
    {
      questionCount: TOTAL_QUESTIONS,
      topic,
    }
  )

  const isLoading = isFetching || isValidating

  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [isAnswered, setIsAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const QUESTION = questions?.[currentQuestion - 1]
  const correctOptionIndex = QUESTION?.correctOptionIndex
  const isGameFinished = currentQuestion >= TOTAL_QUESTIONS

  function handleContinue() {
    // Include question to user's history
    if (QUESTION) addQuestion(QUESTION.question)

    if (isGameFinished) {
      // Handle game termination and success
      const pointsLostInGame = gameStartHeartCount - hearts
      const isGameWon = pointsLostInGame < 3 // Won if lost less than 2 hearts

      if (isGameWon) {
        const MAX_JUZ = 3
        const MIN_JUZ = 1

        const JUZ_EARNED =
          // 1 JUZ for winning and lost 2 hearts
          // 2 JUZ for losing 1 heart
          // 3 JUZ for winning without losing any heart
          Math.min(MAX_JUZ, Math.max(MIN_JUZ, MAX_JUZ - pointsLostInGame))

        onGameWon?.(
          JUZ_EARNED * (boost.isActive ? 1 + boost.ratioInPercentage / 100 : 1)
        )
      }
      return closeModal()
    }

    if (hearts <= 0) return closeModal()

    restart()
    setCurrentQuestion((current) => current + 1)
    setIsAnswered(false)
    setSelectedOption(null)

    // Reset items except for SHIELD (used once per game)
    setUsedItems({ ...usedItems, broom: { hiddenOptionIndex: -1 } })
  }

  function handleForceExit() {
    if (!isGameFinished && !isAnswered && !isError) {
      // If user exits in the middle of a game
      // Remove a heart
      removeHeart()
    }
    closeModal()
  }

  useEffect(() => {
    if (open) {
      // Reset state when the modal opens
      setIsAnswered(false)
      setSelectedOption(null)
      setCurrentQuestion(1)
      setUsedItems(DEFAULT_ITEM_STATE)
      restart()

      // Mark game as ACTIVE
      setIsGameActive(true)
    } else {
      stop()
    }
  }, [open])

  useEffect(() => {
    if (isError) playSound("failure")
  }, [isError])

  const triggerFailure = () => {
    // Shield can only be used once per game
    const canUseShield = powerups.shields.amount > 0 && usedItems.shields < 1
    if (canUseShield && hearts <= 1) {
      // Save the heart if user has shields
      consumeItem("shields")
      setUsedItems({ ...usedItems, shields: usedItems.shields + 1 })
      toast.success({
        title: "🛡️ Shield activated! Heart saved",
      })
      playSound("shield")
    } else {
      removeHeart()
      playSound("failure")
    }
  }

  function handleBroomOption() {
    if (!powerups.broom.amount) {
      return toast.error({
        title: "No brooms available",
      })
    }

    if (usedItems.broom.hiddenOptionIndex !== -1) {
      // Broom already used
      return toast.error({
        title: "Already used for this question",
      })
    }

    // Create an array of options excluding the correct one
    const options = Array.from({
      length: 3,
    })
      .map((_, index) => index)
      .filter((index) => index !== correctOptionIndex)

    // Randomly pick one of the options to hide
    const hiddenOptionIndex =
      options[Math.floor(Math.random() * options.length)]

    setUsedItems({
      ...usedItems,
      broom: {
        hiddenOptionIndex,
      },
    })

    consumeItem("broom")
    playSound("broom")

    toast.success({
      title: "🧹 Broom used! Option hidden",
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-5">
        <nav className="flex gap-5 items-center">
          <HeartsVisualizer hearts={hearts} />
          <div className="flex-grow" />

          {boost.isActive ? (
            <div className="flex items-center gap-1 justify-center">
              <FaFireAlt className="text-sm scale-125 text-juz-orange" />
              <span className="font-black text-sm scale-105">
                {boost.ratioInPercentage}%
              </span>
            </div>
          ) : null}

          <button onClick={handleForceExit} className="text-2xl">
            <MdOutlineExitToApp />
          </button>
        </nav>

        <div className="grid place-items-center gap-4 mt-12">
          {isError ? null : (
            <div className="bg-juz-green-lime/10 text-sm px-3 py-0.5 rounded-full font-semibold text-black border-2 border-juz-green-lime">
              {translatedTopic || t("generalKnowledge")}
            </div>
          )}
          <h2 className="text-2xl min-h-20 font-medium text-center">
            {QUESTION?.question}
          </h2>
        </div>

        {isError ? (
          <div className="flex-grow p-4 !pb-12 text-center flex flex-col items-center justify-center gap-6">
            <MdError className="text-7xl" />

            <p className="text-sm max-w-xs">{t("errorText")}</p>

            <button
              onClick={() => mutate({} as any)}
              className="bg-black -mt-3 text-white px-4 rounded-full py-1"
            >
              {t("retry")}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex-grow p-4 !pb-12 text-center flex flex-col items-center justify-center gap-6">
            <GiDiceTarget className="text-7xl transform animate-[bounce_3s_infinite]" />
            <p className="text-sm max-w-xs">{t("loadingText")}</p>
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

              const isBroomedOption =
                usedItems.broom.hiddenOptionIndex === itemIndex

              return (
                <button
                  onClick={() => {
                    if (isAnswered || isBroomedOption) return

                    setIsAnswered(true)
                    setSelectedOption(itemIndex)
                    if (isCorrectOption) {
                      playSound("success")
                    } else triggerFailure()
                  }}
                  key={`option-${option}`}
                  onAnimationEnd={(e) =>
                    e.currentTarget.classList.add("hidden")
                  }
                  className={cn(
                    isBroomedOption && isAnswered && "hidden",
                    isBroomedOption &&
                      "fade-out duration-500 bg-red-200 animate-out fill-mode-forwards",
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

            {isAnswered ? null : (
              <button
                onClick={handleBroomOption}
                className="flex rounded-full px-4 py-1 fixed bg-black text-white bottom-[4.5rem] right-5 items-center justify-center"
              >
                <span className="font-black text-base">
                  {powerups.broom.amount}
                </span>
                <GiBroom
                  className={cn(
                    "text-xl scale-105 translate-x-0.5",
                    powerups.broom.amount ? "text-yellow-200" : "text-white/80"
                  )}
                />
              </button>
            )}
          </div>
        )}

        <div className="flex-grow" />

        {isLoading || isError ? null : isAnswered ? (
          <LemonButton onClick={handleContinue} className="py-3 rounded-full">
            {t("continue")}
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
                {t("timeLeft")}:{" "}
                <strong>
                  {elapsedTime ? PER_QUESTION_TIME - elapsedTime : 0}s
                </strong>
              </div>
              <div>
                {t("progress")}:{" "}
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
