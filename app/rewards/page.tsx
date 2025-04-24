import { TopBar } from "@worldcoin/mini-apps-ui-kit-react"
import RouteBackButton from "@/components/RouteBackButton"

export default function PageRewards() {
  return (
    <section className="min-h-screen">
      <nav className="border-b bg-white top-0 sticky z-10">
        <TopBar
          className="py-0 px-5"
          startAdornment={<RouteBackButton />}
          title="Boost your rewards"
        />
      </nav>

      <div className="flex px-4 mt-4 mb-12 flex-col gap-5">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
        maiores quidem officia ut doloribus cumque iste numquam incidunt? Omnis
        incidunt facere animi modi! Maxime, ex libero inventore dolor doloremque
        aperiam.
      </div>
    </section>
  )
}
