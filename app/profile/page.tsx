"use client"

import { Fragment } from "react"
import { useTranslations, useLocale } from "next-intl"

import Link from "next/link"
import { TopBar } from "@worldcoin/mini-apps-ui-kit-react"
import { useRouter } from "next/navigation"
import { useWorldAuth } from "@radish-la/world-auth"

import { JUZDistributionModal } from "@/app/rewards/JuzDistributionModal"
import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"

import { MdOutlineArrowOutward } from "react-icons/md"
import {
  FaArrowRight,
  FaBug,
  FaChevronRight,
  FaLemon,
  FaTelegramPlane,
} from "react-icons/fa"

import { TbWorldPin } from "react-icons/tb"
import { RiHeartAdd2Fill } from "react-icons/ri"

import { useAccountGameData } from "@/lib/atoms/game"
import { useAccountBalances } from "@/lib/atoms/balances"
import { shortifyDecimals } from "@/lib/numbers"

import FixedTopContainer from "@/components/FixedTopContainer"
import DialogInvites from "@/components/DialogInvites"
import LemonIcon from "@/components/LemonIcon"

import ProfileMenu from "./ProfileMenu"
import LanguageMenu from "./LanguageMenu"

import asset_bg from "@/assets/bg.png"

export default function PageProfile() {
  const locale = useLocale()
  const tglobal = useTranslations("global")
  const t = useTranslations("Profile")

  const router = useRouter()
  const { user, isConnected, signIn } = useWorldAuth()
  const { played, won } = useAccountGameData()
  const { TotalJUZBalance } = useAccountBalances()

  return (
    <main>
      <FixedTopContainer className="border-b">
        <TopBar startAdornment={<RouteBackButton />} title={t("title")} />
      </FixedTopContainer>

      <div className="flex relative px-4 pt-10 mb-12 flex-col gap-5">
        <div className="absolute top-4 left-5">
          <LanguageMenu
            trigger={
              <button className="flex outline-none py-0.5 text-sm gap-1 border-2 pl-1 pr-2 border-black rounded-2xl items-center">
                <TbWorldPin className="text-lg" />
                <strong className="font-semibold uppercase">{locale}</strong>
              </button>
            }
          />
        </div>

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
            {isConnected ? user?.username : tglobal("not-connected")}
          </strong>
        </div>

        <div className="grid mt-2 grid-cols-2 gap-4">
          <section className="p-4 rounded-2xl border-3 border-black shadow-3d-lg">
            <h2 className="text-sm">{t("gamesPlayed")}</h2>
            <p className="text-2xl font-semibold">{played}</p>
          </section>

          <section className="p-4 rounded-2xl border-3 border-black shadow-3d-lg">
            <h2 className="text-sm">{t("gamesWon")}</h2>
            <p className="text-2xl font-semibold">{won}</p>
          </section>
        </div>

        {isConnected ? (
          <Fragment>
            <JUZDistributionModal>
              <button
                style={{
                  backgroundImage: `url(${asset_bg.src})`,
                }}
                className="border-3 relative outline-none grid gap-1 pt-4 pb-3 place-items-center rounded-2xl bg-cover bg-center bg-black/90 border-black shadow-3d-lg"
              >
                <MdOutlineArrowOutward className="absolute text-2xl text-white top-3 right-3" />
                <h2 className="font-semibold text-6xl text-juz-green-lime">
                  {shortifyDecimals(TotalJUZBalance.formatted)}
                </h2>
                <p className="text-white">{t("totalJUZ")}</p>
              </button>
            </JUZDistributionModal>

            <DialogInvites
              trigger={
                <LemonButton className="bg-white rounded-2xl p-4 text-left gap-6 flex items-center">
                  <LemonIcon className="size-16">
                    <RiHeartAdd2Fill className="text-2xl scale-125" />
                  </LemonIcon>

                  <div className="flex-grow">
                    <span className="text-lg">{t("inviteYourFriends")}</span>
                    <nav className="flex mt-0.5 mb-1">
                      <div className="pl-2 pr-3 py-1 text-xs font-medium flex items-center gap-1 border rounded-full text-black border-juz-green-lime bg-juz-green-lime/15">
                        <FaLemon />
                        <span>10 JUZ / {tglobal("friend")}</span>
                      </div>
                    </nav>
                  </div>

                  <FaChevronRight className="text-lg" />
                </LemonButton>
              }
            />

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
            {tglobal("connectWallet")}
          </LemonButton>
        )}

        <hr className="mt-2" />

        <nav className="flex whitespace-nowrap text-sm opacity-60 gap-8 justify-center items-center">
          <Link
            target="_blank"
            className="underline flex items-center gap-2 underline-offset-4"
            href="https://t.me/+1m4vng7THvVmNmIx"
          >
            <span>{t("joinCommunity")}</span>
            <FaTelegramPlane className="text-[122%]" />
          </Link>

          <Link
            target="_blank"
            className="underline flex items-center gap-2.5 underline-offset-4"
            href="https://t.me/+1m4vng7THvVmNmIx"
          >
            <span>{t("support")}</span>
            <FaBug className="text-[105%]" />
          </Link>
        </nav>
      </div>
    </main>
  )
}
