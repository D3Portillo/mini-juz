"use client"

import useSWR from "swr"
import { type FormEventHandler, useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { useWorldAuth } from "@radish-la/world-auth"

import ReusableDialog from "@/components/ReusableDialog"
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
import { getPairDepositRequired } from "@/lib/uniswap"

import { useAccountBalances } from "@/lib/atoms/balances"
import { useFormattedInputHandler } from "@/lib/input"
import { useWLDPerETH } from "./internals"
import { useWLDPriceInUSD } from "@/lib/atoms/prices"

import { type ContractFunctionArgs, erc20Abi, formatEther } from "viem"
import { appendSignatureResult } from "@/lib/atoms/erc20"

import { FaQuestion } from "react-icons/fa"

import { ABI_JUZ_POOLS, worldClient } from "@/lib/atoms/holdings"
import {
  ADDRESS_POOL_WLD_ETH,
  ADDRESS_WETH,
  ADDRESS_WORLD_COIN,
  ONE_HOUR_IN_BLOCK_TIME,
  ZERO,
} from "@/lib/constants"

/**
 * Max limit to avoid overstimating the effective deposit
 */
const MAGIC_NUMBER_MAX = 98.768
const DEFAULT_PERCENTAGE = 25
const SIGNIFICANT_DECIMALS = 6

export default function DialogDeposit({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handler0 = useFormattedInputHandler()
  const handler1 = useFormattedInputHandler()

  const [depositPercentage, setDepositPercentage] = useState(DEFAULT_PERCENTAGE)

  const { wldPerETH, x96Price } = useWLDPerETH()
  const { wldPriceInUSD } = useWLDPriceInUSD()

  const { toast } = useToast()
  const { user, signIn } = useWorldAuth()
  const address = user?.walletAddress

  const { WLD } = useAccountBalances()

  const { data: wethBalance = null } = useSWR(
    open && address ? `balances.deposit.weth.${address}` : null,
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
    },
    {
      keepPreviousData: true,
    }
  )

  const balance0 = WLD.balance
  const balance1 = wethBalance?.balance ?? ZERO

  const MAX_FORMATTED_BALANCE_0 = shortifyDecimals(
    (Number(formatEther(balance0)) * MAGIC_NUMBER_MAX) / 100,
    SIGNIFICANT_DECIMALS
  )

  const MAX_FORMATTED_BALANCE_1 = shortifyDecimals(
    (Number(formatEther(balance1)) * MAGIC_NUMBER_MAX) / 100,
    SIGNIFICANT_DECIMALS
  )

  // Get the MAX-normalized balances we can add to the pool
  // in terms of liquidity
  const [effectiveBalance0, effectiveBalance1] = getPairDepositRequired({
    sqrtPriceX96: x96Price,
    amount0: balance0,
    amount1: balance1,
  })

  const formattedEffectiveBalance0 = formatEther(effectiveBalance0) as any
  const formattedEffectiveBalance1 = formatEther(effectiveBalance1) as any

  const MAX_EFFECTIVE_BALANCE_USDC =
    Number(formattedEffectiveBalance0) * wldPriceInUSD +
    Number(formattedEffectiveBalance1) * wldPerETH * wldPriceInUSD

  const isCustomDeposit =
    handler0.formattedValue > effectiveBalance0 ||
    handler1.formattedValue > effectiveBalance1

  const DEPOSIT_IN_USD =
    (Number(handler0.value || 0) + Number(handler1.value || 0) * wldPerETH) *
    wldPriceInUSD

  function getEffectiveAmountsForRatio(ratio: number) {
    const depositRatio = BigInt(Math.round(ratio))
    const amount0 = (effectiveBalance0 * depositRatio) / BigInt(100)
    const amount1 = (effectiveBalance1 * depositRatio) / BigInt(100)
    return [amount0, amount1] as const
  }

  async function handlePoolDeposit() {
    if (!address) return signIn()

    if (handler0.formattedValue <= 0 || handler1.formattedValue <= 0) {
      return toast.error({ title: "Invalid deposit" })
    }

    if (
      handler0.formattedValue > balance0 ||
      handler1.formattedValue > balance1
    ) {
      return toast.error({ title: "Insufficient balance" })
    }

    const pool = {
      token0: ADDRESS_WORLD_COIN,
      token1: ADDRESS_WETH,
    }

    const balances = {
      amount0: handler0.formattedValue,
      amount1: handler1.formattedValue,
    }

    const nonce0 = BigInt(Date.now())
    const nonce1 = BigInt(Date.now() + 4)

    const DEADLINE = BigInt(
      Math.floor(Date.now() / 1000) + ONE_HOUR_IN_BLOCK_TIME
    )

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
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

    const isError = Boolean((finalPayload as any)?.details?.debugUrl)

    if (isError) {
      return toast.error({
        title: "Transaction failed",
      })
    }

    if (finalPayload.status === "success") {
      toast.success({
        title: `Deposit of $${shortifyDecimals(
          DEPOSIT_IN_USD,
          DEPOSIT_IN_USD < 1 ? 5 : 3
        )} complete`,
      })

      // Close the dialog
      onOpenChange(false)
    }
  }

  function handlePercentageChange(currentValue: any, maxValue: any) {
    setDepositPercentage(
      Math.min(
        MAGIC_NUMBER_MAX,
        maxValue && currentValue
          ? (Number(currentValue) / Number(maxValue)) * 100
          : 0
      )
    )
  }

  function handleUpdateInputsFromRatio(newRatio: number) {
    const [value0, value1] = getEffectiveAmountsForRatio(newRatio)
    const formattedValue0 = formatEther(value0) as any
    const formattedValue1 = formatEther(value1) as any

    const ZEROED_VALUE = (0).toFixed(SIGNIFICANT_DECIMALS) // 0.00000

    handler0.setValue(
      formattedValue0 < 1
        ? // Empty string when value is ZEROED_VALUE
          Number(formattedValue0)
            .toFixed(SIGNIFICANT_DECIMALS)
            .replace(ZEROED_VALUE, "")
        : shortifyDecimals(formattedValue0, 3)
    )

    handler1.setValue(
      formattedValue1 < 1
        ? Number(formattedValue1)
            .toFixed(SIGNIFICANT_DECIMALS)
            .replace(ZEROED_VALUE, "")
        : shortifyDecimals(formattedValue1, 3)
    )

    setDepositPercentage(newRatio)
  }

  function handleMaxPressed({
    amount0,
    amount1,
  }: {
    amount0?: string
    amount1?: string
  }) {
    if (amount0) handler0.setValue(MAX_FORMATTED_BALANCE_0)
    if (amount1) handler1.setValue(MAX_FORMATTED_BALANCE_1)

    const value0 = Number(amount0 || handler0.value || 0)
    const value1 = Number(amount1 || handler1.value || 0)

    const pricedValue0 = value0 * wldPriceInUSD
    const pricedValue1 = value1 * wldPerETH * wldPriceInUSD

    handlePercentageChange(
      pricedValue0 + pricedValue1,
      MAX_EFFECTIVE_BALANCE_USDC
    )
  }

  useEffect(() => {
    setDepositPercentage(DEFAULT_PERCENTAGE)
    handleUpdateInputsFromRatio(DEFAULT_PERCENTAGE)
  }, [open, MAX_FORMATTED_BALANCE_0, MAX_FORMATTED_BALANCE_1])

  const PERCENTAGE = isCustomDeposit ? MAGIC_NUMBER_MAX : depositPercentage

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="[&_.size-10]:translate-x-2 [&_[aria-role=header]]:items-start [&_.size-10]:-translate-y-2">
        <AlertDialogHeader aria-role="header">
          <h2 className="text-2xl font-semibold">Deposit</h2>
        </AlertDialogHeader>

        <section className="flex items-center justify-between">
          <nav className="flex items-center gap-1">
            <span>Effective balance</span>

            <ReusableDialog
              title="Effective balance"
              trigger={
                <button className="size-6 outline-none active:scale-95 bg-black/5 rounded-full grid place-content-center">
                  <FaQuestion className="text-xs opacity-75" />
                </button>
              }
            >
              <p>
                <strong className="font-medium">Effective balance (EB)</strong>:
                The ideal amount to deposit, so we don't leave any dust or
                overstate deposits. The EB is calculated using Uniswap V3's
                formula for LP positions.
              </p>

              <p>
                <strong className="font-medium">MOD</strong>: Flag to indicate
                that the position is outside of EB amounts and that the user is
                making a custom deposit.
              </p>
            </ReusableDialog>
          </nav>

          <strong className="font-medium tabular-nums">
            $
            {DEPOSIT_IN_USD < 1
              ? DEPOSIT_IN_USD.toFixed(SIGNIFICANT_DECIMALS)
              : shortifyDecimals(DEPOSIT_IN_USD, 3)}
          </strong>
        </section>

        <section className="mt-2.5 select-none">
          <Slider
            step={0.5}
            value={[PERCENTAGE]}
            onValueChange={([value]) => handleUpdateInputsFromRatio(value)}
            max={MAGIC_NUMBER_MAX}
          />

          <div className="mt-4 text-sm font-semibold items-center gap-2 grid grid-cols-5">
            {[0, 25, 50, 75, MAGIC_NUMBER_MAX].map((ratio) => {
              const isActive = PERCENTAGE === ratio

              return (
                <button
                  onClick={() => handleUpdateInputsFromRatio(ratio)}
                  key={`deposit-ratio-${ratio}`}
                  className={cn(
                    "rounded-full outline-none text-center py-1 px-2",
                    isActive
                      ? "bg-black text-white"
                      : "bg-black/5 text-black/70"
                  )}
                >
                  {isCustomDeposit && isActive
                    ? "MOD"
                    : `${ratio === MAGIC_NUMBER_MAX ? 100 : ratio}%`}
                </button>
              )
            })}
          </div>
        </section>

        <hr className="mt-4" />

        <section className="grid mt-4 mb-4 gap-4 grid-cols-2">
          <TokenPreview
            value={handler0.value}
            isInvalid={handler0.formattedValue > balance0}
            onMaxPressed={() =>
              handleMaxPressed({ amount0: MAX_FORMATTED_BALANCE_0 })
            }
            onChange={(e) => {
              handlePercentageChange(
                handler0.onChangeHandler(e) as any,
                formattedEffectiveBalance0
              )
            }}
            icon={
              <img alt="" className="size-6 rounded-md" src="/token/WLD.png" />
            }
            symbol="WLD"
          />

          <TokenPreview
            value={handler1.value}
            isInvalid={handler1.formattedValue > balance1}
            onMaxPressed={() =>
              handleMaxPressed({ amount1: MAX_FORMATTED_BALANCE_1 })
            }
            onChange={(e) => {
              handlePercentageChange(
                handler1.onChangeHandler(e) as any,
                formattedEffectiveBalance1
              )
            }}
            icon={
              <img alt="" className="size-6 rounded-md" src="/token/WETH.png" />
            }
            symbol="WETH"
          />
        </section>

        <AlertDialogFooter>
          <Button onClick={handlePoolDeposit}>Confirm</Button>
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
  onMaxPressed,
  isInvalid,
}: {
  icon: JSX.Element
  symbol: string
  value?: number
  isInvalid?: boolean
  onMaxPressed?: () => void
  onChange?: FormEventHandler<HTMLInputElement>
}) {
  return (
    <div className="flex border flex-col items-start shadow-inner bg-black/3 rounded-2xl p-3 gap-2">
      <nav className="flex w-full gap-1.5 items-start">
        {icon}
        <span className="opacity-70 text-base uppercase">{symbol}</span>
        <div className="flex-grow" />
        <button
          onClick={onMaxPressed}
          className="text-xs active:scale-95 outline-none p-px font-semibold"
        >
          MAX
        </button>
      </nav>

      <input
        onChange={onChange}
        className={cn(
          isInvalid
            ? "placeholder:text-juz-red text-juz-red"
            : "placeholder:text-black",
          "bg-transparent tabular-nums w-full outline-none text-xl"
        )}
        placeholder="0.00"
        value={value}
      />
    </div>
  )
}
