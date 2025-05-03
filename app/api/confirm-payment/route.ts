import type { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js"
import { completePaymentIntent } from "@/lib/redis"
import { isAddress } from "viem"

export async function POST(req: Request) {
  const address = req.headers.get("address") || ""
  if (!isAddress(address)) return Response.json({ success: false })

  const payload = (await req.json()) as MiniAppPaymentSuccessPayload
  const intentId = payload.reference

  if (payload?.from !== address) return Response.json({ success: false })

  const response = await fetch(
    `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.APP_ID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    }
  )

  const transaction = await response.json()

  const isCompleted =
    transaction.reference == intentId && transaction.status != "failed"

  // Mark intent as completed in backend
  if (isCompleted) {
    await completePaymentIntent(address, intentId, payload.transaction_id)
  }
  // We optimistically confirm the transaction.
  // Otherwise, you can poll until the status == mined
  return Response.json({
    success: isCompleted,
  })
}
