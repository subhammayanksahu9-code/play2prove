const GOOGLE_API =
  "https://script.google.com/macros/s/AKfycbxBAvu7E74BDsPuoWKYGLZTeWTeyGlhKIju9wG8qlNh9ADLSpvaL99Y5m7m42kaZpMo/exec";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(GOOGLE_API, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error: `Google API ${response.status}`,
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    return Response.json(data, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Tournament API Error:", error);

    return Response.json(
      {
        success: false,
        error: "Tournament API unavailable",
      },
      { status: 500 }
    );
  }
}
