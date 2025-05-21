"use client"

import { type ContractFunctionArgs, parseEther } from "viem"
import { MiniKit } from "@worldcoin/minikit-js"
import { useWorldAuth } from "@radish-la/world-auth"

import { appendSignatureResult } from "@/lib/atoms/erc20"

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"

import { ABI_JUZ_POOLS } from "@/lib/atoms/holdings"
import {
  ADDRESS_POOL_WLD_ETH,
  ADDRESS_WETH,
  ADDRESS_WORLD_COIN,
  ONE_HOUR_IN_BLOCK_TIME,
} from "@/lib/constants"

export default function DialogDeposit({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user, signIn } = useWorldAuth()
  const { toast } = useToast()
  const address = user?.walletAddress

  async function handlePoolDeposit() {
    if (!address) return signIn()

    const SENDING_WLD = parseEther("0.07")
    const SENDING_WETH = parseEther("0.00004")

    const pool = {
      token0: ADDRESS_WORLD_COIN,
      token1: ADDRESS_WETH,
    }

    const balances = {
      amount0: SENDING_WLD,
      amount1: SENDING_WETH,
    }

    const nonce0 = BigInt(Date.now())
    const nonce1 = BigInt(Date.now() + 4)

    const DEADLINE = BigInt(
      Math.floor(Date.now() / 1000) + ONE_HOUR_IN_BLOCK_TIME
    )

    const { finalPayload, commandPayload } =
      await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            abi: ABI_JUZ_POOLS,
            address: ADDRESS_POOL_WLD_ETH,
            functionName: "depositWithPermit",
            // function depositWithPermit(uint256, uint256, ((address,uint256),uint256,uint256), (address,uint256), bytes, ((address,uint256),uint256,uint256), (address,uint256), bytes) external
            args: [
              balances.amount0,
              balances.amount1,
              [[pool.token0, balances.amount0], nonce0, DEADLINE], // token, amount, nonce, deadline
              [ADDRESS_POOL_WLD_ETH, balances.amount0], // to, requested
              appendSignatureResult({ slot: 0 }) as any,
              [[pool.token1, balances.amount1], nonce1, DEADLINE], // token, amount, nonce, deadline
              [ADDRESS_POOL_WLD_ETH, balances.amount1], // to, requested
              appendSignatureResult({ slot: 1 }) as any,
            ] satisfies ContractFunctionArgs<typeof ABI_JUZ_POOLS>,
          },
        ],
        permit2: [
          {
            spender: ADDRESS_POOL_WLD_ETH,
            permitted: {
              token: pool.token0,
              amount: balances.amount0,
            },
            nonce: nonce0,
            deadline: DEADLINE,
          },
          {
            spender: ADDRESS_POOL_WLD_ETH,
            permitted: {
              token: pool.token1,
              amount: balances.amount1,
            },
            nonce: nonce1,
            deadline: DEADLINE,
          },
        ],
      })

    if (finalPayload.status === "error") {
      console.debug(finalPayload, commandPayload)
      console.log(finalPayload.details?.debugUrl)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Deposit</h2>
        </AlertDialogHeader>

        <AlertDialogDescription className="mb-4">awdaw</AlertDialogDescription>

        <AlertDialogFooter>
          <Button onClick={handlePoolDeposit}>Confirm</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
