"use client"

import { useEffect, useState } from "react"
import { ALL_CURRENCIES } from "@/lib/atoms/currency"
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
  DrawerTitle,
  NumberPad,
} from "@worldcoin/mini-apps-ui-kit-react"
import { useOnRouterBack, useToggleRouteOnActive } from "@/lib/window"

export default function NumberSelectModal({
  value: externalValue,
  onValueChange,
  currency = "USD",
  children,
}: {
  children: (value?: number) => JSX.Element
  value: number
  onValueChange: (value: number) => void
  currency?: Required<keyof typeof ALL_CURRENCIES>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState("")
  const [updatingValue, setUpdatingValue] = useState("")

  const normalizeNumber = (value: string | number) => {
    const formatted = Number(value)
    return Number.isFinite(formatted) ? formatted : 0
  }

  useToggleRouteOnActive({
    isActive: isOpen,
    slug: "customize-amount",
  })

  useOnRouterBack((e) => {
    e.preventDefault()
    if (isOpen) {
      setIsOpen(false)
    }
  })

  useEffect(() => {
    setUpdatingValue(value)
  }, [isOpen])

  useEffect(() => {
    if (externalValue != undefined && Number.isFinite(externalValue)) {
      setValue(externalValue > 0 ? `${externalValue}` : "")
    }
  }, [externalValue])

  function handleConfirmValue(value: string) {
    setValue(value)
    setIsOpen(false)
    onValueChange?.(normalizeNumber(value))
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children(normalizeNumber(value))}</DrawerTrigger>
      <DrawerContent className="flex flex-col items-center p-6">
        <DrawerHeader>
          <DrawerTitle>Enter amount</DrawerTitle>
        </DrawerHeader>

        <div className="flex pb-8 pt-16 size-full flex-col gap-4 items-center">
          <div className="font-semibold flex items-center gap-2 h-[4.25rem]">
            <span className="text-xl">{getCurrrencySymbol(currency)}</span>
            <span
              className={
                updatingValue.length > 5 ? "text-[3.5rem]" : "text-[4rem]"
              }
            >
              {Number(updatingValue) > 1_000
                ? updatingValue.endsWith(".")
                  ? updatingValue
                  : Number(updatingValue).toLocaleString("en-US")
                : updatingValue || "0.00"}
            </span>
          </div>

          <div className="flex-grow" />

          <section className="[&_button]:h-14 w-full max-w-lg shrink-0">
            <NumberPad
              onLongDeletePress={() => setUpdatingValue("")}
              longPressOptions={{
                threshold: 500,
              }}
              value={updatingValue}
              onChange={setUpdatingValue}
            />
          </section>
        </div>

        <nav className="shrink-0 w-full">
          <Button
            onClick={() => handleConfirmValue(updatingValue)}
            fullWidth
            size="lg"
          >
            Confirm
          </Button>
        </nav>
      </DrawerContent>
    </Drawer>
  )
}

const CURRENCIES = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  SEK: "kr",
  NZD: "NZ$",
}

export function getCurrrencySymbol(currency: keyof typeof CURRENCIES) {
  return CURRENCIES[currency]
}
