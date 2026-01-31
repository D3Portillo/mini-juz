export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")
  if (!key) {
    return Response.json({ error: "Missing key parameter" }, { status: 400 })
  }

  try {
    const scriptUrl = `https://www.highperformanceformat.com/${key}/invoke.js`

    const response = await fetch(scriptUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "http://localhost:3000",
        Origin: "http://localhost:3000",
      },
    })

    if (!response.ok) throw new Error("Failed to fetch script")
    const script = await response.text()
    return new Response(script, {
      headers: {
        "Content-Type": "text/javascript",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error({ error })
    return Response.json({ error: "Failed to load ad script" }, { status: 500 })
  }
}
