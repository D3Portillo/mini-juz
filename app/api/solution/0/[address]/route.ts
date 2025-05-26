// https://worldchain-mainnet.g.alchemy.com/v2/TydhRO71t-iaLkFdNDoQ_eIcd9TgKv0Q

import { ADDRESS_POOL_WLD_ETH } from "@/lib/constants"
import {
  createPublicClient,
  formatEther,
  isAddress,
  parseAbi,
  webSocket,
} from "viem"
import { worldchain } from "viem/chains"

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

  /**
   * 1. Get all user WETH + WLD deposits to the POOL
   * 2. Get all withdrawals from the POOL
   * 3. Subtract withdrawals from deposits
   * 4. We get the total amount of WETH and WLD owed to the user
   */

  const userDeposits = await client.getContractEvents({
    abi: parseAbi([
      "event NewDeposit(address indexed user,uint256 amount0,uint256 amount1,uint256 shares)",
    ]),
    args: {
      user: address.toLowerCase(),
    },
    fromBlock: BigInt(14281964),
    address: ADDRESS_POOL_WLD_ETH,
    eventName: "NewDeposit",
  })

  const depositHistry = userDeposits.map((e) => {
    return {
      amount0: `${e.args.amount0}`,
      amount1: `${e.args.amount1}`,
      shares: e.args.shares?.toString() || "0",
      user: e.args.user,
    }
  })

  const userWithdrwals = await client.getContractEvents({
    abi: parseAbi([
      "event Withdrawal(address indexed user,uint256 amount0,uint256 amount1,uint256 shares)",
    ]),
    args: {
      user: address.toLowerCase(),
    },
    fromBlock: BigInt(14281964),
    address: ADDRESS_POOL_WLD_ETH,
    eventName: "Withdrawal",
  })

  const withdrawHistry = userWithdrwals.map((e) => {
    return {
      amount0: `${e.args.amount0}`,
      amount1: `${e.args.amount1}`,
      shares: e.args.shares?.toString() || "0",
      user: e.args.user,
    }
  })

  const totalDeposits = {
    total: {
      amount0: depositHistry
        .reduce((acc, curr) => acc + BigInt(curr.amount0), BigInt(0))
        .toString(),
      amount1: depositHistry
        .reduce((acc, curr) => acc + BigInt(curr.amount1), BigInt(0))
        .toString(),
    },
  }

  const totalWithdrawals = {
    amount0: withdrawHistry
      .reduce((acc, curr) => acc + BigInt(curr.amount0), BigInt(0))
      .toString(),
    amount1: withdrawHistry
      .reduce((acc, curr) => acc + BigInt(curr.amount1), BigInt(0))
      .toString(),
  }

  const owed = {
    amount0: (
      BigInt(totalWithdrawals.amount0) - BigInt(totalDeposits.total.amount0)
    ).toString(),
    amount1: (
      BigInt(totalWithdrawals.amount1) - BigInt(totalDeposits.total.amount1)
    ).toString(),
  }

  const response = Response.json({
    status: "pending",
    paymentTx: null,
    owed: {
      amount0:
        (owed.amount0 as any) < 0 ? -formatEther(owed.amount0 as any) : "0",
      amount1:
        (owed.amount1 as any) < 0 ? -formatEther(owed.amount1 as any) : "0",
    },
    deposits: {
      history: depositHistry,
      total: totalDeposits,
    },
    withdrawals: {
      history: withdrawHistry,
      total: totalWithdrawals,
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
