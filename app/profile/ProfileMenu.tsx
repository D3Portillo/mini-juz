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
      toast.success({
        title: "Copied to clipboard",
      })
    } else {
      toast.error({
        title: "No address found",
      })
    }
  }

  return (
    <MainSelect
      showSelectedItem={false}
      onValueChange={(value) => {
        if (value === "disconnect") {
          signOut()
        } else handleCopyAddress()
      }}
      options={[
        {
          label: "Copy address",
          value: "copy-address",
        },
        {
          label: "Disconnect",
          value: "disconnect",
        },
      ]}
    >
      {() => (
        <button className="text-xl outline-none p-2">
          <HiDotsHorizontal className="scale-125" />
        </button>
      )}
    </MainSelect>
  )
}
