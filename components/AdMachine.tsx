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

    // Create container div
    const ad = document.createElement("div")
    ad.style = "width:100%;height:100%;"
    ad.id = "ad-" + Date.now()
    container.replaceChildren(ad)

    // Set options with unique container
    ;(window as any).atOptions = {
      key: KEY,
      format: "iframe",
      height: HEIGHT,
      width: WIDTH,
      async: true,
      container: ad.id, // Each call gets unique container
      params: {},
    }

    const SCRIPT_ID = "adshi"
    // Remove previous script if any
    const prevScript = document.getElementById(SCRIPT_ID)
    if (prevScript) {
      prevScript.remove()
    }

    // Load the script (or re-execute if already loaded)
    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.src = `https://www.highperformanceformat.com/${KEY}/invoke.js`
    document.body.appendChild(script)

    const observer = new MutationObserver(() => {
      const getIframe = () => container.querySelector("iframe")
      getIframe()?.addEventListener("load", async () => {
        await new Promise((r) => setTimeout(r, 150)) // Wait a bit for content to load
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
