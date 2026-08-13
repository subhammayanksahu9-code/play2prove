const GOOGLE_API =
  "https://script.google.com/macros/s/AKfycbw9k1jNIE-971OTPZQO6bf_0tX5bcYPHZc5nE_bCqcdbRzeGcQa9zOxmaT7Di3Q5QhS/exec";

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
          "public, s-maxage=10, stale-while-revalidate=60",
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
