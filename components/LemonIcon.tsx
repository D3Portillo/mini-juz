import { cn } from "@/lib/utils"
import type { PropsWithChildren } from "react"

export default function LemonIcon({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <figure
      className={cn(
        "size-10 shadow-3d border-2 text-black border-black rounded-full relative grid place-items-center",
        className
      )}
    >
      <div className="absolute z-1 inset-0 grid place-items-center">
        {children}
      </div>
      <svg
        className="object-cover"
        viewBox="0 0 60 61"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="30" cy="30.5" r="30" fill="url(#paint0_linear_391_472)" />
        <defs>
          <linearGradient
            id="paint0_linear_391_472"
            x1="7.5"
            y1="31.5714"
            x2="37.5539"
            y2="12.2508"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00FF60" />
            <stop offset="1" stop-color="#DDFFC2" />
          </linearGradient>
        </defs>
      </svg>
    </figure>
  )
}
