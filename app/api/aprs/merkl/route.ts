import { load } from "cheerio"

const PAGE =
  "https://app.merkl.xyz/opportunities/world-chain/CLAMM/0x494D68e3cAb640fa50F4c1B3E2499698D1a173A0"

/**
 * @see
 * I know this is not the best way to do this and scraping is sometimes considered bad practice.
 * But Merkl didnt provide any API, or contracts to get the APR.
 * So this is the only (good non manual) way to get the APR in this time.
 */

const FALLBACK_APR = 10 // Fallback APR in case of error
export async function GET(_: Request) {
  // TODO: Migrate to be dynamic fetching instead of only
  // serve data for the WLD-WETH pool

  const res = await fetch(PAGE)
  const html = await res.text()
  const $ = load(html)
  const apr = Number($("h3.text-accent-12").first().text().replace("%", ""))
  const isFallback = !Number.isFinite(apr)

  const response = Response.json({
    apr: isFallback ? FALLBACK_APR : apr,
    isFallback,
  })

  response.headers.set(
    // Keep the response staled for 30 seconds
    // and revalidate it after 59 seconds
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=59"
  )

  return response
}
