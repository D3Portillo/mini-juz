"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useOnRouterBack(onRouterBack: (e: PopStateEvent) => void) {
  useEffect(() => {
    const handleRouteChange = (e: PopStateEvent) => {
      // Only call the callback if it's a back navigation
      // This is a bit of a workaround since Next.js doesn't expose history state directly
      onRouterBack(e)
    }

    window.addEventListener("popstate", handleRouteChange as any)

    return () => {
      window.removeEventListener("popstate", handleRouteChange as any)
    }
  }, [onRouterBack])
}

/**
 * Helper function to toggle the route based on the active state.
 * This is useful for modals or drawers so we have a history state
 * and can go back to the previous state.
 */
export function useToggleRouteOnActive({
  slug,
  isActive,
}: {
  slug: string
  isActive: boolean
}) {
  const router = useRouter()

  useEffect(() => {
    if (isActive) {
      router.push(location.pathname + `#${slug}`, {
        scroll: false,
      })
    } else {
      router.replace(location.pathname, {
        scroll: false,
      })
    }
  }, [isActive, slug])
}

export const getHardwareType = () => {
  const isAndroid =
    typeof window !== "undefined" &&
    ["android", "Android"].some((v) => window[v as any])

  // Optimistically set for iOS
  return { isIOS: !isAndroid, isAndroid }
}

export const useHardwareType = () => getHardwareType()
