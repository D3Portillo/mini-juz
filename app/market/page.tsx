import { TopBar } from "@worldcoin/mini-apps-ui-kit-react"
import RouteBackButton from "@/components/RouteBackButton"
import { FaHeart } from "react-icons/fa"
import LemonButton from "@/components/LemonButton"

export default function PageProfile() {
  return (
    <section className="min-h-screen">
      <nav className="border-b bg-white top-0 sticky z-10">
        <TopBar
          className="py-0 gap-5 px-5"
          startAdornment={<RouteBackButton />}
          title="Buy collectibles"
        />
      </nav>

      <div className="flex [&_strong]:font-medium px-4 mt-5 mb-12 flex-col gap-4">
        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d-lg">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-bl from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl">🧃</div>
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
              <strong>300 JUZ</strong> to stake or level up your profile.
            </p>

            <LemonButton className="py-3 rounded-full text-base w-full mt-5">
              Buy for 10 WLD
            </LemonButton>
          </div>
        </section>

        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d-lg">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-bl from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl">🖤</div>
          </figure>

          <div>
            <h2 className="font-medium text-xl">
              Heart Pack <span className="text-juz-orange">#1</span>
            </h2>

            <p className="text-sm opacity-70">
              Buy a pack of 5 hearts. Hearts will be added to your current heart
              points.
            </p>

            <LemonButton className="py-3 rounded-full text-base w-full mt-5">
              Buy for 3 WLD
            </LemonButton>
          </div>
        </section>

        <section className="p-4 flex gap-6 rounded-2xl border-2 border-black shadow-3d-lg">
          <figure className="border-2 flex items-center justify-center overflow-hidden shrink-0 size-24 border-black shadow-3d bg-gradient-to-bl from-juz-green-lime to-juz-green-ish rounded-full">
            <div className="text-5xl">😍</div>
          </figure>

          <div>
            <h2 className="font-medium text-xl">
              Heart Pack <span className="text-juz-orange">#2</span>
            </h2>

            <p className="text-sm opacity-70">
              Buy a pack of 10 hearts. Hearts will be added to your current
              heart points.
            </p>

            <LemonButton className="py-3 rounded-full text-base w-full mt-5">
              Buy for 5 WLD
            </LemonButton>
          </div>
        </section>
      </div>
    </section>
  )
}
