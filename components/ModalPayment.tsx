"use client"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  SearchField,
  TopBar,
  Typography,
} from "@worldcoin/mini-apps-ui-kit-react"
import { useState } from "react"
import { Magnifier, XMark } from "./icons"

export type PaymentMethod = {
  label: string
  value: string
  color: string
}

export const ALL_PAYMENTS: Array<PaymentMethod> = [
  {
    label: "Wise",
    value: "wise",
    color: "#99e778",
  },
  {
    label: "PayPal",
    value: "paypal",
    color: "#00457C",
  },
  {
    label: "Revolut",
    value: "revolut",
    color: "#2187df",
  },
  {
    label: "BBVA",
    value: "bbva",
    color: "#10298e",
  },
  {
    label: "SEPA Instant",
    value: "sepa-instant",
    color: "#102981",
  },
  {
    label: "Skrill",
    value: "skrill",
    color: "#67328f",
  },
  {
    label: "N26",
    value: "n26",
    color: "#63aa99",
  },
  {
    label: "Google Pay",
    value: "google-pay",
    color: "#4285F4",
  },
  {
    label: "Apple Pay",
    value: "apple-pay",
    color: "#000000",
  },
  {
    label: "Cash App",
    value: "cash-app",
    color: "#00cf30",
  },
]

const TITLE = "Add payment method"

export default function ModalPayment({
  trigger,
  selected = [],
  onSelect,
}: {
  trigger: JSX.Element | null
  selected?: PaymentMethod[]
  onSelect?: (selected: PaymentMethod) => void
}) {
  const [searchText, setSearchText] = useState("")
  const [open, setOpen] = useState(false)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const filteredPayments = ALL_PAYMENTS.filter((payment) =>
    searchText
      ? payment.label.toLowerCase().includes(searchText.toLowerCase())
      : true
  ).filter(
    (payment) =>
      // Show only payments that are not selected
      !selected.some(
        (selectedPayment) => selectedPayment.value === payment.value
      )
  )

  const GROUPED_PAYMENTS = filteredPayments.reduce((acc, payment) => {
    const firstLetter = payment.label[0].toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(payment)
    return acc
  }, {} as Record<string, PaymentMethod[]>)

  const isEmpty = Object.keys(GROUPED_PAYMENTS).length === 0

  return (
    <Drawer open={open} onOpenChange={setOpen} height="full">
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

      <DrawerContent>
        <VisuallyHidden>
          <DrawerTitle>{TITLE}</DrawerTitle>
        </VisuallyHidden>
        <TopBar
          title={TITLE}
          startAdornment={
            <DrawerClose asChild>
              <Button variant="tertiary" size="icon">
                <XMark />
              </Button>
            </DrawerClose>
          }
        />

        <div className="p-6 shrink-0">
          <SearchField
            value={searchText}
            onChange={handleSearchChange}
            label="Search"
          />
        </div>

        <div className="no-scrollbar w-full overflow-auto px-6 grow">
          {isEmpty && <EmptyState />}

          {Object.entries(GROUPED_PAYMENTS)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, payments]) => (
              <div key={letter} className="group">
                <Typography
                  variant="subtitle"
                  level={3}
                  className="text-gray-400 mb-2"
                >
                  {letter}
                </Typography>
                {payments.map((payment) => (
                  <DrawerClose key={`payment-${payment.value}`} asChild>
                    <button
                      onClick={() => {
                        onSelect?.(payment)
                        // setOpen(false)
                      }}
                      type="button"
                      className="h-[3.75rem] flex items-center w-full gap-4"
                    >
                      <figure
                        style={{
                          backgroundColor: payment.color,
                        }}
                        className="size-8 rounded-full overflow-hidden"
                      />

                      <Typography
                        variant="subtitle"
                        level={2}
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {payment.label}
                      </Typography>
                    </button>
                  </DrawerClose>
                ))}
                <div className="h-[1px] bg-gray-200 my-4 group-last:hidden" />
              </div>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center grow text-gray-400 gap-2 h-full">
      <Magnifier className="size-8" />
      <Typography variant="body" level={3}>
        No search results
      </Typography>
    </div>
  )
}
