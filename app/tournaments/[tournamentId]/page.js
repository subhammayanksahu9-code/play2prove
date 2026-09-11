"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import "./tournament-detail.css";

const API_ROOT = "/api/tournaments";

const TABS = [
  ["overview", "OVERVIEW"],
  ["players", "PLAYERS"],
  ["rules", "RULES"],
  ["prizes", "PRIZES"],
  ["match", "MATCH INFO"],
];

function safeText(value, fallback = "—") {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const text = String(value).trim();
    return text || fallback;
  }
  if (Array.isArray(value)) return value.map((item) => safeText(item, "")).filter(Boolean).join(", ") || fallback;
  if (typeof value === "object") {
    const preferred = ["name", "title", "label", "value", "game_name", "username", "full_name"].find((key) => value?.[key] != null);
    return preferred ? safeText(value[preferred], fallback) : fallback;
  }
  return fallback;
}

function safeNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(String(value ?? "").replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function formatMoney(value) {
  return `₹${safeNumber(value).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  const text = safeText(value, "");
  if (!text) return "—";
  const date = new Date(`${text}T00:00:00+05:30`);
  if (Number.isNaN(date.getTime())) return text;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
}

function formatTime(value) {
  const text = safeText(value, "");
  if (!text) return "—";
  const match = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return text;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return text;
  const date = new Date(`2000-01-01T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(date);
}

function parseIST(dateValue, timeValue) {
  const date = safeText(dateValue, "");
  const time = safeText(timeValue, "");
  if (!date || !time) return null;
  const value = new Date(`${date}T${time.slice(0, 8)}+05:30`);
  return Number.isNaN(value.getTime()) ? null : value.getTime();
}

function normalizeStatus(rawStatus, tournament, results = []) {
  const raw = safeText(rawStatus, "").toLowerCase().replace(/[_-]+/g, " ");
  if (raw === "cancelled" || raw === "canceled") return "CANCELLED";

  const start = parseIST(tournament?.matchDate, tournament?.startTime);
  if (start) {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    const thirtyMinutes = 30 * 60 * 1000;
    const fiveMinutes = 5 * 60 * 1000;

    if (now < start - tenMinutes) return "UPCOMING";
    if (now < start) return "STARTING SOON";
    if (now < start + tenMinutes) return "LIVE";
    if (now < start + tenMinutes + thirtyMinutes) return "MATCH ONGOING";
    if (now < start + tenMinutes + thirtyMinutes + fiveMinutes) return "MATCH CLOSING";

    const hasCompletedResult = results.length > 0 && results.some((item) => {
      const value = safeText(item?.result_status, "").toLowerCase();
      return ["completed", "complete", "verified", "approved", "paid"].includes(value);
    });
    if (raw === "completed" || raw === "past" || hasCompletedResult) return "COMPLETED";
    return "CALCULATION ONGOING";
  }

  if (raw === "full") return "FULL";
  if (raw === "closed" || raw === "registration closed") return "REGISTRATION CLOSED";
  if (raw === "open" || raw === "registration open") return "REGISTRATION OPEN";
  if (raw === "draft") return "UPCOMING";
  if (raw === "live") return "LIVE";
  if (raw === "match ongoing" || raw === "ongoing") return "MATCH ONGOING";
  if (raw === "match closing" || raw === "match finishing") return "MATCH CLOSING";
  if (raw === "calculation ongoing" || raw === "calculation pending") return "CALCULATION ONGOING";
  if (raw === "completed" || raw === "past") return "COMPLETED";
  return "UPCOMING";
}

function normalizeRules(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({
      title: safeText(item?.title || item?.name, `RULE ${index + 1}`),
      summary: safeText(item?.summary || item?.description, "Tournament rule section"),
      items: Array.isArray(item?.rules) ? item.rules.map((rule) => safeText(rule, "")).filter(Boolean) : [safeText(item?.rule || item, "")].filter(Boolean),
    })).filter((item) => item.items.length);
  }
  const raw = safeText(value, "");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return normalizeRules(parsed);
  } catch {
    const sections = raw.split(/\n\s*\n/).map((section, index) => section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)).filter(Boolean);
    return sections.map((lines, index) => ({ title: lines[0] || `RULE ${index + 1}`, summary: "Tournament rule section", items: lines.slice(1).length ? lines.slice(1) : lines })).filter((item) => item.items.length);
  }
}

