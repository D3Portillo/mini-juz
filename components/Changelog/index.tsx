"use client"

import { useAtom } from "jotai"
import { useLocale } from "next-intl"
import { atomWithStorage } from "jotai/utils"

import ReusableDialog from "@/components/ReusableDialog"
import { CHANGELOG, ChangeType } from "./changelog"

const atomChangelogViewed = atomWithStorage<string | null>(
  "juz.changelog.viewed",
  null
)

const LATEST_ENTRY_KEY = Object.keys(CHANGELOG).pop() || null
const LATEST_ENTRY = LATEST_ENTRY_KEY
  ? CHANGELOG[LATEST_ENTRY_KEY as any]
  : null

export default function Changelog() {
  const locale = useLocale()
  const [viewed, setViewed] = useAtom(atomChangelogViewed)

  // Can't show if no changelog entries
  if (!LATEST_ENTRY) return null

  const isOpenChangelog = Boolean(LATEST_ENTRY && viewed !== LATEST_ENTRY_KEY)
  return (
    <ReusableDialog
      title={`JUZ — v${LATEST_ENTRY_KEY}`}
      open={isOpenChangelog}
      onClosePressed={() => {
        if (LATEST_ENTRY_KEY) setViewed(LATEST_ENTRY_KEY)
      }}
    >
      <section>
        <p className="text-xs uppercase mb-3">
          {new Date(LATEST_ENTRY.date).toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        <ul className="space-y-3">
          {LATEST_ENTRY.changes.map((c, i) => (
            <li
              key={`change-${i}`}
              className="flex gap-3 items-start justify-start"
            >
              <strong className="border border-black/5 text-sm flex rounded-lg items-center justify-center shrink-0 size-6 bg-black/5">
                {getIconByType(c.type)}
              </strong>

              <span>{c.description[locale]}</span>
            </li>
          ))}
        </ul>
      </section>
    </ReusableDialog>
  )
}

const getIconByType = (type: ChangeType) => {
  switch (type) {
    case "FEATURE":
      return "🔥"
    case "FIX":
      return "🪲"
    case "IMPROVEMENT":
      return "🌟"
    default:
      return "💎"
  }
}
