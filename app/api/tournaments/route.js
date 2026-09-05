import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const [{ data: games, error: gamesError }, { data: tournaments, error: tournamentsError }] =
      await Promise.all([
        supabase
          .from("games")
          .select("*")
          .order("display_order", { ascending: true })
          .order("id", { ascending: true }),
        supabase
          .from("tournaments")
          .select("*, games:game_id(*)")
          .order("match_date", { ascending: true })
          .order("start_time", { ascending: true })
          .order("id", { ascending: true }),
      ]);

    if (gamesError) {
      console.error("Supabase games error:", gamesError);
      return Response.json(
        { success: false, error: gamesError.message },
        { status: 502 }
      );
    }

    if (tournamentsError) {
      console.error("Supabase tournaments error:", tournamentsError);
      return Response.json(
        { success: false, error: tournamentsError.message },
        { status: 502 }
      );
    }

    const normalizedGames = (games || []).map((game) => ({
      id: game.id,
      gameId: game.id,
      gameName: game.name,
      name: game.name,
      slug: game.slug,
      shortName: game.short_name,
      description: game.description,
      status: game.status,
      image: game.image_url,
      imageUrl: game.image_url,
      bannerUrl: game.banner_url,
      publish: game.status !== "hidden",
    }));

    const normalizedTournaments = (tournaments || []).map((tournament) => ({
      id: tournament.id,
      tournamentId: tournament.id,
      title: tournament.title,
      name: tournament.title,
      gameId: tournament.game_id,
      gameName: tournament.games?.name || "",
      game: tournament.games?.name || "",
      gameSlug: tournament.games?.slug || "",
      status: tournament.status,
      matchType: tournament.match_type,
      capacity: tournament.capacity,
      entryFee: tournament.entry_fee,
      prizePool: tournament.prize_pool,
      firstPrize: tournament.first_prize,
      secondPrize: tournament.second_prize,
      thirdPrize: tournament.third_prize,
      perKillReward: tournament.per_kill_reward,
      mapName: tournament.map_name,
      matchDate: tournament.match_date,
      startTime: tournament.start_time,
      registrationOpensAt: tournament.registration_opens_at,
      registrationClosesAt: tournament.registration_closes_at,
      roomId: tournament.room_id,
      roomPassword: tournament.room_password,
      rules: tournament.rules,
      bannerUrl: tournament.banner_url,
    }));

    return Response.json(
      {
        success: true,
        source: "supabase",
        games: normalizedGames,
        tournaments: normalizedTournaments,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Supabase Tournament API Error:", error);

    return Response.json(
      {
        success: false,
        error: error?.message || "Tournament API unavailable",
      },
      { status: 500 }
    );
  }
}
