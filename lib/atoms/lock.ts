import { parseAbi } from "viem"
import {
  ADDRESS_JUZ,
  ADDRESS_LOCK_CONTRACT,
  ONE_HOUR_IN_BLOCK_TIME,
} from "@/lib/constants"
import { serializeBigint } from "@/lib/utils"
import { PERMIT_SIGNATURE, usePermittedTransfer } from "./erc20"

const ABI = parseAbi([
  "function lockJUZ(uint256 _amount, uint256 _duration, uint256 _nonce, uint256 _deadline, bytes calldata _signature) external",
])

export const useLockJUZ = (amount: bigint) => {
  const { permitTransfer } = usePermittedTransfer()

  return {
    lock: (periodInWeeks: number) => {
      // 1 hour in the future
      const deadline = Math.floor(Date.now() / 1000) + ONE_HOUR_IN_BLOCK_TIME
      const nonce = Date.now()

      return permitTransfer({
        nonce,
        amount,
        deadline,
        abi: ABI,
        recipient: ADDRESS_LOCK_CONTRACT,
        functionName: "lockJUZ",
        token: ADDRESS_JUZ,
        args: serializeBigint([
          // amount, duration, nonce, deadline, permit
          amount,
          ONE_HOUR_IN_BLOCK_TIME * 24 * 7 * periodInWeeks,
          nonce,
          deadline,
          PERMIT_SIGNATURE,
        ]),
      })
    },
  }
}
