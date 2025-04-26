import { isAddress } from "viem"

import { createPaymentIntent } from "@/lib/redis"
import { generateUUID } from "@/lib/utils"

export async function POST(req: Request) {
  const address = req.headers.get("address") || ""
  if (!isAddress(address)) return Response.json({ id: null })

  const uuid = generateUUID()
  await createPaymentIntent(address, uuid)
  return Response.json({ uuid })
}
