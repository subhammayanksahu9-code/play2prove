import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase configuration is missing.");
  return { url, publishableKey, serviceKey };
}

function publicClient(token) {
  const { url, publishableKey } = getConfig();
  return createClient(url, publishableKey, token ? {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  } : { auth: { persistSession: false, autoRefreshToken: false } });
}

function adminClient() {
  const { url, publishableKey, serviceKey } = getConfig();
  return createClient(url, serviceKey || publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function asText(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
}

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function jsonError(message, status = 500, code = "SERVER_ERROR") {
  return Response.json({ success: false, data: null, error: { code, message } }, { status });
}

function authToken(request) {
  const value = request.headers.get("authorization") || "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

async function getUser(request) {
  const token = authToken(request);
  if (!token) return { user: null, token: "" };
  const client = publicClient(token);
  const { data, error } = await client.auth.getUser(token);
  if (error) return { user: null, token };
  return { user: data?.user || null, token };
}

export async function GET(request, { params }) {
  try {
    const tournamentId = asText((await params)?.tournamentId);
    if (!/^\d+$/.test(tournamentId)) return jsonError("Invalid tournament reference.", 400, "INVALID_TOURNAMENT_ID");

    const admin = adminClient();
    const { data: tournament, error: tournamentError } = await admin
      .from("tournaments")
      .select("id,game_id,title,match_type,map_name,match_date,start_time,registration_opens_at,registration_closes_at,capacity,entry_fee,per_kill_reward,prize_pool,first_prize,second_prize,third_prize,room_id,room_password,rules,banner_url,status,created_at,updated_at,games:game_id(id,name,slug,short_name,image_url,banner_url,description,status)")
      .eq("id", Number(tournamentId))
      .maybeSingle();

    if (tournamentError) throw tournamentError;
    if (!tournament) return jsonError("Tournament not found.", 404, "TOURNAMENT_NOT_FOUND");

    const [{ data: participants, error: participantsError }, { data: results, error: resultsError }] = await Promise.all([
      admin
        .from("tournament_participants")
        .select("id,tournament_id,user_id,team_name,player_name,game_uid,joined_at,status,profile:profiles!tournament_participants_user_id_fkey(id,username,full_name,avatar_url)")
        .eq("tournament_id", tournament.id)
        .not("status", "in", "(cancelled,disqualified)")
        .order("joined_at", { ascending: true }),
      admin
        .from("tournament_results")
        .select("id,tournament_id,user_id,rank,kills,points,prize_amount,result_status,created_at,profile:profiles!tournament_results_user_id_fkey(username,full_name,avatar_url)")
        .eq("tournament_id", tournament.id)
        .order("rank", { ascending: true, nullsFirst: false }),
    ]);

    if (participantsError) throw participantsError;
    if (resultsError) throw resultsError;

    const { user } = await getUser(request);
    let registration = null;
    let room = null;

    if (user) {
      const [{ data: ownEntry }, { data: ownParticipant }] = await Promise.all([
        admin.from("tournament_entries").select("id,tournament_id,user_id,game_username,game_uid,team_name,team_code,slot_number,entry_fee_paid,payment_status,entry_status,joined_at").eq("tournament_id", tournament.id).eq("user_id", user.id).not("entry_status", "in", "(cancelled,disqualified)").maybeSingle(),
        admin.from("tournament_participants").select("id,tournament_id,user_id,team_name,player_name,game_uid,joined_at,status").eq("tournament_id", tournament.id).eq("user_id", user.id).not("status", "in", "(cancelled,disqualified)").maybeSingle(),
      ]);

      if (ownEntry || ownParticipant) {
        const entry = ownEntry || {};
        registration = {
          id: asText(entry.id || ownParticipant?.id),
          registrationId: entry.id ? `P2P-${entry.id}` : asText(ownParticipant?.id),
          gameUsername: asText(entry.game_username || ownParticipant?.player_name),
          gameUid: asText(entry.game_uid || ownParticipant?.game_uid),
          teamName: asText(entry.team_name || ownParticipant?.team_name),
          paymentStatus: asText(entry.payment_status) || "paid",
          entryStatus: asText(entry.entry_status || ownParticipant?.status) || "confirmed",
          joinedAt: entry.joined_at || ownParticipant?.joined_at || null,
        };
        if (asText(tournament.room_id) && asText(tournament.room_password)) {
          room = { id: asText(tournament.room_id), password: asText(tournament.room_password) };
        }
      }
    }

    const safeTournament = {
      id: tournament.id,
      tournamentId: tournament.id,
      title: asText(tournament.title) || "Tournament",
      matchType: asText(tournament.match_type) || "solo",
      mapName: asText(tournament.map_name),
      matchDate: tournament.match_date,
      startTime: tournament.start_time,
      registrationOpensAt: tournament.registration_opens_at,
      registrationClosesAt: tournament.registration_closes_at,
      capacity: asNumber(tournament.capacity, 0),
      entryFee: asNumber(tournament.entry_fee, 0),
      perKillReward: asNumber(tournament.per_kill_reward, 0),
      prizePool: asNumber(tournament.prize_pool, 0),
      firstPrize: asNumber(tournament.first_prize, 0),
      secondPrize: asNumber(tournament.second_prize, 0),
      thirdPrize: asNumber(tournament.third_prize, 0),
      rules: asText(tournament.rules),
      bannerUrl: asText(tournament.banner_url || tournament.games?.banner_url),
      status: asText(tournament.status),
      game: tournament.games ? {
        id: tournament.games.id,
        name: asText(tournament.games.name),
        slug: asText(tournament.games.slug),
        shortName: asText(tournament.games.short_name),
        imageUrl: asText(tournament.games.image_url),
        bannerUrl: asText(tournament.games.banner_url),
      } : null,
    };

    const safeParticipants = (participants || []).map((p) => ({
      id: asText(p.id),
      userId: asText(p.user_id),
      playerName: asText(p.player_name || p.profile?.full_name || p.profile?.username) || "Player",
      uid: asText(p.game_uid),
      team: asText(p.team_name),
      status: asText(p.status),
      joinedAt: p.joined_at || null,
      avatarUrl: asText(p.profile?.avatar_url),
      username: asText(p.profile?.username),
    }));

    return Response.json({
      success: true,
      data: {
        tournament: safeTournament,
        participants: safeParticipants,
        results: results || [],
        registration,
        room,
        registeredCount: safeParticipants.length,
        remainingSlots: Math.max(0, safeTournament.capacity - safeParticipants.length),
      },
      error: null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Tournament detail API error:", error);
    return jsonError("Unable to load this tournament right now.", 500);
  }
}

export async function POST(request, { params }) {
  try {
    const tournamentId = asText((await params)?.tournamentId);
    if (!/^\d+$/.test(tournamentId)) return jsonError("Invalid tournament reference.", 400, "INVALID_TOURNAMENT_ID");

    const token = authToken(request);
    if (!token) return jsonError("Please log in to register.", 401, "AUTH_REQUIRED");

    const client = publicClient(token);
    const { data: authData, error: authError } = await client.auth.getUser(token);
    if (authError || !authData?.user) return jsonError("Your session has expired. Please log in again.", 401, "AUTH_REQUIRED");

    const body = await request.json().catch(() => ({}));
    const playerName = asText(body?.playerName);
    const gameUid = asText(body?.gameUid);
    const teamName = asText(body?.teamName) || null;
    const requestedMembers = Array.isArray(body?.members) ? body.members : [];

    if (!playerName || !gameUid) return jsonError("Player name and Game UID are required.", 422, "PLAYER_DETAILS_REQUIRED");

    const admin = adminClient();
    const { data: tournament, error: tournamentError } = await admin
      .from("tournaments")
      .select("id,match_type")
      .eq("id", Number(tournamentId))
      .maybeSingle();
    if (tournamentError) throw tournamentError;
    if (!tournament) return jsonError("Tournament not found.", 404, "TOURNAMENT_NOT_FOUND");

    const memberInputs = requestedMembers.length ? requestedMembers : [{ identifier: "", playerName, gameUid }];
    const members = [];
    const seen = new Set();

    for (const item of memberInputs) {
      const identifier = asText(item?.identifier).toLowerCase();
      const memberName = asText(item?.playerName);
      const memberUid = asText(item?.gameUid);
      if (!memberName || !memberUid) return jsonError("Every team member needs a name and Game UID.", 422, "TEAM_MEMBER_INVALID");

      let userId = authData.user.id;
      if (identifier) {
        const { data: profiles, error: profileError } = await admin
          .from("profiles")
          .select("id,username,email,full_name")
          .or(`username.ilike.${identifier},email.ilike.${identifier}`)
          .limit(2);
        if (profileError) throw profileError;
        const match = (profiles || []).find((p) => asText(p.username).toLowerCase() === identifier || asText(p.email).toLowerCase() === identifier);
        if (!match) return jsonError(`Team member ${identifier} was not found.`, 422, "TEAM_MEMBER_NOT_FOUND");
        userId = match.id;
      }
      if (seen.has(userId)) return jsonError("A team member cannot be added twice.", 422, "TEAM_MEMBER_DUPLICATE");
      seen.add(userId);
      members.push({ user_id: userId, player_name: memberName, game_uid: memberUid });
    }

    if (!members.some((m) => m.user_id === authData.user.id)) members.unshift({ user_id: authData.user.id, player_name: playerName, game_uid: gameUid });

    const { data, error } = await client.rpc("register_tournament_entry", {
      p_tournament_id: Number(tournamentId),
      p_game_username: playerName,
      p_game_uid: gameUid,
      p_team_name: teamName,
      p_members: members,
    });

    if (error) {
      const code = asText(error.message);
      const mapping = {
        AUTH_REQUIRED: [401, "AUTH_REQUIRED"],
        TOURNAMENT_NOT_FOUND: [404, "TOURNAMENT_NOT_FOUND"],
        ALREADY_REGISTERED: [409, "ALREADY_REGISTERED"],
        TEAM_MEMBER_ALREADY_REGISTERED: [409, "TEAM_MEMBER_ALREADY_REGISTERED"],
        TOURNAMENT_FULL: [409, "TOURNAMENT_FULL"],
        REGISTRATION_CLOSED: [409, "REGISTRATION_CLOSED"],
        REGISTRATION_NOT_OPEN: [409, "REGISTRATION_NOT_OPEN"],
        INSUFFICIENT_BALANCE: [402, "INSUFFICIENT_BALANCE"],
        PLAYER_DETAILS_REQUIRED: [422, "PLAYER_DETAILS_REQUIRED"],
        TEAM_NAME_REQUIRED: [422, "TEAM_NAME_REQUIRED"],
        TEAM_SIZE_INVALID: [422, "TEAM_SIZE_INVALID"],
        TEAM_MEMBER_INVALID: [422, "TEAM_MEMBER_INVALID"],
        TEAM_MEMBER_NOT_FOUND: [422, "TEAM_MEMBER_NOT_FOUND"],
        CAPTAIN_REQUIRED: [422, "CAPTAIN_REQUIRED"],
      };
      const [status, mappedCode] = mapping[code] || [400, "REGISTRATION_FAILED"];
      const messages = {
        INSUFFICIENT_BALANCE: "Your wallet balance is not enough for this entry fee.",
        ALREADY_REGISTERED: "You are already registered for this tournament.",
        TEAM_MEMBER_ALREADY_REGISTERED: "One of the selected team members is already registered.",
        TOURNAMENT_FULL: "This tournament is full.",
        REGISTRATION_CLOSED: "Registration is closed for this tournament.",
        REGISTRATION_NOT_OPEN: "Registration is not open yet.",
      };
      return jsonError(messages[code] || "Registration could not be completed.", status, mappedCode);
    }

    return Response.json({ success: true, data: data || null, error: null }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Tournament registration API error:", error);
    return jsonError("We could not complete your registration. Please try again.", 500);
  }
}
