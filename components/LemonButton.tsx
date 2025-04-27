import type { HTMLProps } from "react"
import { cn } from "@/lib/utils"

export default function LemonButton({
  children,
  className,
  ...pros
}: HTMLProps<HTMLButtonElement>) {
  return (
    <button
      {...(pros as any)}
      className={cn(
        "px-6 shadow-3d-lg active:shadow-none active:translate-x-[3px] active:translate-y-[3px] rounded-xl font-semibold bg-gradient-to-bl from-juz-green-lime to-juz-green-ish border-3 border-black py-2",
        className
      )}
    >
      {children}
    </button>
  )
}
