import { erc20Abi, parseEther, type Address } from "viem"

import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js"
import { generateUUID, serializeBigint } from "@/lib/utils"
import { ADDRESS_JUZ } from "@/lib/constants"
import { getHardwareType } from "@/lib/window"
import { incrPlayerJUZEarned, subtrPlayerJUZEarned } from "./game"

export const MINI_APP_RECIPIENT = "0x05a700132Fb88D4F565453153E6b05F2049fCb45"

export const executeWorldPayment = async ({
  initiatorAddress,
  paymentDescription,
  amount,
}: {
  initiatorAddress: Address
  paymentDescription: string
  amount: number
}) => {
  if (!MiniKit.isInstalled()) return null

  const uuid = generateUUID()
  const payload: PayCommandInput = {
    reference: uuid,
    to: MINI_APP_RECIPIENT,
    tokens: [
      {
        symbol: Tokens.WLD,
        token_amount: tokenToDecimals(amount, Tokens.WLD).toString(),
      },
    ],
    description: paymentDescription,
  }

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

export const executeJUZPayment = async ({
  amount,
  initiatorAddress,
}: {
  amount: number | string
  initiatorAddress: Address
}) => {
  const { isIOS } = getHardwareType()

  if (isIOS) {
    try {
      // Use siganture request as a way to confirm the payment
      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message: `Redeeming ${amount} JUZ`,
      })

      if (finalPayload.status !== "success") return null

      // We only interact with "points" on iOS
      await subtrPlayerJUZEarned(initiatorAddress, Number(amount))
      return {
        status: "success",
        from: initiatorAddress,
      }
    } catch (_) {}

    return null
  }

  const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
    transaction: [
      {
        abi: erc20Abi,
        address: ADDRESS_JUZ,
        functionName: "transfer",
        args: serializeBigint([
          MINI_APP_RECIPIENT,
          parseEther(amount.toString()),
        ]),
      },
    ],
  })

  return finalPayload.status === "success" ? finalPayload : null
}
