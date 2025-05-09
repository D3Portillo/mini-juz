"use client"

import { useLocale, useTranslations, type Locale } from "next-intl"
import { setUserLocale } from "@/actions/locale"
import MainSelect from "@/components/MainSelect"

export default function LanguageMenu({ trigger }: { trigger: JSX.Element }) {
  const locale = useLocale()
  const t = useTranslations("global")

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
      options={
        locale === "es"
          ? [
              {
                label: t("english"),
                value: "EN",
              },
            ]
          : [
              {
                label: t("spanish"),
                value: "ES",
              },
            ]
      }
    >
      {trigger}
    </MainSelect>
  )
}
