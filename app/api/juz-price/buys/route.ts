export async function GET() {
  const res = await fetch(
    "https://app.posthog.com/api/projects/155375/events?event=otc-swap&order=-timestamp&limit=10",
    {
      headers: {
        Authorization: `Bearer ${process.env.POSTHOG}`,
      },
    }
  )

  const data = await res.json()
  const response = Response.json(
    (data?.results || []).map((event: any) => {
      return {
        timestamp: event.timestamp,
        amount: event.properties.amount,
        address: event.properties.address,
      }
    })
  )

  response.headers.set(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=29"
  )

  return response
}
