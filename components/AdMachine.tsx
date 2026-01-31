"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"

type Sizes = "300x250" | "468x60" | "320x50"
const KEYS: Record<Sizes, string> = {
  "300x250": "235c80ec692e93d99da74945b1c71460",
  "468x60": "8bde75cbcd9a35c12a36f3de66efd22a",
  "320x50": "944aa9d47c9e32db2760f1ba7251f28c",
}

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
    const container = document.getElementById("ad-machine")
    if (!container) return

    // Initial ad setup + unique container
    const ad = document.createElement("div")
    ad.style = "width:100%;height:100%;"
    ad.id = "ad-" + Date.now()

    // Set options with unique container
    ;(window as any).atOptions = {
      key: KEY,
      format: "iframe",
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
    ad.appendChild(script)
    container.replaceChildren(ad)

    // Wait for iframe to load and adjust styles
    const getIframe = () => container.querySelector("iframe")
    const observer = new MutationObserver(() => {
      getIframe()?.addEventListener("load", async () => {
        // Wait a sec for the ad to render
        await new Promise((resolve) => setTimeout(resolve, 250))
        const iframe = getIframe()
        const iframeDoc = iframe?.contentDocument
        if (!iframeDoc) return

        const STYLE = "width:100%; height:100%"

        iframe.style = STYLE
        const img = iframeDoc?.body?.querySelector("img")
        if (img) {
          img.style = STYLE
          container.classList.remove("hidden")
        }
      })
    })

    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [KEY])

  return (
    <div
      id="ad-machine"
      style={{
        aspectRatio: `${WIDTH} / ${HEIGHT}`,
        width: "100%",
      }}
      className={cn("hidden bg-black/3 animate-in fade-in", className)}
    />
  )
}
