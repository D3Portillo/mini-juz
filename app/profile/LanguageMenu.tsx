"use client"

import { setUserLocale } from "@/actions/locale"
import MainSelect from "@/components/MainSelect"
import type { Locale } from "next-intl"

export default function LanguageMenu({ trigger }: { trigger: JSX.Element }) {
  function setLocale(locale: Locale) {
    setUserLocale(locale)
  }

  return (
    <MainSelect
      value="NONE" // Dummy value to trigger the select
      showSelectedItem={false}
      onValueChange={(value) => {
        // EN->en, ES->es
        setLocale(value.toLowerCase() as any)
      }}
      options={[
        {
          label: "English",
          value: "EN",
        },
        {
          label: "Spanish",
          value: "ES",
        },
      ]}
    >
      {trigger}
    </MainSelect>
  )
}
