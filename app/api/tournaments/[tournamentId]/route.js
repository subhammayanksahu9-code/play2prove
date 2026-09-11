import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase configuration is missing.");
  return { url, publishableKey, serviceKey };
}

function client(token = "") {
  const { url, publishableKey } = config();
  return createClient(url, publishableKey, token ? { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } } : { auth: { persistSession: false, autoRefreshToken: false } });
}

function serverClient() {
  const { url, publishableKey, serviceKey } = config();
  return createClient(url, serviceKey || publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function text(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim() || fallback;
  return fallback;
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function jsonError(message, status = 500, code = "SERVER_ERROR") {
  return Response.json({ success: false, data: null, error: { code, message } }, { status });
}

function tokenFrom(request) {
  const header = request.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

async function currentUser(request) {
  const token = tokenFrom(request);
  if (!token) return null;
  const { data, error } = await client(token).auth.getUser(token);
  return error ? null : data?.user || null;
}

function derivedStatus(tournament, results) {
  const raw = text(tournament?.status).toLowerCase().replace(/[_-]+/g, " ");
  if (["cancelled", "canceled"].includes(raw)) return "CANCELLED";
  if (["live", "ongoing", "match ongoing"].includes(raw)) return "LIVE";
  if (raw === "full") return "FULL";
  if (raw === "closed" || raw === "registration closed") return "REGISTRATION CLOSED";
  if (raw === "open" || raw === "registration open") return "REGISTRATION OPEN";
  if (raw === "completed" || raw === "past") {
    return (results || []).some((r) => text(r?.result_status, "pending").toLowerCase() === "pending") ? "CALCULATION ONGOING" : "COMPLETED";
  }
  if (raw === "calculation ongoing" || raw === "calculation pending") return "CALCULATION ONGOING";
  const now = Date.now();
  if (tournament?.match_date && tournament?.start_time) {
    const start = new Date(`${tournament.match_date}T${String(tournament.start_time).slice(0, 8)}+05:30`).getTime();
    if (Number.isFinite(start) && now >= start) return "LIVE";
  }
  if (tournament?.registration_closes_at && now > new Date(tournament.registration_closes_at).getTime()) return "REGISTRATION CLOSED";
  if (tournament?.registration_opens_at && now < new Date(tournament.registration_opens_at).getTime()) return "UPCOMING";
  return "REGISTRATION OPEN";
}

export async function GET(request, { params }) {
  try {
    const tournamentId = text((await params)?.tournamentId);
    if (!tournamentId) return jsonError("Invalid tournament reference.", 400, "INVALID_TOURNAMENT_ID");

    const db = serverClient();
    const { data: tournament, error: tournamentError } = await db.from("tournaments").select("id,tournament_id,game_id,game_short_name,tournament_name,match_date,start_time,mode_format_id,map,entry_fee,per_kill,prize_pool,game_standards,gg_standard_statement,parts_of_day,publish,status,slots_of_mode,lock,active").eq("tournament_id", tournamentId).maybeSingle();
    if (tournamentError) throw tournamentError;
    if (!tournament || tournament.active === false || tournament.publish === false) return jsonError("Tournament not found.", 404, "TOURNAMENT_NOT_FOUND");

    const [{ data: game }, { data: format }, { data: rules }, { data: prizes }, { data: registrations }, { data: teams }, { data: members }, { data: matches }, { data: rooms }, { data: results }] = await Promise.all([
      db.from("games").select("id,game_name,game_short_name,image_url,status,publish,device,display_order").eq("id", tournament.game_id).maybeSingle(),
      db.from("formats").select("format_id,format_name,display_name,category,team_size").eq("format_id", tournament.mode_format_id).maybeSingle(),
      db.from("tournament_rules").select("id,rule_id,section,rule_title,rule_description,display_order,publish,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("display_order", { ascending: true }),
      db.from("tournament_prizes").select("id,prize_id,position,prize_type,prize_amount,description,display_order,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("display_order", { ascending: true }),
      db.from("registrations").select("id,registration_id,tournament_id,user_id,player_id,player_name,game_uid,serial_number,team_id,registration_type,registration_fee,payment_status,registration_status,registered_at,active").eq("tournament_id", tournament.tournament_id).eq("active", true).not("registration_status", "in", "(cancelled,rejected)").order("registered_at", { ascending: true }),
      db.from("teams").select("id,team_id,tournament_id,team_name,team_code,created_by,registration_id,team_status,active").eq("tournament_id", tournament.tournament_id).eq("active", true),
      db.from("team_members").select("id,team_member_id,team_id,tournament_id,user_id,player_id,player_name,game_uid,member_role,joined_at,status,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("joined_at", { ascending: true }),
      db.from("matches").select("id,match_id,tournament_id,match_number,match_name,match_date,match_time,mode_format_id,map,status,result_status,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("match_number", { ascending: true, nullsFirst: false }),
      db.from("match_rooms").select("id,room_id,tournament_id,match_id,room_number,game_room_id,room_password,room_release_time,status,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("room_number", { ascending: true, nullsFirst: false }),
      db.from("match_results").select("id,result_id,match_id,match_entry_id,registration_id,team_id,user_id,player_id,player_name,game_uid,position,kills,prize_amount,result_payload,created_at,updated_at").eq("match_id", (await db.from("matches").select("match_id").eq("tournament_id", tournament.tournament_id).eq("active", true).order("match_number", { ascending: true, nullsFirst: false }).limit(1)).data?.[0]?.match_id || ""),
    ]);

    const safeRules = (rules || []).map((rule) => ({ title: text(rule.rule_title, text(rule.section, "RULE")), summary: text(rule.rule_description, "Tournament rule"), items: text(rule.rule_description, "").split(/\r?\n/).map((line) => line.replace(/^[-•]\s*/, "").trim()).filter(Boolean) }));
    const safePrizes = (prizes || []).map((prize) => ({ id: text(prize.prize_id || prize.id), position: number(prize.position, 0), type: text(prize.prize_type), amount: number(prize.prize_amount, 0), description: text(prize.description) }));
    const teamMap = new Map((teams || []).map((team) => [text(team.id), team]));
    const userIds = [...new Set([...(registrations || []).map((r) => text(r.user_id)), ...(members || []).map((m) => text(m.user_id))].filter(Boolean))];
    let users = [];
    if (userIds.length) {
      const { data, error } = await db.from("users").select("user_id,player_id,full_name,avatar_url,email").in("user_id", userIds);
      if (error) throw error;
      users = data || [];
    }
    const userMap = new Map(users.map((u) => [text(u.user_id), u]));

    const safeMembers = (members || []).map((member) => {
      const user = userMap.get(text(member.user_id));
      const team = teamMap.get(text(member.team_id));
      return { id: text(member.id || member.team_member_id), userId: text(member.user_id), playerName: text(member.player_name || user?.full_name || user?.player_id, "Player"), uid: text(member.game_uid), team: text(team?.team_name), role: text(member.member_role), status: text(member.status, "joined"), joinedAt: member.joined_at || null, avatarUrl: text(user?.avatar_url), playerId: text(member.player_id || user?.player_id) };
    });

    const safeRegistrations = (registrations || []).map((registration) => {
      const user = userMap.get(text(registration.user_id));
      const team = teamMap.get(text(registration.team_id));
      return { id: text(registration.id), registrationId: text(registration.registration_id), userId: text(registration.user_id), playerName: text(registration.player_name || user?.full_name || user?.player_id, "Player"), uid: text(registration.game_uid), team: text(team?.team_name), teamId: text(registration.team_id), type: text(registration.registration_type), fee: number(registration.registration_fee), paymentStatus: text(registration.payment_status), registrationStatus: text(registration.registration_status), registeredAt: registration.registered_at || null, avatarUrl: text(user?.avatar_url), playerId: text(registration.player_id || user?.player_id) };
    });

    const activeMemberCount = safeMembers.filter((m) => !["cancelled", "rejected", "disqualified"].includes(m.status.toLowerCase())).length;
    const registeredCount = activeMemberCount || safeRegistrations.length;
    const capacity = Math.max(0, number(tournament.slots_of_mode, 0));
    const status = derivedStatus(tournament, results || []);
    const user = await currentUser(request);
    let registration = null;
    let room = null;

    if (user) {
      registration = safeRegistrations.find((r) => r.userId === user.id) || null;
      const ownTeamId = registration?.teamId;
      const ownTeam = ownTeamId ? teamMap.get(ownTeamId) : null;
      const eligible = Boolean(registration && !["cancelled", "rejected", "disqualified"].includes(registration.registrationStatus.toLowerCase()) && registration.paymentStatus !== "failed");
      if (eligible) {
        const now = Date.now();
        const releasedRoom = (rooms || []).find((candidate) => {
          const releaseAt = candidate.room_release_time ? new Date(candidate.room_release_time).getTime() : null;
          return (candidate.status || "").toLowerCase() === "released" || (releaseAt && now >= releaseAt);
        });
        if (releasedRoom?.game_room_id && releasedRoom?.room_password) room = { id: text(releasedRoom.game_room_id), password: text(releasedRoom.room_password), matchId: text(releasedRoom.match_id), releasedAt: releasedRoom.room_release_time || null };
      }
      if (registration && ownTeam) registration.teamName = text(ownTeam.team_name);
    }

    const safeTournament = {
      id: tournament.id,
      tournamentId: tournament.tournament_id,
      title: text(tournament.tournament_name, "Tournament"),
      matchType: text(format?.team_size > 1 ? (format?.team_size === 2 ? "duo" : "squad") : "solo", text(tournament.mode_format_id, "solo")),
      mapName: text(tournament.map),
      matchDate: tournament.match_date,
      startTime: tournament.start_time,
      registrationOpensAt: tournament.registration_opens_at || null,
      registrationClosesAt: tournament.registration_closes_at || null,
      capacity,
      entryFee: number(tournament.entry_fee),
      perKillReward: number(tournament.per_kill),
      prizePool: number(tournament.prize_pool),
      firstPrize: number(safePrizes.find((p) => p.position === 1)?.amount, 0),
      secondPrize: number(safePrizes.find((p) => p.position === 2)?.amount, 0),
      thirdPrize: number(safePrizes.find((p) => p.position === 3)?.amount, 0),
      rules: safeRules,
      bannerUrl: text(game?.image_url),
      status: text(tournament.status),
      standards: text(tournament.game_standards),
      standardStatement: text(tournament.gg_standard_statement),
      game: game ? { id: text(game.id), name: text(game.game_name, tournament.game_short_name || "Game"), shortName: text(game.game_short_name), imageUrl: text(game.image_url) } : { name: text(tournament.game_short_name, "Game") },
      format: { id: text(format?.format_id), name: text(format?.display_name || format?.format_name || tournament.mode_format_id), teamSize: number(format?.team_size, 1) },
    };

    const safeMatches = (matches || []).map((match) => ({ ...match, id: text(match.id), matchId: text(match.match_id), name: text(match.match_name), date: match.match_date, time: match.match_time, map: text(match.map), status: text(match.status), resultStatus: text(match.result_status) }));
    return Response.json({ success: true, data: { tournament: safeTournament, participants: safeMembers.length ? safeMembers : safeRegistrations, registrations: safeRegistrations, rules: safeRules, prizes: safePrizes, matches: safeMatches, results: results || [], registration, room, registeredCount, remainingSlots: capacity ? Math.max(0, capacity - registeredCount) : 0 }, error: null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Tournament detail API error:", error);
    return jsonError("Unable to load this tournament right now.", 500);
  }
}

export async function POST(request, { params }) {
  try {
    const tournamentId = text((await params)?.tournamentId);
    const token = tokenFrom(request);
    if (!tournamentId) return jsonError("Invalid tournament reference.", 400, "INVALID_TOURNAMENT_ID");
    if (!token) return jsonError("Please log in to register.", 401, "AUTH_REQUIRED");

    const authClient = client(token);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) return jsonError("Your session has expired. Please log in again.", 401, "AUTH_REQUIRED");

    const body = await request.json().catch(() => ({}));
    const playerName = text(body?.playerName);
    const gameUid = text(body?.gameUid);
    const teamName = text(body?.teamName);
    const requestedMembers = Array.isArray(body?.members) ? body.members : [];
    if (!playerName || !gameUid) return jsonError("Player name and Game UID are required.", 422, "PLAYER_DETAILS_REQUIRED");

    const db = serverClient();
    const { data: tournament, error: tournamentError } = await db.from("tournaments").select("tournament_id,mode_format_id,match_date,start_time,entry_fee,status,slots_of_mode").eq("tournament_id", tournamentId).maybeSingle();
    if (tournamentError) throw tournamentError;
    if (!tournament) return jsonError("Tournament not found.", 404, "TOURNAMENT_NOT_FOUND");

    const { data: format, error: formatError } = await db.from("formats").select("format_id,team_size").eq("format_id", tournament.mode_format_id).maybeSingle();
    if (formatError) throw formatError;
    const teamSize = Math.max(1, number(format?.team_size, 1));
    const members = [];
    const seen = new Set([authData.user.id]);
    for (const item of requestedMembers) {
      const identifier = text(item?.identifier).toLowerCase();
      const memberPlayerName = text(item?.playerName);
      const memberUid = text(item?.gameUid);
      if (!memberPlayerName || !memberUid) return jsonError("Every team member needs a name and Game UID.", 422, "TEAM_MEMBER_INVALID");
      if (!identifier) return jsonError("Enter the Play2Prove username or email for every teammate.", 422, "TEAM_MEMBER_NOT_FOUND");
      const { data: profile, error: profileError } = await db.from("users").select("user_id,username,email,full_name").or(`username.eq.${identifier},email.eq.${identifier}`).maybeSingle();
      if (profileError) throw profileError;
      if (!profile) return jsonError("A team member could not be found.", 422, "TEAM_MEMBER_NOT_FOUND");
      if (seen.has(profile.user_id)) return jsonError("A team member cannot be added twice.", 422, "TEAM_MEMBER_DUPLICATE");
      seen.add(profile.user_id);
      members.push({ user_id: profile.user_id, player_name: memberPlayerName, game_uid: memberUid });
    }
    if (teamSize === 1) {
      if (requestedMembers.length) return jsonError("This is a solo tournament.", 422, "TEAM_SIZE_INVALID");
    } else {
      if (!teamName) return jsonError("Team name is required for this tournament.", 422, "TEAM_NAME_REQUIRED");
      if (members.length !== teamSize - 1) return jsonError("The number of teammates does not match this tournament format.", 422, "TEAM_SIZE_INVALID");
    }

    const { data, error } = await authClient.rpc("register_tournament", { p_tournament_id: tournament.tournament_id, p_player_name: playerName, p_game_uid: gameUid, p_team_name: teamName || null, p_members: members });
    if (error) {
      const code = text(error.message);
      const mapping = { AUTH_REQUIRED:[401,"AUTH_REQUIRED"], TOURNAMENT_NOT_FOUND:[404,"TOURNAMENT_NOT_FOUND"], ALREADY_REGISTERED:[409,"ALREADY_REGISTERED"], TEAM_MEMBER_ALREADY_REGISTERED:[409,"TEAM_MEMBER_ALREADY_REGISTERED"], GAME_UID_ALREADY_REGISTERED:[409,"GAME_UID_ALREADY_REGISTERED"], TOURNAMENT_FULL:[409,"TOURNAMENT_FULL"], REGISTRATION_CLOSED:[409,"REGISTRATION_CLOSED"], REGISTRATION_NOT_OPEN:[409,"REGISTRATION_NOT_OPEN"], INSUFFICIENT_BALANCE:[402,"INSUFFICIENT_BALANCE"], PLAYER_DETAILS_REQUIRED:[422,"PLAYER_DETAILS_REQUIRED"], TEAM_NAME_REQUIRED:[422,"TEAM_NAME_REQUIRED"], TEAM_SIZE_INVALID:[422,"TEAM_SIZE_INVALID"], TEAM_MEMBER_INVALID:[422,"TEAM_MEMBER_INVALID"], TEAM_MEMBER_NOT_FOUND:[422,"TEAM_MEMBER_NOT_FOUND"], TEAM_MEMBER_DUPLICATE:[422,"TEAM_MEMBER_DUPLICATE"], CAPACITY_NOT_CONFIGURED:[409,"CAPACITY_NOT_CONFIGURED"] };
      const [status, mappedCode] = mapping[code] || [400,"REGISTRATION_FAILED"];
      const messages = { ALREADY_REGISTERED:"You are already registered for this tournament.", TEAM_MEMBER_ALREADY_REGISTERED:"One of the selected team members is already registered.", GAME_UID_ALREADY_REGISTERED:"That Game UID is already registered for this tournament.", TOURNAMENT_FULL:"This tournament is full.", REGISTRATION_CLOSED:"Registration is closed for this tournament.", REGISTRATION_NOT_OPEN:"Registration is not open yet." };
      return jsonError(messages[code] || "Registration could not be completed.", status, mappedCode);
    }
    return Response.json({ success: true, data: data || null, error: null }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Tournament registration API error:", error);
    return jsonError("We could not complete your registration. Please try again.", 500);
  }
}
