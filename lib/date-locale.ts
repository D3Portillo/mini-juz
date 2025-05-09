import type { Locale } from "next-intl"
import { es } from "date-fns/locale/es"

export const getDateFnsLocal = (locale: Locale) => {
  return locale === "es" ? es : undefined
}
