"use client"

import { defaultCountries } from "react-international-phone"
import { type PropsWithChildren, useState } from "react"
import { IoMdClose } from "react-icons/io"
import {
  Button,
  CountryDrawer,
  Drawer,
  DrawerContent,
  type CountryCode,
  DrawerHeader,
  DrawerTrigger,
  Flag,
  DrawerTitle,
} from "@worldcoin/mini-apps-ui-kit-react"
import { useOnRouterBack, useToggleRouteOnActive } from "@/lib/window"
import { cn } from "@/lib/utils"
import ModalPayment, { type PaymentMethod, ALL_PAYMENTS } from "./ModalPayment"

export default function ModalMarketFilters({
  trigger,
}: {
  trigger: JSX.Element
}) {
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [country, setCountry] = useState<CountryCode>()
  const [isOpen, setIsOpen] = useState(false)

  const [countryName] =
    defaultCountries.find(([, code]) => code.toUpperCase() === country) || []

  const isCountrySelected = Boolean(countryName && country)
  const isFullPaymentSelected = payments.length === ALL_PAYMENTS.length

  useToggleRouteOnActive({
    isActive: isOpen,
    slug: "filters",
  })

  useOnRouterBack((e) => {
    e.preventDefault()
    if (isOpen) {
      setIsOpen(false)
    }
  })

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="flex flex-col items-center p-6">
        <DrawerHeader>
          <DrawerTitle>Customize your search</DrawerTitle>
        </DrawerHeader>

        <div className="flex py-4 size-full flex-col gap-5 items-center">
          <fieldset className="flex w-full flex-col gap-1">
            <label className="w-full flex text-sm">Payment country</label>
            <CountryDrawer
              onChange={(code) => setCountry(code as any)}
              value={country as any}
            >
              <button className="w-full border border-black/3 bg-black/3 px-3 h-14 rounded-2xl flex gap-2 items-center">
                <div className="size-8 bg-black/3 grid place-items-center rounded-full overflow-hidden">
                  {isCountrySelected ? (
                    <Flag countryCode={country!} />
                  ) : (
                    <span className="text-4xl scale-125">🌎</span>
                  )}
                </div>
                <span className="font-medium whitespace-nowrap">
                  {countryName ? countryName : "Everywhere"}
                </span>
                <div className="flex-grow" />
                {isCountrySelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCountry(undefined)
                    }}
                    className="size-10 grid place-items-center bg-black/3 text-black rounded-full"
                  >
                    <IoMdClose className="text-2xl" />
                  </button>
                )}
              </button>
            </CountryDrawer>
          </fieldset>

          <fieldset className="flex w-full flex-col gap-1.5">
            <label className="w-full flex text-sm">Payment method</label>
            <section className="flex gap-2 flex-wrap">
              {payments.map((payment) => (
                <SelectOption
                  key={`selected-${payment.value}`}
                  onClick={() =>
                    setPayments((prev) =>
                      prev.filter((p) => p.value !== payment.value)
                    )
                  }
                  withClose
                >
                  {payment.label}
                </SelectOption>
              ))}

              <ModalPayment
                selected={payments}
                onSelect={(payment) => setPayments([...payments, payment])}
                trigger={
                  isFullPaymentSelected ? null : (
                    <SelectOption withAdd>
                      {payments.length > 0 ? "Add more" : "Add payment"}
                    </SelectOption>
                  )
                }
              />
            </section>
          </fieldset>
        </div>

        <nav className="shrink-0 w-full">
          <Button fullWidth size="lg">
            Apply Filters
          </Button>
        </nav>
      </DrawerContent>
    </Drawer>
  )
}

function SelectOption({
  children,
  withClose,
  withAdd,
  ...props
}: PropsWithChildren<{
  onClick?: () => void
  withClose?: boolean
  withAdd?: boolean
}>) {
  return (
    <button
      {...props}
      className={cn(
        withClose ? "pr-2" : "pr-3",
        "border flex items-center gap-2 h-9 pl-3 rounded-full border-black/3 bg-black/3"
      )}
    >
      <span className="text-sm font-medium">{children}</span>
      {withAdd ? (
        <IoMdClose className="rotate-45" />
      ) : withClose ? (
        <IoMdClose />
      ) : null}
    </button>
  )
}
