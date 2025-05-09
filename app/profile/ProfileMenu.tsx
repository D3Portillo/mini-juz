"use client"

import copy from "clipboard-copy"
import { useWorldAuth } from "@radish-la/world-auth"
import { useToast } from "@worldcoin/mini-apps-ui-kit-react"

import { HiDotsHorizontal } from "react-icons/hi"
import MainSelect from "@/components/MainSelect"

export default function ProfileMenu() {
  const { toast } = useToast()
  const { signOut, user } = useWorldAuth()

  function handleCopyAddress() {
    const address = user?.walletAddress
    if (address) {
      copy(address)
      return toast.success({
        title: "Copied to clipboard",
      })
    }

    toast.error({
      title: "No address found",
    })
  }

  function handleViewTxs() {
    const address = user?.walletAddress
    if (address) {
      window.open(`https://worldscan.org/address/${address}`, "_blank")
      return
    }
    toast.error({
      title: "No address found",
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
          label: "Copy address",
          value: "copy-address",
        },
        {
          label: "View in Worldscan",
          value: "view-txs",
        },
        {
          label: "Disconnect",
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
