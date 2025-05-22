import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
} from "viem"
import { useWorldAuth } from "@radish-la/world-auth"
import { MiniKit } from "@worldcoin/minikit-js"

export const appendSignatureResult = (opts?: { slot: number }) =>
  `PERMIT2_SIGNATURE_PLACEHOLDER_${opts?.slot || 0}` as const

export const usePermittedTransfer = () => {
  const { isMiniApp, user } = useWorldAuth()

  const permitTransfer = async <T extends Abi>({
    token,
    functionName,
    deadline,
    amount,
    nonce,
    abi,
    args,
    recipient,
  }: {
    token: Address
    abi: T
    args: ContractFunctionArgs<T>
    functionName: ContractFunctionName<T>
    nonce: number
    deadline: number
    amount: bigint
    recipient: Address
  }) => {
    if (!isMiniApp) return null
    if (!user?.walletAddress) return null

    const formattedAmount = amount.toString()

    const PERMITTED_TRANSFER = {
      permitted: {
        token,
        amount: formattedAmount,
      },
      spender: recipient,
      deadline: deadline.toString(),
      nonce: nonce.toString(),
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: recipient,
            args: args as any,
            functionName,
            abi,
          },
        ],
        permit2: [PERMITTED_TRANSFER],
      })

      if (finalPayload.status === "success") {
        return finalPayload
      }
    } catch (error) {
      console.error({ error })
    }

    return null
  }

  return { permitTransfer }
}
