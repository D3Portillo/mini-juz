import { Fragment, type PropsWithChildren } from "react"
import { cn } from "@/lib/utils"

export default function FixedTopContainer({
  children,
  className,
}: PropsWithChildren<{
  className?: string
}>) {
  return (
    <Fragment>
      <div
        className={cn(
          "[&_.w-full.gap-10]:py-0 [&_.w-full.gap-10]:gap-5 [&_.w-full.gap-10]:px-5",
          `h-navigation bg-white top-0 fixed left-0 right-0 z-10`,
          className
        )}
      >
        {children}
      </div>
      <div className="pointer-events-none w-full h-navigation" />
    </Fragment>
  )
}
