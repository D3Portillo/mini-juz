"use client"

import Link from "next/link"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"
import ReusableDialog from "@/components/ReusableDialog"

export default function RewardDialogTrigger() {
  return (
    <ReusableDialog
      title="Reward Tokens"
      trigger={
        <button className="flex -mb-1 flex-col items-end">
          <div className="flex justify-end shrink-0 -space-x-1.5">
            <img
              alt=""
              className="size-6 rounded-full border-2 border-black"
              src="/token/WETH.png"
            />
            <img alt="" className="size-6 rounded-full" src="/token/WLD.png" />
            <img
              alt=""
              className="size-6 rounded-full border-2 border-black"
              src="/token/JUZ.png"
            />
          </div>
          <div className="text-xs">REWARDS</div>
        </button>
      }
    >
      <p>The list of assets to be earned by depositing in the WLD/WETH pool.</p>

      <p>
        <div className="flex gap-3 flex-col shrink-0">
          <TokenRow
            index={0}
            symbol="WETH"
            externalURL="https://worldscan.org/token/0x4200000000000000000000000000000000000006"
            icon={
              <img
                alt=""
                className="size-8 rounded-xl border-2 border-black"
                src="/token/WETH.png"
              />
            }
          />

          <TokenRow
            index={1}
            symbol="WLD"
            externalURL="https://worldscan.org/token/0x2cFc85d8E48F8EAB294be644d9E25C3030863003"
            icon={
              <img alt="" className="size-8 rounded-xl" src="/token/WLD.png" />
            }
          />

          <TokenRow
            index={2}
            symbol="JUZ"
            externalURL="https://worldscan.org/token/0x14ddC988bdF1E1aea0BFf8351DDC3F59176E56d3"
            icon={
              <img
                alt=""
                className="size-8 rounded-xl border-2 border-black"
                src="/token/JUZ.png"
              />
            }
          />
        </div>
      </p>
    </ReusableDialog>
  )
}

function TokenRow({
  icon,
  symbol,
  externalURL,
  externalURLText = "Worldscan",
  index,
}: {
  icon: JSX.Element
  symbol: string
  externalURLText?: string
  externalURL: string
  index: number
}) {
  return (
    <div className="flex border shadow-inner bg-black/3 rounded-2xl py-2 pl-2 pr-4 items-center gap-2">
      <div className="w-6 grid font-medium place-content-center text-black">
        {index + 1}
      </div>
      <nav className="flex drop-shadow-md pr-3 gap-2 items-center bg-gradient-to-tl from-black/80 to-black/90 rounded-xl overflow-hidden">
        {icon}
        <span className="text-white text-sm font-medium uppercase">
          {symbol}
        </span>
      </nav>
      <div className="flex-grow" />
      <Link
        className="text-sm flex items-center gap-2"
        target="_blank"
        href={externalURL}
      >
        <span>{externalURLText}</span>
        <FaArrowUpRightFromSquare className="text-sm" />
      </Link>
    </div>
  )
}
