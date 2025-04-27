"use client"

import { Fragment } from "react"
import { TopBar } from "@worldcoin/mini-apps-ui-kit-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import RouteBackButton from "@/components/RouteBackButton"
import asset_running from "@/assets/running.png"
import asset_frog from "@/assets/frog.png"
import Image from "next/image"

export default function PageRewards() {
  return (
    <section className="min-h-screen">
      <nav className="border-b border-black/15 bg-white top-0 sticky z-10">
        <TopBar
          className="py-0 gap-5 px-5"
          startAdornment={<RouteBackButton />}
          title="Boost your rewards"
        />
      </nav>

      <Tabs asChild defaultValue="lock">
        <Fragment>
          <div className="bg-gradient-to-b from-juz-orange/7 to-juz-orange/0">
            <nav className="px-5 pb-16">
              <TabsList className="border-b flex items-center border-b-black/5">
                <TabsTrigger
                  className="border-b-2 flex items-center gap-4 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="lock"
                >
                  JUZ Locking
                </TabsTrigger>

                <TabsTrigger
                  className="border-b-2 px-6 py-3 border-transparent data-[state=active]:border-black font-semibold"
                  value="drops"
                >
                  Drops 🚀
                </TabsTrigger>
              </TabsList>
            </nav>
          </div>

          <div className="-mt-8 px-5">
            <TabsContent asChild value="lock">
              <div>
                <h2 className="font-medium text-xl">JUZ Locking</h2>
                <div className="flex items-start gap-4">
                  <p className="mt-2 text-sm">
                    Earn more JUZ by locking it for a period of time. In the
                    future locked JUZ can be used for goverance, to access
                    incentives like reward pools or airdrops.
                  </p>

                  <figure className="w-40 -mt-2 shrink-0">
                    <Image placeholder="blur" alt="" src={asset_running} />
                  </figure>
                </div>
              </div>
            </TabsContent>

            <TabsContent asChild value="drops">
              <div>
                <h2 className="font-medium text-xl">Lemon Drops</h2>
                <div className="flex items-start gap-7">
                  <p className="mt-2 text-sm">
                    We're working on a new way for you to earn rewards from
                    communities in World. Incentives are distributed by doing
                    tasks or learning. This is called a{" "}
                    <strong className="font-medium">Lemon Drop</strong>.
                  </p>

                  <figure className="w-32 -mt-3 shrink-0">
                    <Image placeholder="blur" alt="" src={asset_frog} />
                  </figure>
                </div>

                <div className="mt-14 border border-dashed border-black/20 rounded-2xl p-4 text-center text-sm">
                  Coming soon ⚡
                </div>
              </div>
            </TabsContent>
          </div>
        </Fragment>
      </Tabs>
    </section>
  )
}
