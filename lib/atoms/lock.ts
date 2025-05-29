import { parseAbi } from "viem"
import {
  ADDRESS_JUZ,
  ADDRESS_LOCK_CONTRACT,
  ADDRESS_VE_JUZ,
  ONE_HOUR_IN_BLOCK_TIME,
} from "@/lib/constants"
import { serializeBigint } from "@/lib/utils"
import { appendSignatureResult, usePermittedTransfer } from "./erc20"

const ABI = parseAbi([
  "function withdrawJUZ(uint256 _burningVeJUZ, uint256 _nonce, uint256 _deadline, bytes calldata _signature) external returns (uint256 withdrawableJUZ)",
  "function lockJUZ(uint256 _amount, uint256 _duration, uint256 _nonce, uint256 _deadline, bytes calldata _signature) external",
])

export const useLockJUZ = () => {
  const { permitTransfer } = usePermittedTransfer()

  return {
    lock: (amount: bigint, periodInWeeks: number) => {
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
          appendSignatureResult(),
        ]),
      })
    },
    unlockJUZ: (amount: bigint) => {
      const deadline = Math.floor(Date.now() / 1000) + ONE_HOUR_IN_BLOCK_TIME
      const nonce = Date.now()

      return permitTransfer({
        nonce,
        amount,
        deadline,
        abi: ABI,
        recipient: ADDRESS_LOCK_CONTRACT,
        functionName: "withdrawJUZ",
        token: ADDRESS_VE_JUZ,
        args: serializeBigint([
          // uint256 _burningVeJUZ, uint256 _nonce, uint256 _deadline, bytes calldata _signature
          amount,
          nonce,
          deadline,
          appendSignatureResult(),
        ]),
      })
    },
  }
}
