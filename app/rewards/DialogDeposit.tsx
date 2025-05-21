"use client"

import useSWR from "swr"
import { type FormEventHandler, useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { useWorldAuth } from "@radish-la/world-auth"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  useToast,
} from "@worldcoin/mini-apps-ui-kit-react"
import { Slider } from "@/components/ui/slider"

import { cn } from "@/lib/utils"
import { shortifyDecimals } from "@/lib/numbers"

import {
  type ContractFunctionArgs,
  erc20Abi,
  formatEther,
  parseEther,
} from "viem"
import { appendSignatureResult } from "@/lib/atoms/erc20"

import { ABI_JUZ_POOLS, worldClient } from "@/lib/atoms/holdings"
import {
  ADDRESS_POOL_WLD_ETH,
  ADDRESS_WETH,
  ADDRESS_WORLD_COIN,
  ONE_HOUR_IN_BLOCK_TIME,
} from "@/lib/constants"
import { useAccountBalances } from "@/lib/atoms/balances"
import { useFormattedInputHandler } from "@/lib/input"
import { useWLDPerETH } from "./internals"
import { useWLDPriceInUSD } from "@/lib/atoms/prices"

const DEFAULT_WITHDRAW_PERCENTAGE = 25

export default function DialogDeposit({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handler0 = useFormattedInputHandler()
  const handler1 = useFormattedInputHandler()

  const [withdrawPercentage, setShowWithdrawPercentage] = useState(
    DEFAULT_WITHDRAW_PERCENTAGE
  )

  const { wldPerETH } = useWLDPerETH()
  const { wldPriceInUSD } = useWLDPriceInUSD()

  const { toast } = useToast()
  const { user, signIn } = useWorldAuth()
  const address = user?.walletAddress

  const { WLD } = useAccountBalances()

  const { data: wethBalance = null } = useSWR(
    address ? `balances.w-eth.${address}` : null,
    async () => {
      if (!worldClient || !address) return null

      const weth = await worldClient.readContract({
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
        address: ADDRESS_WETH,
      })

      return {
        balance: weth,
        formatted: formatEther(weth) as any,
      }
    }
  )

  const TOTAL_AVAILABLE =
    Number(
      Number(WLD.formatted) +
        (wethBalance ? wethBalance.formatted * wldPerETH : 0)
    ) * wldPriceInUSD

  useEffect(() => {
    if (!open) {
      setShowWithdrawPercentage(DEFAULT_WITHDRAW_PERCENTAGE)
    }
  }, [open])

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

        <section className="flex items-center justify-between">
          <span>Available balance</span>
          <strong className="font-medium">
            ${shortifyDecimals(TOTAL_AVAILABLE, TOTAL_AVAILABLE < 1 ? 6 : 3)}
          </strong>
        </section>

        <section className="mt-2.5">
          <Slider
            value={[withdrawPercentage]}
            onValueChange={([value]) => setShowWithdrawPercentage(value)}
            max={100}
            step={1}
          />

          <div className="mt-4 text-sm font-semibold items-center gap-2 grid grid-cols-5">
            {[0, 25, 50, 75, 100].map((ratio) => {
              const isActive = withdrawPercentage === ratio

              return (
                <button
                  onClick={() => setShowWithdrawPercentage(ratio)}
                  key={`lock-ratio-${ratio}`}
                  className={cn(
                    "rounded-full outline-none text-center py-1 px-2",
                    isActive
                      ? "bg-black text-white"
                      : "bg-black/5 text-black/70"
                  )}
                >
                  {ratio}%
                </button>
              )
            })}
          </div>
        </section>

        <hr className="mt-4" />

        <section className="grid mt-4 mb-4 gap-4 grid-cols-2">
          <TokenPreview
            value={handler0.value}
            onChange={handler0.onChangeHandler}
            icon={
              <img alt="" className="size-6 rounded-md" src="/token/WLD.png" />
            }
            symbol="WLD"
          />

          <TokenPreview
            value={handler1.value}
            onChange={handler1.onChangeHandler}
            icon={
              <img alt="" className="size-6 rounded-md" src="/token/WETH.png" />
            }
            symbol="WETH"
          />
        </section>

        <AlertDialogFooter>
          <Button>Confirm</Button>
        </AlertDialogFooter>

        <p className="text-sm mt-3 -mb-3 text-center max-w-xs mx-auto text-black/50">
          <strong className="font-medium">Management fee: 3%</strong>
        </p>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function TokenPreview({
  icon,
  symbol,
  value,
  onChange,
}: {
  icon: JSX.Element
  symbol: string
  value?: number
  onChange?: FormEventHandler<HTMLInputElement>
}) {
  return (
    <div className="flex border flex-col items-start shadow-inner bg-black/3 rounded-2xl p-3 gap-2">
      <nav className="flex gap-1.5 items-center">
        {icon}
        <span className="opacity-70 text-base uppercase">{symbol}</span>
      </nav>

      <input
        onChange={onChange}
        className="bg-transparent tabular-nums placeholder:text-black w-full outline-none text-xl"
        placeholder="0.00"
        value={value}
      />
    </div>
  )
}
