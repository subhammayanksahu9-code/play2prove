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
  if (["string", "number", "boolean"].includes(typeof value)) return String(value).trim() || fallback;
  return fallback;
}
function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function jsonError(message, status = 500, code = "SERVER_ERROR") {
  return Response.json({ success: false, data: null, error: { code, message } }, { status });
}
function tokenFrom(request) {
  const h = request.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
}
async function currentUser(request) {
  const token = tokenFrom(request);
  if (!token) return null;
  const { data, error } = await client(token).auth.getUser(token);
  return error ? null : data?.user || null;
}
async function resolveTournament(db, reference) {
  const fields = "id,tournament_id,game_id,game_short_name,tournament_name,match_date,start_time,mode_format_id,map,entry_fee,per_kill,prize_pool,game_standards,gg_standard_statement,parts_of_day,publish,status,slots_of_mode,lock,active";
  const byPublic = await db.from("tournaments").select(fields).eq("tournament_id", reference).maybeSingle();
  if (byPublic.error) throw byPublic.error;
  if (byPublic.data) return byPublic.data;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reference)) {
    const byUuid = await db.from("tournaments").select(fields).eq("id", reference).maybeSingle();
    if (byUuid.error) throw byUuid.error;
    if (byUuid.data) return byUuid.data;
  }
  return null;
}
async function loadData(db, tournament) {
  const [gameById, format, rules, prizes, registrations, teams, members, matches, rooms] = await Promise.all([
    tournament.game_id ? db.from("games").select("id,game_name,game_short_name,image_url,status,publish,device,display_order").eq("id", tournament.game_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    db.from("formats").select("format_id,format_name,display_name,category,team_size,game_short_name,active").eq("format_id", tournament.mode_format_id).maybeSingle(),
    db.from("tournament_rules").select("id,rule_id,section,rule_title,rule_description,display_order,publish,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("display_order", { ascending: true }),
    db.from("tournament_prizes").select("id,prize_id,position,prize_type,prize_amount,description,display_order,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("display_order", { ascending: true }),
    db.from("registrations").select("id,registration_id,tournament_id,user_id,player_id,player_name,game_uid,serial_number,team_id,registration_type,registration_fee,payment_status,registration_status,registered_at,active").eq("tournament_id", tournament.tournament_id).eq("active", true).not("registration_status", "in", "(cancelled,rejected)").order("registered_at", { ascending: true }),
    db.from("teams").select("id,team_id,tournament_id,team_name,team_code,created_by,registration_id,team_status,active").eq("tournament_id", tournament.tournament_id).eq("active", true),
    db.from("team_members").select("id,team_member_id,team_id,tournament_id,user_id,player_id,player_name,game_uid,member_role,joined_at,status,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("joined_at", { ascending: true }),
    db.from("matches").select("id,match_id,tournament_id,match_number,match_name,match_date,match_time,mode_format_id,map,status,result_status,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("match_number", { ascending: true, nullsFirst: false }),
    db.from("match_rooms").select("id,room_id,tournament_id,match_id,room_number,game_room_id,room_password,room_release_time,status,active").eq("tournament_id", tournament.tournament_id).eq("active", true).order("room_number", { ascending: true, nullsFirst: false }),
  ]);
  for (const q of [gameById, format, rules, prizes, registrations, teams, members, matches, rooms]) if (q.error) throw q.error;
  let game = gameById.data || null;
  if (!game && tournament.game_short_name) {
    const q = await db.from("games").select("id,game_name,game_short_name,image_url,status,publish,device,display_order").eq("game_short_name", tournament.game_short_name).maybeSingle();
    if (q.error) throw q.error;
    game = q.data || null;
  }
  const matchRows = matches.data || [];
  const matchIds = matchRows.map((m) => text(m.match_id || m.id)).filter(Boolean);
  let results = [];
  if (matchIds.length) {
    const q = await db.from("match_results").select("id,result_id,match_id,match_entry_id,registration_id,team_id,user_id,player_id,player_name,game_uid,position,kills,prize_amount,result_payload,created_at,updated_at,result_status").in("match_id", matchIds).order("position", { ascending: true, nullsFirst: false });
    if (q.error) throw q.error;
    results = q.data || [];
  }
  return { game, format: format.data || null, rules: rules.data || [], prizes: prizes.data || [], registrations: registrations.data || [], teams: teams.data || [], members: members.data || [], matches: matchRows, rooms: rooms.data || [], results };
}
async function payload(request, db, tournament) {
  const d = await loadData(db, tournament);
  const teamMap = new Map(d.teams.map((t) => [text(t.id), t]));
  const userIds = [...new Set([...d.registrations.map((r) => text(r.user_id)), ...d.members.map((m) => text(m.user_id))].filter(Boolean))];
  let users = [];
  if (userIds.length) {
    const q = await db.from("users").select("user_id,player_id,full_name,avatar_url,email,username").in("user_id", userIds);
    if (q.error) throw q.error;
    users = q.data || [];
  }
  const userMap = new Map(users.map((u) => [text(u.user_id), u]));
  const members = d.members.map((m) => { const u = userMap.get(text(m.user_id)); const t = teamMap.get(text(m.team_id)); return { id: text(m.id || m.team_member_id), userId: text(m.user_id), playerName: text(m.player_name || u?.full_name || u?.player_id, "Player"), uid: text(m.game_uid), team: text(t?.team_name), role: text(m.member_role), status: text(m.status, "joined"), joinedAt: m.joined_at || null, avatarUrl: text(u?.avatar_url), playerId: text(m.player_id || u?.player_id) }; });
  const registrations = d.registrations.map((r) => { const u = userMap.get(text(r.user_id)); const t = teamMap.get(text(r.team_id)); return { id: text(r.id), registrationId: text(r.registration_id), userId: text(r.user_id), playerName: text(r.player_name || u?.full_name || u?.player_id, "Player"), uid: text(r.game_uid), team: text(t?.team_name), teamId: text(r.team_id), type: text(r.registration_type), fee: number(r.registration_fee), paymentStatus: text(r.payment_status), registrationStatus: text(r.registration_status), registeredAt: r.registered_at || null, avatarUrl: text(u?.avatar_url), playerId: text(r.player_id || u?.player_id) }; });
  const registeredCount = members.filter((m) => !["cancelled", "rejected", "disqualified"].includes(m.status.toLowerCase())).length || registrations.length;
  const capacity = Math.max(0, number(tournament.slots_of_mode));
  const user = await currentUser(request);
  let registration = null;
  let room = null;
  if (user) {
    registration = registrations.find((r) => r.userId === user.id) || null;
    if (registration) {
      const ownTeam = teamMap.get(text(registration.teamId));
      if (ownTeam) registration.teamName = text(ownTeam.team_name);
      const eligible = !["cancelled", "rejected", "disqualified"].includes(text(registration.registrationStatus).toLowerCase()) && registration.paymentStatus !== "failed";
      if (eligible) {
        const now = Date.now();
        const released = d.rooms.find((r) => { const at = r.room_release_time ? new Date(r.room_release_time).getTime() : null; return text(r.status).toLowerCase() === "released" || (at && now >= at); });
        if (released?.game_room_id && released?.room_password) room = { id: text(released.game_room_id), password: text(released.room_password), matchId: text(released.match_id), releasedAt: released.room_release_time || null };
      }
    }
  }
  const format = d.format;
  const safeTournament = {
    id: tournament.id,
    tournamentId: tournament.tournament_id,
    title: text(tournament.tournament_name, "Tournament"),
    matchType: format?.team_size > 1 ? (format.team_size === 2 ? "duo" : "squad") : "solo",
    mapName: text(tournament.map),
    matchDate: tournament.match_date,
    startTime: tournament.start_time,
    capacity,
    entryFee: number(tournament.entry_fee),
    perKillReward: number(tournament.per_kill),
    prizePool: number(tournament.prize_pool),
    firstPrize: number(d.prizes.find((p) => Number(p.position) === 1)?.prize_amount),
    secondPrize: number(d.prizes.find((p) => Number(p.position) === 2)?.prize_amount),
    thirdPrize: number(d.prizes.find((p) => Number(p.position) === 3)?.prize_amount),
    rules: d.rules.map((r) => ({ title: text(r.rule_title, text(r.section, "RULE")), summary: text(r.rule_description, "Tournament rule"), items: text(r.rule_description, "").split(/\r?\n/).map((x) => x.replace(/^[-•]\s*/, "").trim()).filter(Boolean) })),
    bannerUrl: text(d.game?.image_url),
    status: text(tournament.status),
    standards: text(tournament.game_standards),
    standardStatement: text(tournament.gg_standard_statement),
    game: d.game ? { id: text(d.game.id), name: text(d.game.game_name, tournament.game_short_name || "Game"), shortName: text(d.game.game_short_name), imageUrl: text(d.game.image_url) } : { id: "", name: text(tournament.game_short_name, "Game"), shortName: text(tournament.game_short_name), imageUrl: "" },
    format: { id: text(format?.format_id), name: text(format?.display_name || format?.format_name || tournament.mode_format_id), teamSize: number(format?.team_size, 1) },
  };
  return { tournament: safeTournament, participants: members.length ? members : registrations, registrations, rules: safeTournament.rules, prizes: d.prizes.map((p) => ({ id: text(p.prize_id || p.id), position: number(p.position), type: text(p.prize_type), amount: number(p.prize_amount), description: text(p.description) })), matches: d.matches.map((m) => ({ ...m, id: text(m.id), matchId: text(m.match_id), name: text(m.match_name), date: m.match_date, time: m.match_time, map: text(m.map), status: text(m.status), resultStatus: text(m.result_status) })), results: d.results, registration, room, registeredCount, remainingSlots: capacity ? Math.max(0, capacity - registeredCount) : 0 };
}
export async function GET(request, { params }) {
  try {
    const reference = text((await params)?.tournamentId);
    if (!reference) return jsonError("Invalid tournament reference.", 400, "INVALID_TOURNAMENT_ID");
    const db = serverClient();
    const tournament = await resolveTournament(db, reference);
    if (!tournament || tournament.active === false || tournament.publish === false) return jsonError("Tournament not found.", 404, "TOURNAMENT_NOT_FOUND");
    return Response.json({ success: true, data: await payload(request, db, tournament), error: null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Tournament detail API error:", error);
    return jsonError("Unable to load this tournament right now.", 500);
  }
}
export async function POST(request, { params }) {
  try {
    const reference = text((await params)?.tournamentId);
    const token = tokenFrom(request);
    if (!reference) return jsonError("Invalid tournament reference.", 400, "INVALID_TOURNAMENT_ID");
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
    const tournament = await resolveTournament(db, reference);
    if (!tournament) return jsonError("Tournament not found.", 404, "TOURNAMENT_NOT_FOUND");
    const game = await db.from("games").select("id,game_short_name,game_name").eq("game_short_name", tournament.game_short_name).maybeSingle();
    if (game.error) throw game.error;
    if (!game.data) return jsonError("This tournament is linked to an unavailable game.", 409, "GAME_NOT_FOUND");
    const format = await db.from("formats").select("format_id,format_name,display_name,category,team_size,game_short_name,active").eq("format_id", tournament.mode_format_id).maybeSingle();
    if (format.error) throw format.error;
    if (!format.data) return jsonError("This tournament format is not configured.", 409, "FORMAT_NOT_FOUND");
    if (format.data.game_short_name && text(format.data.game_short_name) !== text(game.data.game_short_name)) return jsonError("This tournament format belongs to a different game.", 409, "GAME_FORMAT_MISMATCH");
    const teamSize = Math.max(1, number(format.data.team_size, 1));
    const members = [];
    const seen = new Set([authData.user.id]);
    for (const item of requestedMembers) {
      const identifier = text(item?.identifier).toLowerCase();
      const memberPlayerName = text(item?.playerName);
      const memberUid = text(item?.gameUid);
      if (!memberPlayerName || !memberUid) return jsonError("Every team member needs a name and Game UID.", 422, "TEAM_MEMBER_INVALID");
      if (!identifier) return jsonError("Enter the Play2Prove username or email for every teammate.", 422, "TEAM_MEMBER_NOT_FOUND");

      let profile = null;
      const byEmail = await db.from("users").select("user_id,username,email,full_name,player_id,account_status").ilike("email", identifier).maybeSingle();
      if (byEmail.error) throw byEmail.error;
      profile = byEmail.data || null;

      if (!profile) {
        const byUsername = await db.from("users").select("user_id,username,email,full_name,player_id,account_status").ilike("username", identifier).maybeSingle();
        if (byUsername.error) throw byUsername.error;
        profile = byUsername.data || null;
      }

      if (!profile) {
        const byPlayerId = await db.from("users").select("user_id,username,email,full_name,player_id,account_status").ilike("player_id", identifier).maybeSingle();
        if (byPlayerId.error) throw byPlayerId.error;
        profile = byPlayerId.data || null;
      }

      if (!profile) return jsonError("A team member could not be found. Use their Play2Prove username, Player ID, or email.", 422, "TEAM_MEMBER_NOT_FOUND");
      if (text(profile.account_status).toLowerCase() !== "active") return jsonError("This team member account is not active.", 422, "TEAM_MEMBER_INACTIVE");
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
    const rpc = await authClient.rpc("register_tournament", { p_tournament_id: tournament.tournament_id, p_player_name: playerName, p_game_uid: gameUid, p_team_name: teamName || null, p_members: members });
    if (rpc.error) {
      const code = text(rpc.error.message);
      const map = { AUTH_REQUIRED:[401,"AUTH_REQUIRED"], TOURNAMENT_NOT_FOUND:[404,"TOURNAMENT_NOT_FOUND"], ALREADY_REGISTERED:[409,"ALREADY_REGISTERED"], TEAM_MEMBER_ALREADY_REGISTERED:[409,"TEAM_MEMBER_ALREADY_REGISTERED"], GAME_UID_ALREADY_REGISTERED:[409,"GAME_UID_ALREADY_REGISTERED"], TOURNAMENT_FULL:[409,"TOURNAMENT_FULL"], REGISTRATION_CLOSED:[409,"REGISTRATION_CLOSED"], REGISTRATION_NOT_OPEN:[409,"REGISTRATION_NOT_OPEN"], INSUFFICIENT_BALANCE:[402,"INSUFFICIENT_BALANCE"], PAYMENT_REQUIRED:[402,"PAYMENT_REQUIRED"], PLAYER_DETAILS_REQUIRED:[422,"PLAYER_DETAILS_REQUIRED"], TEAM_NAME_REQUIRED:[422,"TEAM_NAME_REQUIRED"], TEAM_SIZE_INVALID:[422,"TEAM_SIZE_INVALID"], TEAM_MEMBER_INVALID:[422,"TEAM_MEMBER_INVALID"], TEAM_MEMBER_NOT_FOUND:[422,"TEAM_MEMBER_NOT_FOUND"], TEAM_MEMBER_DUPLICATE:[422,"TEAM_MEMBER_DUPLICATE"], CAPACITY_NOT_CONFIGURED:[409,"CAPACITY_NOT_CONFIGURED"] };
      const [status, mapped] = map[code] || [400, "REGISTRATION_FAILED"];
      const messages = { ALREADY_REGISTERED:"You are already registered for this tournament.", TEAM_MEMBER_ALREADY_REGISTERED:"One of the selected team members is already registered.", GAME_UID_ALREADY_REGISTERED:"That Game UID is already registered for this tournament.", TOURNAMENT_FULL:"This tournament is full.", REGISTRATION_CLOSED:"Registration is closed for this tournament.", REGISTRATION_NOT_OPEN:"Registration is not open yet.", PAYMENT_REQUIRED:"Payment is required before this paid tournament can be joined." };
      return jsonError(messages[code] || "Registration could not be completed.", status, mapped);
    }
    return Response.json({ success: true, data: rpc.data || null, error: null }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Tournament registration API error:", error);
    return jsonError("We could not complete your registration. Please try again.", 500);
  }
}
