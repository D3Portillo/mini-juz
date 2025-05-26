"use client"

export const KEY_IS_WEBSITE_VIEW = "__isWebsiteView"

/**
 * `true` when inside `www` grouped route.
 */
export const isWebsiteView = () => {
  if (typeof window === "undefined") return false
  return Boolean((window as any)[KEY_IS_WEBSITE_VIEW])
}
