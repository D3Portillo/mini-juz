"use client"

import { TopBar, useToast } from "@worldcoin/mini-apps-ui-kit-react"
import RouteBackButton from "@/components/RouteBackButton"
import LemonButton from "@/components/LemonButton"
import { useWorldAuth } from "@radish-la/world-auth"
import { executeWorldPyment } from "@/actions/payments"

export default function PageProfile() {
  const { toast } = useToast()
  const { signIn, user } = useWorldAuth()

  async function handleBuyHearts(amount: number, cost: number) {
    if (!user?.walletAddress) return signIn()

    const result = await executeWorldPyment({
      amount: cost, // in WLD
      initiatorAddress: user.walletAddress,
      paymentDescription: `Confirm to buy a Pack of ${amount} hearts in JUZ Mini App`,
    })

    if (result) {
      // TODO: Add and store hearts to user
      return toast.success({
        title: "Pack of hearts purchased",
      })
    }
  }

  async function handleBuyJUZ() {
    if (!user?.walletAddress) return signIn()

    const result = await executeWorldPyment({
      amount: 10, // 10 WLD
      initiatorAddress: user.walletAddress,
      paymentDescription: "Confirm to buy the JUZ Master NFT in JUZ Mini App",
    })

    if (result) {
      // TODO: Add and store hearts to user
      return toast.success({
        title: "Long live the Master of JUZ",
      })
    }
  }

  // TODO: There must be a total limit of hearts holding per user

  return (
    <section className="min-h-screen">
      <nav className="border-b bg-white top-0 sticky z-10">
        <TopBar
          className="py-0 gap-5 px-5"
          startAdornment={<RouteBackButton />}
          title="Level up your profile"
        />
      </nav>

      <div className="flex [&_strong]:font-medium px-4 mt-5 mb-12 flex-col gap-4">
        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl">🍋</div>
          </figure>

          <div>
            <h2 className="font-medium text-xl">
              JUZ Master <span className="text-juz-orange">NFT</span>
            </h2>

            <p className="text-sm opacity-70">
              Get an exclusive early adopter NFT in <strong>worldchain</strong>{" "}
              your first purchase.
            </p>

            <p className="text-sm mt-2 opacity-70">
              <strong>300 JUZ</strong> to your account.
            </p>

            <LemonButton
              onClick={handleBuyJUZ}
              className="py-3 rounded-full text-base w-full mt-5"
            >
              Buy for 10 WLD
            </LemonButton>
          </div>
        </section>

        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl mt-1">🖤</div>
          </figure>

          <div>
            <h2 className="font-medium text-xl">
              Heart Pack <span className="text-juz-orange">#1</span>
            </h2>

            <p className="text-sm opacity-70">
              Buy a pack of 5 hearts. Hearts will be added to your current heart
              points.
            </p>

            <LemonButton
              onClick={() => handleBuyHearts(5, 3)}
              className="py-3 rounded-full text-base w-full mt-5"
            >
              Buy for 3 WLD
            </LemonButton>
          </div>
        </section>

        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-tr from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl">❤️‍🔥</div>
          </figure>

          <div>
            <h2 className="font-medium text-xl">
              Heart Pack <span className="text-juz-orange">#2</span>
            </h2>

            <p className="text-sm opacity-70">
              Buy a pack of 10 hearts. Hearts will be added to your current
              heart points.
            </p>

            <LemonButton
              onClick={() => handleBuyHearts(10, 5)}
              className="py-3 rounded-full text-base w-full mt-5"
            >
              Buy for 5 WLD
            </LemonButton>
          </div>
        </section>
      </div>
    </section>
  )
}
