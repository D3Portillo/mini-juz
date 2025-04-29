export const shortifyDecimals = (number: string | number, precision = 2) =>
  toPrecision(number, precision)

export function toPrecision(n: number | string, precision: number = 1) {
  const formatted = Number(n).toFixed(precision)
  const [whole, decimal = 0] = formatted.split(".")
  if (decimal == 0) return whole
  // Early return if no decimal part

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
