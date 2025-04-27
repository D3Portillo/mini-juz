"use client"

import Link from "next/link"

import { useWorldAuth } from "@radish-la/world-auth"
import { useRouter } from "next/navigation"

import { FaRegLemon } from "react-icons/fa"

import LemonIcon from "@/components/LemonIcon"
import MainSelect from "@/components/MainSelect"

export default function HomeNavigation() {
  const router = useRouter()
  const { user, signIn, signOut, isConnected } = useWorldAuth()

  const PROFILE = (
    <button
      onClick={isConnected ? undefined : signIn}
      className="flex outline-none text-left items-center gap-2"
    >
      <figure
        style={{
          backgroundImage: `url(${user?.profilePictureUrl || "/marble.png"})`,
        }}
        className="size-10 bg-cover bg-center bg-black/3 border-2 shadow-3d-bottom border-black rounded-full overflow-hidden"
      />
      <div>
        <p className="font-semibold text-lg">{user?.username || "Profile"}</p>
        <p className="text-xs -mt-1">
          {isConnected ? "Connected" : "Connect wallet"}
        </p>
      </div>
    </button>
  )

  return (
    <nav className="border-b h-[4.5rem] px-5 flex gap-4 bg-white top-0 sticky z-10">
      {isConnected ? (
        <MainSelect
          value="NONE" // Dummy value to trigger the select
          showSelectedItem={false}
          onValueChange={(value) => {
            if (value === "disconnect") {
              signOut()
            } else router.push("/profile")
          }}
          options={[
            {
              label: "Manage Profile",
              value: "profile",
            },
            {
              label: "Disconnect",
              value: "disconnect",
            },
          ]}
        >
          {PROFILE}
        </MainSelect>
      ) : (
        PROFILE
      )}

      <div className="flex-grow" />
      <JUZCounter />
    </nav>
  )
}

export function JUZCounter() {
  return (
    <Link href="/rewards" className="flex items-center gap-2">
      <LemonIcon className="size-9">
        <FaRegLemon className="text-xl" />
      </LemonIcon>
      <span className="text-xl font-semibold">0 JUZ</span>
    </Link>
  )
}
