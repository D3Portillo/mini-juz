"use client"

import { motion, type EasingDefinition } from "framer-motion"
import { cloneElement, isValidElement, Children } from "react"

const breakVariants = {
  intact: { opacity: 1, x: 0, y: 0, rotate: 0 },
  broken: (i: number) => ({
    opacity: 0,
    x: (Math.random() - 0.5) * 200,
    y: 100 + Math.random() * 100,
    rotate: (Math.random() - 0.5) * 180,
    transition: {
      duration: 0.6,
      delay: i * 0.05,
      ease: "easeOut" as EasingDefinition,
    },
  }),
}

export default function BreakEffect({
  children,
  showEffect,
}: {
  children: JSX.Element
  showEffect?: boolean
}) {
  const childArray = Children.toArray(children)

  return (
    <div className="relative inline-block">
      {childArray.map((child, i) => (
        <motion.div
          key={i}
          custom={i}
          initial="intact"
          animate={showEffect ? "broken" : "intact"}
          variants={breakVariants}
          className="absolute top-0 left-0"
        >
          {isValidElement(child) ? cloneElement(child) : child}
        </motion.div>
      ))}
    </div>
  )
}
