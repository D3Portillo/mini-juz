"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import { FaChevronUp } from "react-icons/fa"

import { cn } from "@/lib/utils"
import { isAnyModalOpen } from "@/lib/window"

import DialogBroom from "./DialogBroom"
import DialogShield from "./DialogShield"
import DialogBooster from "./DialogBooster"

import asset_thunder from "@/assets/thunder.png"

export default function DialogPowerups() {
  // Open by default so users can see the powerups
  // and close it if they don't want to use them
  const [isOpen, setIsOpen] = useState(true)
  const toggleOpen = () => setIsOpen((prev) => !prev)

  useEffect(() => {
    if (isOpen) {
      // Try to attach focus to the dialog
      document.getElementById("dialog-powerups")?.focus()
    }
  }, [isOpen])

  return (
    <button
      id="dialog-powerups"
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
        "from-black/90 outline-none",
        isOpen ? "to-black/80" : "to-black/90",
        "bg-gradient-to-b drop-shadow-lg backdrop-blur-md border-2 border-black fixed p-0.5 text-white z-[3] top-[calc(30vh+5rem)] right-3 rounded-full"
      )}
    >
      <button
        onClick={toggleOpen}
        className="size-8 mx-auto group bg-[#e0f464] rounded-full flex items-center justify-center"
      >
        <Image
          alt=""
          className="w-6 pointer-events-none scale-110 group-active:scale-[1.07]"
          src={asset_thunder}
        />
      </button>

      {isOpen && (
        <div className="flex mt-3 flex-col whitespace-nowrap gap-2">
          <DialogBooster />
          <DialogShield />
          <DialogBroom />
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
