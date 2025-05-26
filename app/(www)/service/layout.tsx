"use client"

import { KEY_IS_WEBSITE_VIEW } from "@/lib/isWebsiteView"

if (typeof window !== "undefined") {
  // Set a global variable to indicate that this is the website view
  ;(window as any)[KEY_IS_WEBSITE_VIEW] = true
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
