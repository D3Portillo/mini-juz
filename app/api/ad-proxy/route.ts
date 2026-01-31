export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")
  if (!key) {
    return Response.json({ error: "Missing key parameter" }, { status: 400 })
  }

  try {
    const scriptUrl = `https://www.highperformanceformat.com/${key}/invoke.js`

    const response = await fetch(scriptUrl, {
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
      },
    })

    if (!response.ok) throw new Error("Failed to fetch script")
    const script = await response.text()
    return new Response(script, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error({ error })
    return Response.json({ error: "Failed to load ad script" }, { status: 500 })
  }
}
