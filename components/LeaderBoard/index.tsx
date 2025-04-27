export default function LeaderBoard() {
  return (
    <section className="px-4 mt-4 mb-10 flex flex-col gap-2">
      <div className="flex h-12 whitespace-nowrap px-5 gap-4 font-semibold rounded-2xl border-2 shadow-3d border-black items-center bg-gradient-to-bl from-juz-green-lime to-juz-green-ish">
        <div className="w-12">#</div>
        <div className="flex-grow">User</div>
        <div className="w-24">Earned JUZ</div>
      </div>

      {Array.from({ length: 10 }).map((_, i) => (
        <PlayerData key={`mock-p-${i}`} position={i + 1} />
      ))}

      <p className="max-w-xs mt-2 text-sm mx-auto text-center">
        It can take a while to update the leaderboard. Thanks for your patience!
      </p>

      <hr className="mt-10 mb-5" />

      <div className="p-5 gap-4 font-semibold rounded-2xl shadow-3d-lg border-2 border-black">
        <nav className="flex items-center justify-between">
          <span className="text-2xl text-juz-green">#32</span>

          <div className="bg-juz-green-lime text-sm px-3 py-0.5 rounded-full font-semibold text-black border-2 border-black">
            242 JUZ
          </div>
        </nav>

        <nav className="flex mt-3 items-center gap-2">
          <figure className="size-8 bg-black rounded-full" />
          <h2 className="font-semibold text-xl">deca.242 (You)</h2>
        </nav>
      </div>
    </section>
  )
}

function PlayerData({ position = 1 }: { position?: number }) {
  return (
    <div className="flex h-14 whitespace-nowrap px-5 gap-4 font-semibold rounded-xl border-2 shadow-3d border-black items-center bg-juz-green-ish/20 even:bg-juz-green-ish/3">
      <div className="w-12">{position}</div>
      <div className="flex-grow">deca.242</div>
      <div className="w-24 text-end">424</div>
    </div>
  )
}