function normalizeTournament(raw) {
  const game = raw?.game && typeof raw.game === "object" ? raw.game : {};
  return {
    id: safeNumber(raw?.id, 0),
    title: safeText(raw?.title || raw?.tournamentName || raw?.tournament_name, "Tournament"),
    matchType: safeText(raw?.matchType || raw?.match_type, "solo").toLowerCase(),
    mapName: safeText(raw?.mapName || raw?.map_name, "—"),
    matchDate: safeText(raw?.matchDate || raw?.date || raw?.match_date, ""),
    startTime: safeText(raw?.startTime || raw?.time || raw?.start_time, ""),
    registrationOpensAt: raw?.registrationOpensAt || raw?.registration_opens_at || null,
    registrationClosesAt: raw?.registrationClosesAt || raw?.registration_closes_at || null,
    capacity: Math.max(0, safeNumber(raw?.capacity || raw?.maxPlayers || raw?.slots, 0)),
    entryFee: safeNumber(raw?.entryFee ?? raw?.entry_fee, 0),
    perKillReward: safeNumber(raw?.perKillReward ?? raw?.perKill ?? raw?.per_kill_reward, 0),
    prizePool: safeNumber(raw?.prizePool ?? raw?.prize_pool, 0),
    firstPrize: safeNumber(raw?.firstPrize ?? raw?.first_prize, 0),
    secondPrize: safeNumber(raw?.secondPrize ?? raw?.second_prize, 0),
    thirdPrize: safeNumber(raw?.thirdPrize ?? raw?.third_prize, 0),
    rules: raw?.rules ?? "",
    bannerUrl: safeText(raw?.bannerUrl || raw?.banner_url || game?.bannerUrl || game?.banner_url, ""),
    status: safeText(raw?.status, ""),
    game: {
      id: safeNumber(game?.id, 0),
      name: safeText(game?.name || game?.gameName || game?.game_name, "Game"),
      shortName: safeText(game?.shortName || game?.short_name, ""),
      imageUrl: safeText(game?.imageUrl || game?.image_url, ""),
    },
  };
}

function initials(name) {
  return safeText(name, "P").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P";
}

function errorMessage(code) {
  const map = {
    AUTH_REQUIRED: "Please log in before registering.",
    TOURNAMENT_FULL: "This tournament is full.",
    REGISTRATION_CLOSED: "Registration is closed for this tournament.",
    REGISTRATION_NOT_OPEN: "Registration is not open yet.",
    ALREADY_REGISTERED: "You are already registered for this tournament.",
    TEAM_MEMBER_ALREADY_REGISTERED: "One of the selected team members is already registered.",
    INSUFFICIENT_BALANCE: "Your wallet balance is not enough for this entry fee.",
    PAYMENT_REQUIRED: "Payment is required before this paid tournament can be confirmed.",
    TEAM_NAME_REQUIRED: "Team name is required for this tournament.",
    TEAM_SIZE_INVALID: "The number of team members does not match this tournament format.",
    TEAM_MEMBER_NOT_FOUND: "A team member could not be found. Use their Play2Prove username or email.",
  };
  return map[code] || "Registration could not be completed. Please try again.";
}

