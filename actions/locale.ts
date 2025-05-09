"use server"

import { cookies } from "next/headers"
import type { Locale } from "next-intl"

const COOKIE_NAME = "JUZ_LOCALE"

export async function getUserLocale(): Promise<Locale> {
  // @ts-ignore
  return (await cookies()).get(COOKIE_NAME)?.value || ("en" satisfies Locale)
}

export async function setUserLocale(locale: Locale) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
