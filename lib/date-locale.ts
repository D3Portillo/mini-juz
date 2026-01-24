import type { Locale } from "next-intl"
import type { Locale as LocaleData } from "date-fns"

const cache = new Map<Locale, LocaleData>()

const localeLoaders: Record<string, () => Promise<any>> = {
  es: () => import("date-fns/locale/es"),
  pt: () => import("date-fns/locale/pt"),
  fil: () => import("date-fns/locale/fi"),
}

export async function loadDateFnsLocale(
  locale: Locale,
): Promise<LocaleData | undefined> {
  if (cache.has(locale)) return cache.get(locale)

  const loader = localeLoaders[locale]
  if (!loader) return undefined

  try {
    const module = await loader()
    const dateFnsLocale = module[locale] || module.default
    if (dateFnsLocale) cache.set(locale, dateFnsLocale)
    return dateFnsLocale
  } catch (error) {
    console.debug(`[date-fns] Failed to load locale: ${locale}`, { error })
    return undefined
  }
}

export const getDateFnsLocal = (locale: Locale) => cache.get(locale)