function Countdown({ target, label = "MATCH STARTING IN", activeStatus = "" }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, (target || 0) - Date.now()));
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, (target || 0) - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);
  const total = Math.floor(remaining / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const displayLabel = activeStatus === "LIVE" ? "MATCH LIVE" : activeStatus === "MATCH ONGOING" ? "MATCH ONGOING" : activeStatus === "MATCH CLOSING" ? "MATCH CLOSING" : activeStatus === "CALCULATION ONGOING" ? "CALCULATION" : label;
  if (!target) return <div className="tdCountdown muted"><span>{displayLabel}</span><strong>—</strong></div>;
  if (!remaining) return <div className={`tdCountdown ${activeStatus === "LIVE" ? "live" : ""}`}><span>{displayLabel}</span><strong>{activeStatus === "LIVE" ? "LIVE" : "NOW"}</strong></div>;
  return <div className="tdCountdown"><span>{displayLabel}</span><strong>{days > 0 ? `${days}d ` : ""}{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</strong></div>;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = safeText(params?.tournamentId, "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [playerSearch, setPlayerSearch] = useState("");
  const [openRule, setOpenRule] = useState(0);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinStep, setJoinStep] = useState(1);
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);

  const load = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setLoading(true);
      setError("");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const response = await fetch(`${API_ROOT}/${encodeURIComponent(tournamentId)}?t=${Date.now()}`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) throw new Error(payload?.error?.message || "Unable to load this tournament.");
      setData(payload.data || null);
    } catch (err) {
      console.error("Tournament detail load error:", err);
      setError("Tournament could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onAuth = supabase.auth.onAuthStateChange(() => { load(); });
    return () => onAuth.data.subscription.unsubscribe();
  }, [load]);

  const tournament = useMemo(() => normalizeTournament(data?.tournament), [data?.tournament]);
  const results = Array.isArray(data?.results) ? data.results : [];
  const participants = Array.isArray(data?.participants) ? data.participants : [];
  const registration = data?.registration || null;
  const room = data?.room || null;
  const status = normalizeStatus(tournament.status, tournament, results);
  const registeredCount = Math.max(0, safeNumber(data?.registeredCount, participants.length));
  const capacity = tournament.capacity;
  const remainingSlots = Math.max(0, safeNumber(data?.remainingSlots, capacity - registeredCount));
  const progress = capacity ? Math.min(100, Math.max(0, (registeredCount / capacity) * 100)) : 0;
  const rules = useMemo(() => normalizeRules(tournament.rules), [tournament.rules]);
  const startTimestamp = parseIST(tournament.matchDate, tournament.startTime);
  const registrationOpen = ["UPCOMING", "STARTING SOON", "LIVE", "REGISTRATION OPEN"].includes(status) && remainingSlots > 0;
  const teamSize = tournament.matchType === "duo" ? 2 : tournament.matchType === "squad" ? 4 : 1;

  useEffect(() => {
    if (tournament.matchType === "solo") setMembers([]);
    else setMembers(Array.from({ length: teamSize - 1 }, () => ({ identifier: "", playerName: "", gameUid: "" })));
  }, [tournament.matchType, teamSize]);

  const filteredPlayers = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((player) => [player.playerName, player.uid, player.team].some((value) => safeText(value, "").toLowerCase().includes(q)));
  }, [participants, playerSearch]);

  function resetJoin() {
    setJoinOpen(false);
    setJoinStep(1);
    setJoinBusy(false);
    setJoinError("");
    setJoinSuccess(null);
    setAgreed(false);
  }

  async function openJoin() {
    if (!registrationOpen) return;
    setJoinError("");
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      const next = `/tournaments/${encodeURIComponent(tournamentId)}`;
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
      return;
    }
    setJoinOpen(true);
  }

  function updateMember(index, key, value) {
    setMembers((current) => current.map((member, memberIndex) => memberIndex === index ? { ...member, [key]: value } : member));
  }

  async function confirmRegistration() {
    if (!agreed) {
      setJoinError("Please accept the tournament rules before confirming.");
      return;
    }
    setJoinBusy(true);
    setJoinError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        const next = `/tournaments/${encodeURIComponent(tournamentId)}`;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
        return;
      }
      const payloadMembers = tournament.matchType === "solo" ? [] : members.map((member) => ({
        identifier: member.identifier.trim(),
        playerName: member.playerName.trim(),
        gameUid: member.gameUid.trim(),
      }));
      const response = await fetch(`${API_ROOT}/${encodeURIComponent(tournamentId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ playerName: playerName.trim(), gameUid: gameUid.trim(), teamName: teamName.trim(), members: payloadMembers }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) throw new Error(payload?.error?.code || "REGISTRATION_FAILED");
      setJoinSuccess(payload.data || null);
      setJoinStep(3);
      await load();
    } catch (err) {
      console.error("Tournament registration error:", err);
      setJoinError(errorMessage(err?.message));
    } finally {
      setJoinBusy(false);
    }
  }

  if (loading) {
    return <main className="tdPage"><div className="tdShell"><div className="tdSkeletonHero"><div /><div /><div /><div /></div><div className="tdSkeletonGrid"><div className="tdSkeletonBlock" /><div className="tdSkeletonBlock" /></div></div></main>;
  }

  if (error || !data?.tournament) {
    return <main className="tdPage"><div className="tdShell tdErrorPage"><div className="tdErrorIcon">!</div><span className="tdEyebrow">TOURNAMENT UNAVAILABLE</span><h1>We couldn't load this tournament.</h1><p>Try again or return to the tournament lobby.</p><div className="tdErrorActions"><button className="tdSecondaryButton" onClick={load}>RETRY</button><button className="tdPrimaryButton" onClick={() => { window.location.href = "/tournaments"; }}>BACK TO TOURNAMENTS</button></div></div></main>;
  }

  const statusClass = status.toLowerCase().replace(/\s+/g, "-");
  const roomUnlocked = Boolean(room?.id && room?.password);
  const resultsAvailable = results.some((item) => safeText(item?.result_status, "").toLowerCase() !== "pending");
  const notice = status === "CALCULATION ONGOING" ? "Results are being verified. New registrations are disabled." : status === "LIVE" ? "Only registered participants should use the released match information." : status === "MATCH ONGOING" ? "The match is in progress. Registration is closed after the 10-minute join window." : status === "MATCH CLOSING" ? "The match is closing. Registration is disabled while results are finalized." : "Entry fee and eligibility are validated on the server before registration is confirmed.";
  const countdownLabel = status === "LIVE" ? "MATCH LIVE" : status === "MATCH ONGOING" ? "MATCH ONGOING" : status === "MATCH CLOSING" ? "MATCH CLOSING" : status === "CALCULATION ONGOING" ? "CALCULATION" : "MATCH STARTING IN";

  return (
    <main className="tdPage">
      <div className="tdAmbient tdAmbientOne" />
      <div className="tdAmbient tdAmbientTwo" />
      <div className="tdShell">
        <header className="tdTopBar">
          <button className="tdBackButton" onClick={() => { window.location.href = "/tournaments"; }} aria-label="Back to tournaments">← <span>BACK TO TOURNAMENTS</span></button>
          <div className="tdReference"><span>TOURNAMENT REF</span><strong>{safeText(tournament.id)}</strong></div>
        </header>

        <div className="tdLayout">
          <div className="tdMain">
            <section className="tdHero">
              {tournament.bannerUrl && <div className="tdHeroImage" style={{ backgroundImage: `url("${tournament.bannerUrl.replace(/"/g, "")}")` }} aria-hidden="true" />}
              <div className="tdHeroShade" />
              <div className="tdHeroContent">
                <div className="tdHeroBadges">
                  <span className="tdGameBadge"><span className="tdGameDot" />{tournament.game.name}</span>
                  <span className={`tdStatus ${statusClass}`}><i />{status}</span>
                </div>
                <div className="tdHeroTitleRow">
                  <div>
                    <span className="tdEyebrow">COMPETITIVE TOURNAMENT</span>
                    <h1>{tournament.title}</h1>
                    <div className="tdMeta"><span>{tournament.matchType.toUpperCase()}</span><b>•</b><span>{tournament.mapName}</span><b>•</b><span>{formatDate(tournament.matchDate)}</span><b>•</b><span>{formatTime(tournament.startTime)}</span></div>
                  </div>
                </div>
                <div className="tdHeroFooter">
                  <div className="tdSlotBlock"><div><strong>{registeredCount}</strong><span> / {capacity || "—"} PLAYERS</span></div><div className="tdProgress"><span style={{ width: `${progress}%` }} /></div><small>{remainingSlots} SLOTS AVAILABLE</small></div>
                  <div className="tdHeroSignal"><span className="tdSignalDot" />{status === "CALCULATION ONGOING" ? "CALCULATING RESULTS" : status === "LIVE" ? "MATCH IN PROGRESS" : status === "MATCH ONGOING" ? "MATCH ONGOING" : status === "MATCH CLOSING" ? "MATCH CLOSING" : status === "STARTING SOON" ? "MATCH STARTING SOON" : "TOURNAMENT STATUS"}</div>
                </div>
              </div>
            </section>

            <nav className="tdTabs" aria-label="Tournament sections">
              {TABS.map(([id, label]) => <button key={id} className={`tdTab ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>)}
            </nav>

            {activeTab === "overview" && <section className="tdSectionGrid">
              <div className="tdPanel tdOverviewPanel"><div className="tdPanelHead"><div><span className="tdEyebrow">TOURNAMENT</span><h2>Overview</h2></div><span className={`tdMiniStatus ${statusClass}`}>{status}</span></div><div className="tdInfoGrid">
                {[["GAME", tournament.game.name], ["FORMAT", tournament.matchType.toUpperCase()], ["MAP", tournament.mapName], ["DATE", formatDate(tournament.matchDate)], ["START TIME", formatTime(tournament.startTime)], ["TIME SLOT", "—"], ["REGISTRATION", registrationOpen ? "OPEN" : status], ["CAPACITY", capacity ? `${capacity} players` : "—"]].map(([label, value]) => <div className="tdInfoItem" key={label}><span>{label}</span><strong>{value}</strong></div>)}
              </div></div>
              <aside className="tdPanel tdQuickPanel"><span className="tdEyebrow">QUICK STATS</span><h2>Entry economics</h2><div className="tdQuickRows"><div><span>ENTRY FEE</span><strong>{formatMoney(tournament.entryFee)}</strong></div><div><span>PRIZE POOL</span><strong>{formatMoney(tournament.prizePool)}</strong></div><div><span>PER KILL</span><strong>{formatMoney(tournament.perKillReward)}</strong></div><div><span>PLAYERS</span><strong>{registeredCount} / {capacity || "—"}</strong></div></div></aside>
              <div className="tdPanel tdNoticePanel"><div className="tdNoticeIcon">i</div><div><span className="tdEyebrow">IMPORTANT NOTICE</span><p>{notice}</p></div></div>
            </section>}

            {activeTab === "players" && <section className="tdPanel tdPlayersPanel"><div className="tdPanelHead"><div><span className="tdEyebrow">ROSTER</span><h2>Registered players</h2></div><strong className="tdCount">{participants.length}</strong></div><div className="tdPlayerTools"><label className="tdSearchWrap"><span>⌕</span><input value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} placeholder="Search player, UID or team" aria-label="Search players" /></label><span>{filteredPlayers.length} visible</span></div>{filteredPlayers.length ? <div className="tdPlayerTable"><div className="tdPlayerTableHead"><span>#</span><span>PLAYER / TEAM</span><span>GAME UID</span><span>STATUS</span><span>JOINED</span></div>{filteredPlayers.map((player, index) => <div className="tdPlayerRow" key={player.id || `${player.uid}-${index}`}><span className="tdRank">{String(index + 1).padStart(2, "0")}</span><div className="tdPlayerIdentity">{player.avatarUrl ? <img src={player.avatarUrl} alt="" /> : <span>{initials(player.playerName)}</span>}<div><strong>{player.playerName}</strong><small>{player.team || "Solo"}</small></div></div><code>{player.uid || "—"}</code><span className="tdPlayerStatus"><i />{player.status || "confirmed"}</span><time>{player.joinedAt ? formatDate(player.joinedAt.slice(0, 10)) : "—"}</time></div>)}</div> : <div className="tdEmpty"><strong>NO REGISTERED PLAYERS</strong><span>{playerSearch ? "No players match your search." : "Registration data has not been published yet."}</span></div>}</section>}

            {activeTab === "rules" && <section className="tdPanel tdRulesPanel"><div className="tdPanelHead"><div><span className="tdEyebrow">RULEBOOK</span><h2>Rules & conduct</h2></div></div>{rules.length ? <div className="tdRules">{rules.map((rule, index) => { const open = openRule === index; return <div className={`tdRule ${open ? "open" : ""}`} key={`${rule.title}-${index}`}><button className="tdRuleHeader" onClick={() => setOpenRule(open ? -1 : index)} aria-expanded={open}><span><b>{String(index + 1).padStart(2, "0")}</b><strong>{rule.title}</strong><small>{rule.summary}</small></span><i>{open ? "−" : "+"}</i></button>{open && <div className="tdRuleBody">{rule.items.map((item, itemIndex) => <p key={`${item}-${itemIndex}`}><b>{String(itemIndex + 1).padStart(2, "0")}</b>{item}</p>)}</div>}</div>; })}</div> : <div className="tdEmpty"><strong>RULES NOT AVAILABLE</strong><span>Tournament rules will be published by the organizer.</span></div>}</section>}

            {activeTab === "prizes" && <section className="tdPanel tdPrizesPanel"><div className="tdPanelHead"><div><span className="tdEyebrow">REWARDS</span><h2>Prize structure</h2></div></div><div className="tdPrizeHero"><div><span>TOTAL PRIZE POOL</span><strong>{formatMoney(tournament.prizePool)}</strong></div><div><span>PER KILL</span><strong>{formatMoney(tournament.perKillReward)}</strong></div></div><div className="tdPrizeGrid">{[["01", "1ST PLACE", tournament.firstPrize], ["02", "2ND PLACE", tournament.secondPrize], ["03", "3RD PLACE", tournament.thirdPrize]].map(([rank, label, value]) => <div key={rank}><span>{rank}</span><small>{label}</small><strong>{formatMoney(value)}</strong></div>)}</div>{resultsAvailable && <div className="tdResultsNotice">RESULTS AVAILABLE · {results.length} recorded result{results.length === 1 ? "" : "s"}</div>}</section>}

            {activeTab === "match" && <section className="tdSectionGrid tdMatchGrid"><div className="tdPanel"><div className="tdPanelHead"><div><span className="tdEyebrow">MATCH COMMAND</span><h2>Match information</h2></div></div><div className="tdInfoGrid">{[["GAME", tournament.game.name], ["MODE", tournament.matchType.toUpperCase()], ["MAP", tournament.mapName], ["DATE", formatDate(tournament.matchDate)], ["START", formatTime(tournament.startTime)], ["STATUS", status]].map(([label, value]) => <div className="tdInfoItem" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div><div className="tdPanel tdMatchCountdown"><Countdown target={startTimestamp} label={countdownLabel} activeStatus={status}/><div className={`tdRoom ${roomUnlocked ? "released" : "locked"}`}><span className="tdEyebrow">ROOM ACCESS</span><strong>{roomUnlocked ? "ROOM RELEASED" : "ROOM LOCKED"}</strong>{roomUnlocked ? <div className="tdRoomCredentials"><div><span>ROOM ID</span><code>{room.id}</code><button onClick={() => navigator.clipboard?.writeText(room.id)} aria-label="Copy room ID">COPY</button></div><div><span>PASSWORD</span><code>{room.password}</code><button onClick={() => navigator.clipboard?.writeText(room.password)} aria-label="Copy room password">COPY</button></div></div> : <p>Room credentials appear here only after authorized release.</p>}</div></div></section>}
          </div>

          <aside className="tdRail">
            <div className="tdActionPanel">
              <div className="tdActionTop"><span className="tdEyebrow">TOURNAMENT STATUS</span><span className={`tdRailStatus ${statusClass}`}><i />{status}</span></div>
              {registration ? <div className="tdRegistered"><div className="tdRegisteredMark">✓</div><span className="tdEyebrow">REGISTRATION CONFIRMED</span><h2>You're in.</h2><div className="tdRegistrationId"><span>REGISTRATION ID</span><strong>{registration.registrationId}</strong></div><div className="tdRegisteredMeta"><div><span>PLAYER</span><strong>{registration.gameUsername}</strong></div><div><span>GAME UID</span><strong>{registration.gameUid}</strong></div>{registration.teamName && <div><span>TEAM</span><strong>{registration.teamName}</strong></div>}</div><button className="tdPrimaryButton" onClick={() => setActiveTab("match")}>VIEW MATCH INFO <b>→</b></button></div> : <><button className="tdJoinCta" onClick={openJoin} disabled={!registrationOpen}>{registrationOpen ? "JOIN NOW" : status === "REGISTRATION CLOSED" ? "REGISTRATION CLOSED" : status === "FULL" || remainingSlots === 0 ? "TOURNAMENT FULL" : status === "CALCULATION ONGOING" ? "CALCULATION ONGOING" : status === "MATCH ONGOING" ? "MATCH ONGOING" : status === "MATCH CLOSING" ? "MATCH CLOSING" : status === "COMPLETED" ? "VIEW RESULTS" : status}<b>→</b></button><div className="tdRailStats"><div><span>ENTRY</span><strong>{formatMoney(tournament.entryFee)}</strong></div><div><span>PRIZE POOL</span><strong>{formatMoney(tournament.prizePool)}</strong></div><div><span>PER KILL</span><strong>{formatMoney(tournament.perKillReward)}</strong></div></div><div className="tdRailSlots"><div><span>SLOTS AVAILABLE</span><strong>{remainingSlots}</strong></div><div className="tdProgress"><span style={{ width: `${progress}%` }} /></div><small>{registeredCount} registered · {capacity || "—"} capacity</small></div><Countdown target={startTimestamp} label={countdownLabel} activeStatus={status}/><div className="tdRailRoom"><span className="tdEyebrow">ROOM STATUS</span><strong>{roomUnlocked ? "RELEASED" : "LOCKED"}</strong><small>{roomUnlocked ? "Credentials are available in Match Info." : "Only eligible registered players can view room credentials."}</small></div></>}
              <div className="tdRailNotice"><span>SECURE REGISTRATION</span><p>Final fee, slot availability, eligibility and payment status are verified by the server.</p></div>
            </div>
          </aside>
        </div>
      </div>

      {joinOpen && <div className="tdModalBackdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) resetJoin(); }}><div className="tdModal" role="dialog" aria-modal="true" aria-labelledby="td-registration-title"><button className="tdModalClose" onClick={resetJoin} aria-label="Close registration">×</button><div className="tdModalHead"><span className="tdEyebrow">SECURE REGISTRATION</span><h2 id="td-registration-title">{joinStep === 3 ? "Registration submitted" : joinStep === 2 ? "Review registration" : "Join tournament"}</h2><div className="tdSteps"><span className={joinStep >= 1 ? "active" : ""}>01 DETAILS</span><span className={joinStep >= 2 ? "active" : ""}>02 REVIEW</span><span className={joinStep >= 3 ? "active" : ""}>03 STATUS</span></div></div>{joinError && <div className="tdFormError">{joinError}</div>}
        {joinStep === 1 && <div className="tdForm"><div className="tdFormSummary"><div><span>TOURNAMENT</span><strong>{tournament.title}</strong></div><div><span>ENTRY</span><strong>{formatMoney(tournament.entryFee)}</strong></div></div><label>Player / captain name<input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Your in-game name" autoComplete="nickname" /></label><label>Game UID<input value={gameUid} onChange={(e) => setGameUid(e.target.value)} placeholder="Enter your Game UID" inputMode="numeric" /></label>{tournament.matchType !== "solo" && <><label>Team name<input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name" /></label><div className="tdMemberFields"><span className="tdFieldLegend">TEAM MEMBERS · {teamSize - 1} REQUIRED</span>{members.map((member, index) => <div className="tdMember" key={index}><strong>MEMBER {index + 2}</strong><input value={member.identifier} onChange={(e) => updateMember(index, "identifier", e.target.value)} placeholder="Play2Prove username / email" /><input value={member.playerName} onChange={(e) => updateMember(index, "playerName", e.target.value)} placeholder="In-game name" /><input value={member.gameUid} onChange={(e) => updateMember(index, "gameUid", e.target.value)} placeholder="Game UID" /></div>)}</div></>}<button className="tdPrimaryButton tdFormNext" onClick={() => { if (!playerName.trim() || !gameUid.trim()) { setJoinError("Player name and Game UID are required."); return; } if (tournament.matchType !== "solo" && (!teamName.trim() || members.some((member) => !member.identifier.trim() || !member.playerName.trim() || !member.gameUid.trim()))) { setJoinError("Complete every required team field before continuing."); return; } setJoinError(""); setJoinStep(2); }}>CONTINUE TO REVIEW <b>→</b></button></div>}
        {joinStep === 2 && <div className="tdReview"><div className="tdReviewHero"><span>ENTRY FEE</span><strong>{formatMoney(tournament.entryFee)}</strong><small>Server verifies the final amount before confirmation.</small></div><div className="tdReviewRows"><div><span>TOURNAMENT</span><strong>{tournament.title}</strong></div><div><span>GAME</span><strong>{tournament.game.name} · {tournament.matchType.toUpperCase()}</strong></div><div><span>CAPTAIN</span><strong>{playerName}</strong><small>{gameUid}</small></div>{teamName && <div><span>TEAM</span><strong>{teamName}</strong></div>}{members.map((member, index) => <div key={index}><span>MEMBER {index + 2}</span><strong>{member.playerName}</strong><small>{member.gameUid}</small></div>)}</div><label className="tdAgreement"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /><span>I agree to the tournament rules and understand that registration is subject to server-side eligibility, slot and payment validation.</span></label><div className="tdReviewActions"><button className="tdSecondaryButton" onClick={() => setJoinStep(1)}>BACK</button><button className="tdPrimaryButton" onClick={confirmRegistration} disabled={joinBusy || !agreed}>{joinBusy ? "CONFIRMING..." : "CONFIRM REGISTRATION"}<b>→</b></button></div></div>}
        {joinStep === 3 && <div className="tdSuccess"><div className="tdSuccessIcon">✓</div><span className="tdEyebrow">{joinSuccess?.payment_status === "pending" ? "REGISTRATION SUBMITTED" : "REGISTRATION CONFIRMED"}</span><h2>{joinSuccess?.payment_status === "pending" ? "Payment required to confirm." : "You are registered."}</h2><p>{joinSuccess?.payment_status === "pending" ? "Your registration details were recorded, but this paid tournament still needs payment before the slot can be confirmed." : "Your registration has been recorded and the tournament state has been refreshed."}</p><div className="tdSuccessCard"><div><span>REGISTRATION ID</span><strong>{joinSuccess?.registration_id || registration?.registrationId || "—"}</strong></div><div><span>PAYMENT</span><strong>{joinSuccess?.payment_status || "paid"}</strong></div><div><span>ROOM</span><strong>{roomUnlocked ? "RELEASED" : "LOCKED"}</strong></div></div><button className="tdPrimaryButton" onClick={resetJoin}>DONE</button></div>}
      </div></div>}
    </main>
  );
}
