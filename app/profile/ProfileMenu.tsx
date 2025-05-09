"use client"

import copy from "clipboard-copy"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"
import { useTranslations } from "next-intl"

import { HiDotsHorizontal } from "react-icons/hi"
import MainSelect from "@/components/MainSelect"

export default function ProfileMenu() {
  const { toast } = useToast()
  const t = useTranslations("ProfileMenu")
  const { signOut, user } = useWorldAuth()

  function handleCopyAddress() {
    const address = user?.walletAddress
    if (address) {
      copy(address)
      return toast.success({
        title: t("clipboardCopied"),
      })
    }

    toast.error({
      title: t("errors.noAddress"),
    })
  }

  function handleViewTxs() {
    const address = user?.walletAddress
    if (address) {
      window.open(`https://worldscan.org/address/${address}`, "_blank")
      return
    }
    toast.error({
      title: t("errors.noAddress"),
    })
  }

  return (
    <MainSelect
      value="NONE" // Dummy value to trigger the select
      showSelectedItem={false}
      onValueChange={(value) => {
        if (value === "disconnect") {
          signOut()
        } else if (value === "view-txs") {
          handleViewTxs()
        } else handleCopyAddress()
      }}
      options={[
        {
          label: t("copyAddress"),
          value: "copy-address",
        },
        {
          label: t("viewInWorldscan"),
          value: "view-txs",
        },
        {
          label: t("disconnect"),
          value: "disconnect",
        },
      ]}
    >
      <button className="text-xl outline-none p-2">
        <HiDotsHorizontal className="scale-125" />
      </button>
    </MainSelect>
  )
}
