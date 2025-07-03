import { intervalToDuration, isAfter, isBefore } from "date-fns"

/**
 * Formats the difference between two dates in "Xd Yh Zm" format
 * @returns {string} Formatted string like "32d 12h 34m"
 */

export function formatDateDifference(
  date: Date | number,
  comparingTo: Date | number = new Date()
): string {
  const [start, end] = isAfter(date, comparingTo)
    ? [comparingTo, date]
    : [date, comparingTo]

  // Calculate duration between dates
  const duration = intervalToDuration({
    start,
    end,
  })
  const DAYS = duration.days || 0
  const MONTHS_TO_DAYS = (duration.months || 0) * 30

  return `${MONTHS_TO_DAYS + DAYS}d ${duration.hours || 0}h ${
    duration.minutes || 0
  }m`
}
