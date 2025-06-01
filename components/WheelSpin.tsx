"use client"

import { useState } from "react"
import Image from "next/image"

import { useAudioMachine } from "@/lib/sounds"
import { motion, useAnimationControls } from "framer-motion"
import { cn } from "@/lib/utils"

import asset_bg from "@/assets/spin-bg.svg"
import asset_control from "@/assets/spin-control.svg"

type SpinWheelProps = {
  size?: string | number
  enableSpin?: boolean
  items: [string, string, string]
  onItemSelected?: (item: string) => void
  onClick?: () => void
}

export default function WheelSpin({
  items,
  onClick,
  enableSpin,
  onItemSelected,
  size = 300,
}: SpinWheelProps) {
  const controls = useAnimationControls()
  const { playSound } = useAudioMachine(["bell", "wheelSpin", "failure"])

  const [isSpinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)

  const spinWheel = () => {
    if (isSpinning) return // prevent overlap
    setSpinning(true)
    playSound("wheelSpin")

    const resultIndex = Math.floor(Math.random() * 3)
    const segmentAngle = 120
    const stopAngle = 360 - resultIndex * segmentAngle

    const fullRotations = 1 + Math.floor(Math.random() * 2)
    const spinAmount = fullRotations * 360 + stopAngle
    const nextRotation = rotation + spinAmount

    setRotation(nextRotation)

    controls
      .start({
        rotate: nextRotation,
        transition: {
          duration: 3.5,
          ease: [0.22, 1, 0.36, 1], // easeOutCubic
        },
      })
      .then(() => {
        setSpinning(false)
        playSound("bell", "0.5")

        const segmentRotations = nextRotation / 60 // half segments
        const selectedIndex = Math.floor(segmentRotations) % items.length
        onItemSelected?.(items[selectedIndex])
      })
  }

  return (
    <div
      role="button"
      className="relative group select-none cursor-pointer"
      onClick={() => {
        onClick?.()

        if (enableSpin) spinWheel()
        else playSound("failure")
      }}
      style={{ width: size, height: size }}
    >
      <figure className="relative size-full object-cover">
        <div
          className={cn(
            "absolute z-1 inset-0",
            isSpinning || "group-active:scale-[0.98]"
          )}
        >
          <Image
            src={asset_control}
            style={{ objectFit: "contain" }}
            priority
            alt=""
            fill
          />
        </div>

        <motion.div
          animate={controls}
          className="absolute inset-0"
          style={{ originX: "50%", originY: "50%" }}
        >
          <Image
            src={asset_bg}
            className="bg-juz-green-ish rounded-full"
            onLoad={(e) => {
              e.currentTarget.classList.remove("bg-juz-green-ish")
              e.currentTarget.classList.remove("rounded-full")
            }}
            style={{ objectFit: "contain" }}
            priority
            alt=""
            fill
          />

          {/* Segment 1 label */}
          <div
            className="absolute capitalize text-lg font-bold text-black"
            style={{
              top: "15%",
              left: "45%",
              width: "50%",
              textAlign: "center",
              transform: "rotate(30deg)",
              textShadow:
                "-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white, 0 -2px 0 white, 0 2px 0 white, -2px 0 0 white, 2px 0 0 white",
            }}
          >
            {items[0]}
          </div>

          {/* Segment 2 label */}
          <div
            className="absolute capitalize text-lg font-bold text-black"
            style={{
              top: "75%",
              left: "45%",
              width: "50%",
              textAlign: "center",
              transform: "rotate(145deg)",
              textShadow:
                "-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white, 0 -2px 0 white, 0 2px 0 white, -2px 0 0 white, 2px 0 0 white",
            }}
          >
            {items[1]}
          </div>

          {/* Segment 3 label */}
          <div
            className="absolute capitalize text-lg font-bold text-black"
            style={{
              top: "45%",
              width: "60%",
              textAlign: "center",
              transform: "rotate(265deg) translateY(-200%)",
              textShadow:
                "-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white, 0 -2px 0 white, 0 2px 0 white, -2px 0 0 white, 2px 0 0 white",
            }}
          >
            {items[2]}
          </div>
        </motion.div>
      </figure>
    </div>
  )
}
