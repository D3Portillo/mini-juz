import { getTotalUserHoldings } from "@/lib/atoms/holdings"
import { getPlayerJUZEarned } from "@/actions/game"
import { isAddress, parseEther } from "viem"
import { serializeBigint } from "@/lib/utils"
import { ZERO } from "@/lib/constants"

export const revalidate = 45 // Keep staled for 45 seconds

export async function GET(
  _: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params
  if (!isAddress(address)) {
    return Response.json({ error: "InvalidAddress" }, { status: 400 })
  }

  const [holdings, JUZPoints] = await Promise.all([
    getTotalUserHoldings(address),
    getPlayerJUZEarned(address),
  ])

  const { JUZ: JUZToken = ZERO, ...rest } = holdings || {}

  return Response.json(
    serializeBigint({
      ...rest,
      JUZToken,
      JUZPoints: parseEther(`${JUZPoints}`),
    })
  )
}
