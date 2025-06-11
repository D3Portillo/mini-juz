"use client"

import { type ReactNode, useEffect } from "react"

export const Eruda = (props: { children: ReactNode }) => {
  useEffect(() => {
    if (typeof window == "undefined") return
    require("eruda").init()
  }, [])

  return <>{props.children}</>
}
