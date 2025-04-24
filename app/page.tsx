"use client"

import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { FaRegLemon } from "react-icons/fa"

import LemonIcon from "@/components/LemonIcon"
import WheelSpin from "@/components/WheelSpin"
import Link from "next/link"

export default function PageHome() {
  const { toast } = useToast()

  return (
    <section>
      <nav className="border-b h-[4.5rem] px-5 flex gap-4 bg-white top-0 sticky z-10">
        <Link href="/profile" className="flex items-center gap-2">
          <figure className="size-10 bg-black rounded-full overflow-hidden" />
          <div>
            <p className="font-semibold text-lg">deca.4252</p>
            <p className="text-xs -mt-1">View profile</p>
          </div>
        </Link>

        <div className="flex-grow" />

        <button className="flex items-center gap-2">
          <LemonIcon className="size-9">
            <FaRegLemon className="text-xl" />
          </LemonIcon>
          <span className="text-xl font-semibold">0 JUZ</span>
        </button>
      </nav>

      <div className="flex px-4 mt-12 mb-12 flex-col gap-5">
        <div className="size-full overflow-clip grid place-items-center">
          <WheelSpin
            onItemSelected={(item) => {
              toast.success({
                style: {
                  marginTop: "3.25rem",
                },
                title: `Selected topic: ${item}`,
              })
            }}
            size="min(calc(95vw - 2rem), 24rem)"
            items={["React", "Javascript", "Crypto"]}
          />
        </div>
      </div>
    </section>
  )
}
