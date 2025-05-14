const UNO_APP_ID = "app_a4f7f3e62c1de0b9490a5260cb390b56"

export const getJUZAppId = () =>
  process.env.NODE_ENV === "development"
    ? "app_4f327311775bc4da83fa474e36993b82"
    : "app_0ffb335831bc585f54dec2755d917d6a"

export function getUnoDeeplinkUrl({
  fromToken,
  toToken,
  amount,
}: {
  fromToken?: string
  toToken?: string
  amount?: string
}) {
  let path = `?tab=swap`

  if (fromToken) {
    path += `&fromToken=${fromToken}`
    if (amount) path += `&amount=${amount}`
  }

  if (toToken) path += `&toToken=${toToken}`

  return `https://worldcoin.org/mini-app?app_id=${UNO_APP_ID}&path=${encodeURIComponent(
    `${path}&referrerAppId=${getJUZAppId()}`
  )}`
}
