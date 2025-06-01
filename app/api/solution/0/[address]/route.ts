import { ABI_JUZ_POOLS } from "@/lib/atoms/holdings"
import {
  ADDRESS_DEV,
  ADDRESS_POOL_WLD_ETH,
  ADDRESS_WORLD_COIN,
} from "@/lib/constants"
import { createPublicClient, formatEther, isAddress, webSocket } from "viem"
import { worldchain } from "viem/chains"
import { alchemy } from "@/lib/alchemy"

const client = createPublicClient({
  chain: worldchain,
  transport: webSocket(
    "wss://worldchain-mainnet.g.alchemy.com/v2/TydhRO71t-iaLkFdNDoQ_eIcd9TgKv0Q"
  ),
})

export async function GET(
  _: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params
  if (!isAddress(address)) {
    return Response.json({ error: "InvalidAddress" }, { status: 400 })
  }

  const [wld, weth] = await client.readContract({
    abi: ABI_JUZ_POOLS,
    functionName: "addressDeposits",
    address: ADDRESS_POOL_WLD_ETH,
    args: [address],
  })

  const userShares = await client.readContract({
    abi: ABI_JUZ_POOLS,
    functionName: "addressShares",
    address: ADDRESS_POOL_WLD_ETH,
    args: [address],
  })

  const transferMetadata = await alchemy.core.getAssetTransfers({
    maxCount: 1,
    fromAddress: ADDRESS_DEV,
    contractAddresses: [ADDRESS_WORLD_COIN],
    toAddress: address,
    category: ["external", "erc20"] as any,
  })

  const paymentTx = transferMetadata.transfers?.[0]?.hash || null

  const response = Response.json({
    status: paymentTx ? "paid" : "in-pool",
    paymentTx,
    owed: {
      // Show nothing if user has no shares
      amount0: userShares > 0 ? formatEther(wld) : 0,
      amount1: userShares > 0 ? formatEther(weth) : 0,
    },
  })

  response.headers.set(
    // Keep the response staled for 30 seconds
    // and revalidate it after 29 seconds
    "Cache-Control",
    "public, s-maxage=15, stale-while-revalidate=29"
  )

  return response
}
