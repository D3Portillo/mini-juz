"use client"

import Image from "next/image"
import { useState } from "react"

import { FaChevronUp, FaFireAlt } from "react-icons/fa"
import { FaShieldHeart } from "react-icons/fa6"
import { GiBroom } from "react-icons/gi"

import { cn } from "@/lib/utils"
import asset_thunder from "@/assets/thunder.png"
import ReusableDialog from "./ReusableDialog"
import { isAnyModalOpen } from "@/lib/window"

export default function DialogPowerups() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <button
      onBlur={(e) => {
        // Wait for focus to be available
        const parent = e.currentTarget
        setTimeout(() => {
          if (isAnyModalOpen()) return // Don't close if any modal is open

          const current = document.activeElement
          if (parent?.isSameNode(current)) return
          if (!parent?.contains(current)) setIsOpen(false)
        })
      }}
      className={cn(
        "from-black/90",
        isOpen ? "to-black/80" : "to-black/90",
        "bg-gradient-to-b drop-shadow-lg backdrop-blur-md border-2 border-black fixed p-0.5 text-white z-[3] top-[calc(30vh+5rem)] right-2.5 rounded-full"
      )}
    >
      <button
        onClick={toggleOpen}
        className="size-8 group bg-juz-green-lime rounded-full flex items-center justify-center"
      >
        <Image
          alt=""
          className="w-6 pointer-events-none scale-110 group-active:scale-[1.07]"
          src={asset_thunder}
        />
      </button>

      {isOpen && (
        <div className="flex mt-3 flex-col items-center justify-center whitespace-nowrap gap-2">
          <ReusableDialog
            title="JUZ Booster"
            trigger={
              <div
                role="button"
                tabIndex={-1}
                className="flex flex-col items-center justify-center"
              >
                <FaFireAlt className="text-sm text-juz-orange scale-125" />
                <span className="font-bold mt-0.5 text-xs">15%</span>
              </div>
            }
          >
            <p>
              Increase the amount of JUZ to be earned by 15% for the next 10
              minutes.
            </p>
            <p>
              ⏰ Time left: <span className="font-bold">6 minutes</span>
            </p>
          </ReusableDialog>

          <ReusableDialog
            title="Last Resort"
            trigger={
              <div
                role="button"
                tabIndex={-1}
                className="flex flex-col items-center justify-center"
              >
                <FaShieldHeart className="text-sm text-emerald-300 scale-105" />
                <span className="font-bold text-xs mt-px">RDY</span>
              </div>
            }
          >
            <p>
              A shield that will protect your last heart point from being lost.
              A second chance to get the right answer without losing the game.
            </p>
          </ReusableDialog>

          <ReusableDialog
            title="The Broom"
            trigger={
              <div
                role="button"
                tabIndex={-1}
                className="flex flex-col items-center justify-center"
              >
                <GiBroom className="text-lg scale-105 text-yellow-200" />
                <span className="font-bold text-xs">10</span>
              </div>
            }
          >
            <p>
              The Broom is a powerful tool that allows you to clear 2 incorrect
              options from the list of answers, making it easier to find the
              correct one.
            </p>
          </ReusableDialog>
        </div>
      )}

      <div
        role="button"
        tabIndex={-1}
        onClick={toggleOpen}
        className={cn(
          "grid place-content-center",
          isOpen ? "py-2.5" : "py-0.5"
        )}
      >
        <FaChevronUp
          className={cn(
            "transition-transform",
            isOpen ? "rotate-0" : "rotate-180"
          )}
        />
      </div>
    </button>
  )
}
