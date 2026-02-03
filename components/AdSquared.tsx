"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"

const AD_THROTTLE_MS = 2_500 // 2.5s
const CONTAINER_ID = "navite-ad-container"
const LAST_RENDER_KEY = "juz.adsquared.lastrender"

// Ad Config
const UNIT_CODE = "0c07767ebda0cb710ddae952ae8aa5b3"
const PLACEMENT_CODE = "pl28615357"

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

    const isAdPresent = () =>
      // Look for ad image container
      container.querySelector('[class*="__img-container"] > div')

    // Nothing to do
    if (isAdPresent()) return

    // Reset state
    container.classList.add("hidden")
    container.replaceChildren()

    const lastRender = parseInt(localStorage.getItem(LAST_RENDER_KEY) || "0")
    if (Date.now() - lastRender < AD_THROTTLE_MS) {
      return // Throttle showing ads too frequently
    }

    const adArrayKey = findAdArray()
    if (adArrayKey) {
      // Reset shown ads to allow re-paint
      ;(window as any)[adArrayKey] = []
    }

    const originalCall = window.addEventListener
    window.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type === "popstate") {
        console.debug("[AdSquared] Blocked")
        return
      }
      return originalCall.call(this, type, listener, options)
    }

    const originalPushState = history.pushState
    history.pushState = function () {
      console.debug("[AdSquared] pushState blocked")
    }

    function resetOriginalHandlers() {
      // Restore original event handlers
      window.addEventListener = originalCall
      history.pushState = originalPushState
    }

    const script = document.createElement("script")
    script.onerror = (error) => {
      resetOriginalHandlers()

      console.debug("[AdSquared] Script failed", { error })
      container.classList.add("hidden")
    }

    script.onload = () => {
      resetOriginalHandlers()
      console.debug("[AdSquared] Script loaded")
    }

    script.src = `https://${PLACEMENT_CODE}.effectivegatecpm.com/${UNIT_CODE}/invoke.js`
    const ad = document.createElement("div")
    ad.id = `container-${UNIT_CODE}`
    container.replaceChildren(ad, script)

    let debounceTimer: NodeJS.Timeout

    const observer = new MutationObserver(() => {
      console.debug("[AdSquared] Mutation observed")

      // Clear-up previous timer
      clearTimeout(debounceTimer)

      // Wait some time since last mutation
      debounceTimer = setTimeout(() => {
        if (isAdPresent()) {
          localStorage.setItem(LAST_RENDER_KEY, Date.now().toString())
          container.classList.remove("hidden")
          observer.disconnect() // Stop observing once ad is found
        }
      }, 300)
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
    })

    return () => {
      resetOriginalHandlers()
      clearTimeout(debounceTimer)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="relative w-full">
      <div className="text-black flex justify-end text-xs">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.effectivegatecpm.com/xkwvfag1?key=eb961c0b7a18270e849230b4ae6ba76b"
          className="opacity-60 p-2"
        >
          Ad
        </a>
      </div>

      {/* Global styles to override ad appearance */}
      {/* Holding all together here to make it easy to re-use :p */}
      <style global>
        {`
          #${CONTAINER_ID} [class*="__bn"] {
            max-width: none !important;
          }

          #${CONTAINER_ID} [class*="__img-container"] {
            border-radius: 1rem !important;
          }

          #${CONTAINER_ID} [class*="__cancel-btn"] {
            display: none !important;
          }

          #${CONTAINER_ID} [class*="__bn-container"] {
            padding: 0.5rem !important;
          }

          #${CONTAINER_ID} [class*="__link"] {
            z-index: 0 !important;
          }

          #${CONTAINER_ID} [class*="__title"] {
            pointer-events: none !important;
          }

          #${CONTAINER_ID} [class*="__stand"] {
            flex-flow: nowrap !important;
          }
        `}
      </style>

      <div
        id={CONTAINER_ID}
        className={cn("hidden AdSquared w-full animate-in fade-in", className)}
      />
    </div>
  )
}
