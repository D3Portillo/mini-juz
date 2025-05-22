export const shortifyDecimals = (number: string | number, precision = 2) =>
  toPrecision(number, precision)

export function toPrecision(_n: number | string, precision: number = 1) {
  const n = Number(_n)

  // Early return if the number is not finite
  if (!Number.isFinite(n)) return "0"

  const formatted = n.toFixed(precision)
  const [whole, decimal = 0] = formatted.split(".")

  // Early return if no decimal part
  if (decimal == 0) return whole

  const decimalParts = decimal.split(/0{1,}/g) ?? []
  const lastValuablePart = decimalParts.at(decimal.startsWith("0") ? 1 : 0)
  // given "0000002000", then index = 1
  // given "2000", then index= 0

  // Get the last valuable (non-zero-followed) part of the decimal part
  if (lastValuablePart) {
    return `${whole}.${decimal.slice(
      0,
      decimal.indexOf(lastValuablePart) + lastValuablePart.length
    )}`
  }
  return `${whole}.${decimal}`
}

export const numberToShortWords = (_value: number | string): string => {
  const value = Number(_value)
  if (!Number.isFinite(value) || isNaN(value)) return "0"

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })

  if (value >= 1e12) return formatter.format(value / 1e12) + "T"
  if (value >= 1e9) return formatter.format(value / 1e9) + "B"
  if (value >= 1e6) return formatter.format(value / 1e6) + "M"
  if (value >= 1e3) return formatter.format(value / 1e3) + "k"
  if (value < 1e-4) return "<0.0001"
  if (value < 1) return Number(value.toFixed(4)).toString()

  return formatter.format(value)
}
