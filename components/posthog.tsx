"use client"

import { useEffect } from "react"

import posthog, { type Properties } from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"

type PostHogEvents =
  | "locked-JUZ" // added
  | "topic-selected" // added
  | "heart-refilled" // added
  | "updated-locale" // added
  | "invite-accepted" // added
  | "otc-swap" // added
  | "owned-powerup" // added

export const trackEvent = (
  event: PostHogEvents,
  properties?: Record<string, any>
) => {
  if (typeof window !== "undefined" && posthog) {
    posthog.capture(event, properties)
  }
}

export const trackError = (error: Error, extra?: Properties) => {
  if (typeof window !== "undefined" && posthog) {
    // Only capture in client-side
    posthog.captureException(error, extra)
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_pageleave: false,
      capture_dead_clicks: false,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
