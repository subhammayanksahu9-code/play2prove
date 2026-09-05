export const dynamic = "force-dynamic";

const GOOGLE_SHEETS_API =
  process.env.PLAY2PROVE_GOOGLE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbx3vZuDmwpqykeX45oWhNffRqySbFQZ6a5ZukM3KEhB6B5e8I6rzWBmg8tsm_zUNz0/exec";

function normalizePayload(payload) {
  if (Array.isArray(payload)) {
    return { success: true, games: [], tournaments: payload };
  }

  return {
    ...payload,
    success: payload?.success !== false,
    games: Array.isArray(payload?.games) ? payload.games : [],
    tournaments: Array.isArray(payload?.tournaments) ? payload.tournaments : [],
  };
}

export async function GET() {
  try {
    const response = await fetch(GOOGLE_SHEETS_API, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script API ${response.status}`);
    }

    const raw = await response.json();
    const data = normalizePayload(raw);

    return Response.json(
      {
        ...data,
        source: "google-sheets-apps-script",
        serverTimestamp: Date.now(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Google Sheets Tournament API Error:", error);

    return Response.json(
      {
        success: false,
        source: "google-sheets-apps-script",
        games: [],
        tournaments: [],
        error: error?.message || "Google Sheets API unavailable",
        serverTimestamp: Date.now(),
      },
      { status: 502 }
    );
  }
}
