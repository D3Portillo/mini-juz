"use client"

import type { Address } from "viem"

import { useAtom } from "jotai"
import useSWR from "swr"
import { useWorldAuth } from "@radish-la/world-auth"
import { useTranslations } from "next-intl"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { getPlayerRank } from "@/actions/game"
import { atomWithStorage } from "jotai/utils"
import { ONE_DAY_IN_MS } from "@/lib/constants"
import { MiniKit } from "@worldcoin/minikit-js"
import { isToday } from "date-fns"

const atomIsExplainerConfirmed = atomWithStorage(
  "juz.isExplainerConfirmed",
  false
)

/**
 * Used to know if the user has confirmed the explainer in main page
 */
export const useAtomExplainerConfirmed = () => useAtom(atomIsExplainerConfirmed)

const INITIAL_PLAYER_HEARTS = 3
const atomPlayerHearts = atomWithStorage(
  "juz.totalPlayerHearts",
  INITIAL_PLAYER_HEARTS
)

const DEFAULT_REFILL_STATE = {
  zeroHeartsTimestamp: 0,
  isClaimed: false,
}

const atomHeartsRefill = atomWithStorage(
  "juz.heartsRefill",
  DEFAULT_REFILL_STATE
)

export const usePlayerHearts = () => {
  const [{ isClaimed, zeroHeartsTimestamp }, setHeartsRefill] =
    useAtom(atomHeartsRefill)
  const [hearts, setHearts] = useAtom(atomPlayerHearts)

  const removeHeart = () => setHearts((h) => Math.max(h - 1, 0))

  const refill = (opts?: { isForcedRefill?: boolean }) => {
    if (hearts < INITIAL_PLAYER_HEARTS) {
      setHearts(INITIAL_PLAYER_HEARTS)
    }

    // We omit setting claimed timestamp if "forced"
    if (!opts?.isForcedRefill) {
      setHeartsRefill({
        zeroHeartsTimestamp: Date.now(),
        isClaimed: false,
      })
    }
  }

  const nextRefillTime = zeroHeartsTimestamp
    ? zeroHeartsTimestamp + ONE_DAY_IN_MS
    : null

  return {
    refill,
    hearts,
    nextRefillTime,
    canBeRefilled: isClaimed
      ? false
      : nextRefillTime
      ? Date.now() > nextRefillTime && hearts < INITIAL_PLAYER_HEARTS
      : hearts < INITIAL_PLAYER_HEARTS,
    setHearts,
    removeHeart,
    isRefillClaimed: isClaimed,
    // Force null when invalid timestamp
    zeroHeartsTimestamp: zeroHeartsTimestamp || null,
  }
}

export const useAccountData = (address: Address | null) => {
  return useSWR(address ? `juz.data.min.${address}` : null, async () => {
    if (!address) return null
    const data = await MiniKit.getUserByAddress(address)
    return data
  })
}

export const useGameRank = (address: Address | null) => {
  const { data = null } = useSWR(
    address ? `juz.game.rank.${address}` : null,
    async () => {
      if (!address) return null
      return await getPlayerRank(address)
    }
  )

  return {
    rank: data,
  }
}

const atomImage = atomWithStorage("juz.imagePF", null as string | null)

export const useProfileImage = () => {
  const [localStorageImage, setLocalStorageImage] = useAtom(atomImage)

  const t = useTranslations("Profile")
  const { user, isConnected } = useWorldAuth()
  const { toast } = useToast()

  function setImage(image: File) {
    if (image.size > 2 * 1024 * 1024) {
      return toast.error({
        title: t("errors.fileTooBig"),
      })
    }

    if (image.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) setLocalStorageImage(result)
      }

      reader.readAsDataURL(image)
    }
  }

  const WORLD_IMAGES = user?.profilePictureUrl || "/marble.png"

  return {
    setImage,
    // Do not show localStorage image if user is not connected
    image: isConnected ? localStorageImage || WORLD_IMAGES : WORLD_IMAGES,
  }
}

const atomGamesWonToday = atomWithStorage("juz.gamesWonToday", {
  timestamp: 0,
  count: 0,
})

export const useGamesWonToday = () => {
  const [{ count, timestamp }, setGamesWonToday] = useAtom(atomGamesWonToday)
  const gamesWon = isToday(timestamp) ? count : 0

  return {
    gamesWon,
    timestamp,
    increment: () => {
      if (isToday(timestamp)) {
        return setGamesWonToday((prev) => ({
          ...prev,
          count: prev.count + 1,
        }))
      }

      setGamesWonToday({
        timestamp: Date.now(),
        count: 1,
      })
    },
  }
}
