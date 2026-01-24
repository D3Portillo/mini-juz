"use client"

import { useLocale, useTranslations, type Locale } from "next-intl"
import { setUserLocale } from "@/actions/locale"
import { trackEvent } from "@/components/posthog"

import MainSelect from "@/components/MainSelect"

export default function LanguageMenu({ trigger }: { trigger: JSX.Element }) {
  const locale = useLocale()
  const t = useTranslations("global")

  function setLocale(locale: Locale) {
    setUserLocale(locale)
    trackEvent("updated-locale", {
      locale,
    })
  }

  return (
    <MainSelect
      value="NONE" // Dummy value to trigger the select
      showSelectedItem={false}
      onValueChange={setLocale as any}
      options={[
        {
          label: t("english"),
          value: "en",
        },
        {
          label: t("spanish"),
          value: "es",
        },
        {
          label: t("portuguese"),
          value: "pt",
        },
        {
          label: t("filipino"),
          value: "fil",
        },
      ].filter((option) => option.value !== locale)}
    >
      {trigger}
    </MainSelect>
  )
}
