"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"

type Sizes = "300x250" | "468x60" | "320x50"
const KEYS: Record<Sizes, string> = {
  "300x250": "235c80ec692e93d99da74945b1c71460",
  "468x60": "8bde75cbcd9a35c12a36f3de66efd22a",
  "320x50": "944aa9d47c9e32db2760f1ba7251f28c",
}

const AD_CONTAINER_ID = "ad-machine"
export default function AdMachine({
  size = "300x250",
  className,
}: {
  size?: Sizes
  className?: string
}) {
  const KEY = KEYS[size]
  const [WIDTH, HEIGHT] = size.split("x").map(Number)

  useEffect(() => {
    const container = document.getElementById(AD_CONTAINER_ID)
    if (!container) return

    // Initial ad setup + unique container
    const ad = document.createElement("div")
    ad.style = "width:100%;height:100%;"
    ad.id = "ad-" + Date.now()

    // Set options with unique container
    ;(window as any).atOptions = {
      key: KEY,
      format: "js",
      height: HEIGHT,
      width: WIDTH,
      params: {},
    }

    // Load the script (or re-execute if already loaded)
    const script = document.createElement("script")
    script.src = `https://www.highperformanceformat.com/${KEY}/invoke.js`
    script.onerror = (error) => {
      console.debug({ error })
      container.classList.add("hidden")
    }

    // Render add
    ad.replaceChildren(script)
    container.replaceChildren(ad)

    const observer = new MutationObserver(() => {
      const img = container.querySelector("img")
      if (img) {
        // Ad found - show container
        container.classList.remove("hidden")
        observer.disconnect() // Stop observing once ad is found
      }
    })

    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [KEY])

  return (
    <div
      style={{
        aspectRatio: `${WIDTH} / ${HEIGHT}`,
        width: "100%",
      }}
      id={AD_CONTAINER_ID}
      className={cn(
        "hidden overflow-hidden [&_img]:!w-full bg-black/3 animate-in fade-in",
        className,
      )}
    />
  )
}
