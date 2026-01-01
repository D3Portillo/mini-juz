"use client"

import { useEffect, useState } from "react"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useAtom } from "jotai"

import { atomWithStorage } from "jotai/utils"
import LemonButton from "@/components/LemonButton"

const atomIsWelcomeRead = atomWithStorage("juz.data.isWelcomeRead", false)
export const useIsWelcomeRead = () => useAtom(atomIsWelcomeRead)

export default function WelcomeModal() {
  const [isReady, setIsReady] = useState(false)
  const [isWelcomeRead, setIsWelcomeRead] = useIsWelcomeRead()
  const { toast } = useToast()

  useEffect(() => setIsReady(true), [])

  function handleAccept() {
    // Small delay to avoid jank
    setTimeout(() => setIsWelcomeRead(true), 250)

    toast.success({
      title: "Spin the wheel to start playing!",
    })
  }

  if (!isReady) return null
  if (isWelcomeRead) return null

  return (
    <main className="fixed bg-white/85 p-6 backdrop-blur-md inset-0 grid place-items-center z-[15]">
      <div className="bg-white rounded-2xl border-2 border-black shadow-3d-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold">
          Are you good at <br />
          trivia 🤔?
        </h1>

        <p className="mt-4 text-sm">
          Join the JUZ arena and test your knowledge! Answer questions, earn
          rewards, compete with people around the{" "}
          <strong className="font-medium">World</strong>.
        </p>

        <p className="mt-4 text-sm">Ready to become a trivia master?</p>

        <LemonButton
          onClick={handleAccept}
          className="mt-4 py-3.5 w-full text-base"
        >
          I'm ready!
        </LemonButton>
      </div>
    </main>
  )
}
