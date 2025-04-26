import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js"
import type { Address } from "viem"

const RECIPIENT = "0x05a700132Fb88D4F565453153E6b05F2049fCb45"

export const executeWorldPyment = async ({
  initiatorAddress,
  paymentDescription,
  amount,
}: {
  initiatorAddress: Address
  paymentDescription: string
  amount: number
}) => {
  const res = await fetch("/api/initiate-payment", {
    method: "POST",
    headers: {
      address: initiatorAddress,
    },
  })

  const { uuid } = await res.json()

  // Terminate if uuid is not generated
  if (!uuid) return null

  const payload: PayCommandInput = {
    reference: uuid,
    to: RECIPIENT,
    tokens: [
      {
        symbol: Tokens.WLD,
        token_amount: tokenToDecimals(amount, Tokens.WLD).toString(),
      },
    ],
    description: paymentDescription,
  }

  if (!MiniKit.isInstalled()) return null

  const { finalPayload } = await MiniKit.commandsAsync.pay(payload)
  if (finalPayload.status == "success") {
    const req = await fetch(`/api/confirm-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        address: initiatorAddress,
      },
      body: JSON.stringify(finalPayload),
    })

    const result = await req.json()
    if (result.success) return finalPayload
  }

  return null
}
