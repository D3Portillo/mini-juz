import { bytesToHex, type Hex, hexToBytes } from "viem"

/**
 * Extract `v`, `r`, and `s` from a permit signature
 * @param signature
 */
export const toSplittedSignature = (signature: Hex) => {
  const signatureBytes = hexToBytes(signature)
  const r = bytesToHex(signatureBytes.slice(0, 32), {
    size: 32,
  })
  const s = bytesToHex(signatureBytes.slice(32, 64), {
    size: 32,
  })

  const v = signatureBytes[64]

  return {
    r,
    s,
    v,
  }
}
