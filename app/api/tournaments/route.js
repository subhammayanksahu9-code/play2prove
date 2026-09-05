import { createClient } from "@supabase/supabase-js";

export const revalidate = 15;

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const [{ data: games, error: gamesError }, { data: tournaments, error: tournamentsError }] =
      await Promise.all([
        supabase
          .from("games")
          .select("id,game_name,game_short_name,image_url,status,publish,device,display_order")
          .eq("active", true)
          .eq("publish", true)
          .order("display_order", { ascending: true })
          .order("id", { ascending: true }),
        supabase
          .from("tournaments")
          .select("id,tournament_id,game_short_name,tournament_name,match_date,start_time,mode_format_id,map,entry_fee,per_kill,prize_pool,game_standards,gg_standard_statement,parts_of_day,publish,status,slots_of_mode")
          .eq("active", true)
          .eq("publish", true)
          .order("match_date", { ascending: true })
          .order("start_time", { ascending: true })
          .order("id", { ascending: true }),
      ]);

    if (gamesError) throw gamesError;
    if (tournamentsError) throw tournamentsError;

    const gameMap = new Map((games || []).map((g) => [g.game_short_name, g]));

    return Response.json(
      {
        success: true,
        source: "supabase",
        serverTimestamp: Date.now(),
        games: (games || []).map((g) => ({
          ...g,
          gameShortName: g.game_short_name,
          gameName: g.game_name,
          image: g.image_url,
        })),
        tournaments: (tournaments || []).map((t) => ({
          ...t,
          tournamentId: t.tournament_id,
          gameShortName: t.game_short_name,
          tournamentName: t.tournament_name,
          date: t.match_date,
          time: t.start_time,
          mode: t.mode_format_id,
          entryFee: t.entry_fee,
          perKill: t.per_kill,
          prizePool: t.prize_pool,
          gameStandards: t.game_standards,
          ggStandardStatement: t.gg_standard_statement,
          game: gameMap.get(t.game_short_name) || null,
        })),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Supabase Tournament API Error:", error);
    return Response.json(
      {
        success: false,
        source: "supabase",
        games: [],
        tournaments: [],
        error: error?.message || "Supabase API unavailable",
        serverTimestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
