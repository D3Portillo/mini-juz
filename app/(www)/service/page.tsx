"use client"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useState } from "react"
import { isAddress } from "viem"

export default function SelfServicePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [address, setAddress] = useState("")
  const [jsonResponse, setJsonResponse] = useState<any>(null)

  function handleCheck() {
    if (!isAddress(address)) {
      return toast.error({
        title: "Invalid address format",
      })
    }

    setJsonResponse(null)
    setIsLoading(true)

    fetch(`/api/solution/0/${address}`)
      .then(async (data) => {
        const json = await data.json()
        if (!data.ok) {
          throw new Error(json.message || "Failed to fetch data")
        }

        setJsonResponse(json)
      })
      .catch(() => {
        toast.error({
          title: "Something went wrong",
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <main className="w-full pt-6 mb-12 px-5 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold">Self check service</h2>

      <p className="mt-1">
        Check the status of your withdrawal from the WLD/WETH pool.
      </p>

      <label className="flex mt-4 gap-2 p-3 bg-juz-green/10 rounded-xl items-center border-2 border-black shadow-3d">
        <input
          disabled={isLoading}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="font-medium w-full bg-transparent outline-none placeholder:text-black flex-grow"
        />

        <button
          disabled={isLoading}
          onClick={handleCheck}
          className="font-semibold"
        >
          CHECK
        </button>
      </label>

      <pre className="mt-4">
        {jsonResponse
          ? JSON.stringify(
              {
                status: "pending",
                owed: jsonResponse.owed,
                earned: {
                  WLD: getEstimatedEarnings(jsonResponse.owed.amount0),
                  WETH: getEstimatedEarnings(jsonResponse.owed.amount1),
                },
              },
              null,
              2
            )
          : "Enter an address and click CHECK to see the response."}
      </pre>
    </main>
  )
}

function getEstimatedEarnings(principal: number): number {
  const apr = 3.6 // 360% APR
  const days = 2
  const earnings = principal * (apr / 365) * days
  return earnings
}
