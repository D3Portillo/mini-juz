"use client"

import { Fragment } from "react"
import { TopBar } from "@worldcoin/mini-apps-ui-kit-react"
import { useRouter } from "next/navigation"
import { useWorldAuth } from "@radish-la/world-auth"

import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"

import { FaArrowRight } from "react-icons/fa"
import ProfileMenu from "./ProfileMenu"

import asset_bg from "@/assets/bg.png"

export default function PageProfile() {
  const router = useRouter()
  const { user, isConnected, signIn } = useWorldAuth()

  return (
    <section className="min-h-screen">
      <nav className="border-b bg-white top-0 sticky z-10">
        <TopBar
          className="py-0 gap-5 px-5"
          startAdornment={<RouteBackButton />}
          title="Manage profile"
        />
      </nav>

      <div className="flex relative px-4 pt-10 mb-12 flex-col gap-5">
        {isConnected && (
          <div className="absolute top-3 right-5">
            <ProfileMenu />
          </div>
        )}

        <div className="grid place-items-center">
          <figure
            style={{
              backgroundImage: `url(${
                user?.profilePictureUrl || "/marble.png"
              })`,
            }}
            className="bg-cover size-24 bg-center bg-black/3 border-2 shadow-3d border-black rounded-full overflow-hidden"
          />

          <strong className="font-semibold text-xl mt-2">
            {isConnected ? user?.username : "Not connected"}
          </strong>
        </div>

        <hr className="mt-4" />

        <div className="grid grid-cols-2 gap-4">
          <section className="p-4 rounded-2xl border-3 border-black shadow-3d-lg">
            <h2 className="text-sm">Games played</h2>
            <p className="text-2xl font-semibold">245</p>
          </section>

          <section className="p-4 rounded-2xl border-3 border-black shadow-3d-lg">
            <h2 className="text-sm">Games won</h2>
            <p className="text-2xl font-semibold">42</p>
          </section>
        </div>

        {isConnected ? (
          <Fragment>
            <section
              style={{
                backgroundImage: `url(${asset_bg.src})`,
              }}
              className="border-3 grid gap-1 pt-4 pb-3 place-items-center rounded-2xl bg-cover bg-center bg-black/90 border-black shadow-3d-lg"
            >
              <h2 className="font-semibold text-6xl text-juz-green-lime">
                245
              </h2>
              <p className="text-white">Total earned JUZ</p>
            </section>

            <LemonButton
              onClick={() => router.push("/rewards")}
              className="py-3.5 mt-1 flex items-center justify-between rounded-full"
            >
              <span className="text-base">Lock my JUZ</span>
              <FaArrowRight className="text-lg" />
            </LemonButton>
          </Fragment>
        ) : (
          <LemonButton
            onClick={signIn}
            className="bg-juz-green-lime text-base py-3.5"
          >
            Connect Wallet
          </LemonButton>
        )}
      </div>
    </section>
  )
}
