"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"

const CONTAINER_ID = "navite-ad-container"

const findAdArray = () => {
  if (typeof window === "undefined") return null
  for (let key in window) {
    if (
      key.startsWith("_0x") &&
      key.length > 15 &&
      Array.isArray((window as any)[key])
    ) {
      return key
    }
  }
  return null
}

export default function AdSquared({ className }: { className?: string }) {
  useEffect(() => {
    const container = document.getElementById(CONTAINER_ID)
    if (!container) return
    const adArrayKey = findAdArray()
    if (adArrayKey) {
      // Reset shown ads to allow re-paint
      ;(window as any)[adArrayKey] = []
    }

    const script = document.createElement("script")
    script.async = true
    script.onerror = (error) => {
      console.debug({ error })
      container.classList.add("hidden")
    }

    script.src =
      "https://pl28615357.effectivegatecpm.com/0c07767ebda0cb710ddae952ae8aa5b3/invoke.js"

    const ad = document.createElement("div")
    ad.id = "container-0c07767ebda0cb710ddae952ae8aa5b3"
    container.replaceChildren(ad, script)

    const observer = new MutationObserver(() => {
      const img = container.querySelector('[class*="__img-container"] > div')
      if (img) {
        // Ad found - show container
        container.classList.remove("hidden")
      }
    })

    observer.observe(container, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      id={CONTAINER_ID}
      className={cn(
        "p-1 hidden w-full bg-black/3 animate-in fade-in",
        className,
      )}
    />
  )
}
