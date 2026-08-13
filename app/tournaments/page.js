 "use client";

import { useEffect, useMemo, useState } from "react";
import "./tournaments.css";

/* =========================================================
   PLAY2PROVE — TOURNAMENTS
   Google Sheets + Apps Script
========================================================= */

const GAMES_API =
  "https://script.google.com/macros/s/AKfycbx3vZuDmwpqykeX45oWhNffRqySbFQZ6a5ZukM3KEhB6B5e8I6rzWBmg8tsm_zUNz0/exec";

const CACHE_KEY = "play2prove_tournaments_v3";
const CACHE_MAX_AGE = 5 * 60 * 1000;

const SLOT_RANGES = {
  All: "All Times",
  Morning: "06:00 AM – 12:00 PM",
  Afternoon: "12:00 PM – 04:00 PM",
  Evening: "04:00 PM – 07:00 PM",
  Night: "07:00 PM – 06:00 AM",
};

const STATUS_FILTERS = ["All", "Upcoming", "Live", "Past"];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TournamentsPage() {
  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedGame, setSelectedGame] = useState(null);

  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("All");
  const [slot, setSlot] = useState("All");
  const [mode, setMode] = useState("All");
  const [map, setMap] = useState("All");

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  /* =======================================================
     FAST CACHE-FIRST API LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const normalizePayload = (payload) => {
      if (Array.isArray(payload)) {
        return {
          games: payload.map(normalizeGame).filter((x) => x.name),
          tournaments: [],
        };
      }

      return {
        games: Array.isArray(payload?.games)
          ? payload.games.map(normalizeGame).filter((x) => x.name)
          : [],
        tournaments: Array.isArray(payload?.tournaments)
          ? payload.tournaments
              .map(normalizeTournament)
              .filter((x) => x.game),
          : [],
      };
    };

    const load = async () => {
      /* 1. INSTANT LOCAL CACHE */
      try {
        const cached = localStorage.getItem(CACHE_KEY);

        if (cached) {
          const parsed = JSON.parse(cached);

          if (
            parsed?.data &&
            Date.now() - Number(parsed.savedAt || 0) < CACHE_MAX_AGE
          ) {
            const normalized = normalizePayload(parsed.data);

            if (!cancelled) {
              setGames(normalized.games);
              setTournaments(normalized.tournaments);
              setLoading(false);
            }
          }
        }
      } catch {
        // Cache is optional.
      }

      /* 2. FRESH BACKGROUND FETCH */
      try {
        if (!cancelled) setRefreshing(true);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(GAMES_API, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error("API response failed");
        }

        const payload = await response.json();
        const normalized = normalizePayload(payload);

        if (!cancelled) {
          setGames(normalized.games);
          setTournaments(normalized.tournaments);
          setLoading(false);
          setRefreshing(false);
        }

        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              savedAt: Date.now(),
              data: payload,
            })
          );
        } catch {
          // Cache write is optional.
        }
      } catch (error) {
        console.error("Play2Prove API:", error);

        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     SELECTED GAME
  ======================================================= */

  const selectedGameData = useMemo(
    () => games.find((game) => game.id === selectedGame),
    [games, selectedGame]
  );

  /* =======================================================
     GAME TOURNAMENTS
  ======================================================= */

  const gameTournaments = useMemo(() => {
    if (!selectedGameData) return [];

    const wanted = clean(selectedGameData.name);

    return tournaments.filter(
      (item) => clean(item.game) === wanted
    );
  }, [selectedGameData, tournaments]);

  /* =======================================================
     FILTER OPTIONS — ONLY FROM CURRENT GAME
  ======================================================= */

  const dates = useMemo(
    () => unique(gameTournaments.map((x) => x.date).filter(Boolean)),
    [gameTournaments]
  );

  const modes = useMemo(
    () => unique(gameTournaments.map((x) => x.mode).filter(Boolean)),
    [gameTournaments]
  );

  const maps = useMemo(
    () => unique(gameTournaments.map((x) => x.map).filter(Boolean)),
    [gameTournaments]
  );

  /* =======================================================
     FILTERED TOURNAMENTS
  ======================================================= */

  const filteredTournaments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return gameTournaments.filter((item) => {
      const itemStatus = normalizeStatus(item.status);

      /* Status:
         Deciding is intentionally NOT a separate filter.
         It is grouped under Past so old deciding results
         remain visible.
      */
      if (status === "Upcoming" && itemStatus !== "Upcoming") {
        return false;
      }

      if (status === "Live" && itemStatus !== "Live") {
        return false;
      }

      if (
        status === "Past" &&
        !["Past", "Deciding"].includes(itemStatus)
      ) {
        return false;
      }

      if (date !== "All" && item.date !== date) {
        return false;
      }

      if (slot !== "All" && item.slot !== slot) {
        return false;
      }

      if (mode !== "All" && clean(item.mode) !== clean(mode)) {
        return false;
      }

      if (map !== "All" && clean(item.map) !== clean(map)) {
        return false;
      }

      if (query) {
        const searchable = [
          item.tournamentName,
          item.map,
          item.mode,
          item.time,
          item.status,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [
    gameTournaments,
    status,
    date,
    slot,
    mode,
    map,
    search,
  ]);

  /* =======================================================
     FILTER ACTIONS
  ======================================================= */

  function selectGame(id) {
    setSelectedGame(id);
    clearFilters();
  }

  function clearFilters() {
    setStatus("All");
    setDate("All");
    setSlot("All");
    setMode("All");
    setMap("All");
    setSearch("");
    setSearchOpen(false);
  }

  function goBack() {
    if (selectedGame) {
      setSelectedGame(null);
      clearFilters();
      return;
    }

    window.location.href = "/";
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="tournamentPage">
      <div className="tpGrid" />
      <div className="tpGlow tpOrange" />
      <div className="tpGlow tpPurple" />

      {/* HEADER */}
      <header className="tpHeader">
        <button className="backButton" onClick={goBack} aria-label="Back">
          ←
        </button>

        <div className="tpBrand">
          <span>PLAY2PROVE</span>
          <strong>
            {selectedGameData?.name || "TOURNAMENTS"}
          </strong>
        </div>

        <div className="tpRight">
          <button className="tpWallet">
            <small>WALLET</small>
            <strong>₹0</strong>
          </button>

          <button className="tpProfile" aria-label="Profile">
            M
          </button>
        </div>
      </header>

      {!selectedGame ? (
        <GameSelection
          games={games}
          loading={loading}
          refreshing={refreshing}
          onSelect={selectGame}
        />
      ) : (
        <section className="tournamentContent">
          {/* GAME HERO */}
          <section className="gameBanner">
            <div className="bannerCopy">
              <span>TOURNAMENT ARENA</span>
              <h1>{selectedGameData?.name}</h1>
              <p>
                Choose your match, enter the arena and prove your skill.
              </p>
            </div>

            <div className="bannerVisual">
              {selectedGameData?.image ? (
                <img
                  src={selectedGameData.image}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <span>🎮</span>
              )}
            </div>
          </section>

          {/* STICKY FILTER TOOLBAR */}
          <div className="filterSticky">
            <div className="selectedFilterChips">
              <span className="filterLabel">FILTERS</span>

              {status !== "All" && (
                <FilterChip
                  label={status}
                  onRemove={() => setStatus("All")}
                />
              )}

              {date !== "All" && (
                <FilterChip
                  label={date}
                  onRemove={() => setDate("All")}
                />
              )}

              {slot !== "All" && (
                <FilterChip
                  label={slot}
                  onRemove={() => setSlot("All")}
                />
              )}

              {mode !== "All" && (
                <FilterChip
                  label={mode}
                  onRemove={() => setMode("All")}
                />
              )}

              {map !== "All" && (
                <FilterChip
                  label={map}
                  onRemove={() => setMap("All")}
                />
              )}

              {search && (
                <FilterChip
                  label={`"${search}"`}
                  onRemove={() => setSearch("")}
                />
              )}

              {status === "All" &&
                date === "All" &&
                slot === "All" &&
                mode === "All" &&
                map === "All" &&
                !search && <span className="noFilters">ALL MATCHES</span>}
            </div>

            <div className="filterActions">
              <button
                className={`searchButton ${searchOpen ? "active" : ""}`}
                onClick={() => setSearchOpen((v) => !v)}
              >
                ⌕ <span>SEARCH</span>
              </button>

              <button className="resetButton" onClick={clearFilters}>
                RESET
              </button>
            </div>
          </div>

          {/* FILTER PANEL */}
          <section className="filterPanel">
            {searchOpen && (
              <div className="searchRow">
                <span>⌕</span>
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tournament, map, mode..."
                />
                {search && (
                  <button onClick={() => setSearch("")}>×</button>
                )}
              </div>
            )}

            <div className="filterHeader">
              <div>
                <span>FILTER MATCHES</span>
                <strong>Find your perfect tournament</strong>
              </div>
            </div>

            {/* STATUS */}
            <FilterSection label="MATCH STATUS">
              <div className="compactFilters">
                {STATUS_FILTERS.map((item) => (
                  <button
                    key={item}
                    className={status === item ? "selected" : ""}
                    onClick={() => setStatus(item)}
                  >
                    {item === "Live" && <i className="liveDot" />}
                    {item}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* DATE */}
            <FilterSection label="DATE">
              <div className="compactFilters scrollFilters">
                <button
                  className={date === "All" ? "selected" : ""}
                  onClick={() => setDate("All")}
                >
                  ALL DATES
                </button>

                {dates.map((item) => (
                  <button
                    key={item}
                    className={date === item ? "selected" : ""}
                    onClick={() => setDate(item)}
                  >
                    {formatDate(item)}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* TIME SLOT — NO EXACT TIME FILTER */}
            <FilterSection label="TIME SLOT">
              <div className="slotGrid">
                {Object.entries(SLOT_RANGES).map(([key, range]) => (
                  <button
                    key={key}
                    className={slot === key ? "selected" : ""}
                    onClick={() => setSlot(key)}
                  >
                    <strong>{key}</strong>
                    <small>{range}</small>
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* MODE */}
            <FilterSection label="MODE">
              <div className="compactFilters">
                <button
                  className={mode === "All" ? "selected" : ""}
                  onClick={() => setMode("All")}
                >
                  ALL MODES
                </button>

                {modes.map((item) => (
                  <button
                    key={item}
                    className={mode === item ? "selected" : ""}
                    onClick={() => setMode(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* MAP */}
            <FilterSection label="MAP">
              <div className="compactFilters scrollFilters">
                <button
                  className={map === "All" ? "selected" : ""}
                  onClick={() => setMap("All")}
                >
                  ALL MAPS
                </button>

                {maps.map((item) => (
                  <button
                    key={item}
                    className={map === item ? "selected" : ""}
                    onClick={() => setMap(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </FilterSection>
          </section>

          {/* RESULTS */}
          <div className="resultsHeader">
            <div>
              <span>AVAILABLE MATCHES</span>
              <strong>
                {filteredTournaments.length}{" "}
                {filteredTournaments.length === 1
                  ? "TOURNAMENT"
                  : "TOURNAMENTS"}
              </strong>
            </div>

            {refreshing && <small className="syncing">SYNCING LIVE DATA…</small>}
          </div>

          {filteredTournaments.length > 0 ? (
            <div className="tournamentGrid">
              {filteredTournaments.map((item) => (
                <TournamentCard
                  key={item.id}
                  tournament={item}
                  game={selectedGameData}
                />
              ))}
            </div>
          ) : (
            <div className="comingSoon">
              <div className="comingGlow">✦</div>
              <span>ARENA STATUS</span>
              <h2>COMING SOON</h2>
              <p>
                No tournament is available for the selected filters right now.
                Check back soon for the next battle.
              </p>
              <button onClick={clearFilters}>CLEAR FILTERS</button>
            </div>
          )}
        </section>
      )}

      <div className="tpNeonBottom" />
    </main>
  );
}

/* =========================================================
   GAME SELECTION
========================================================= */

function GameSelection({ games, loading, refreshing, onSelect }) {
  return (
    <section className="gameSelection">
      <div className="selectionIntro">
        <span>CHOOSE YOUR BATTLE</span>
        <h1>
          SELECT <em>GAME</em>
        </h1>
        <p>
          Pick your game and enter its tournament arena.
        </p>
        {refreshing && !loading && (
          <small className="miniSync">● LIVE SHEET SYNC</small>
        )}
      </div>

      {loading && games.length === 0 ? (
        <div className="gameLoading">
          <div className="loadingRing" />
          <strong>LOADING ARENAS</strong>
          <span>Connecting to Play2Prove tournament data…</span>
        </div>
      ) : games.length > 0 ? (
        <div className="gameCards">
          {games.map((game, index) => (
            <button
              className="gameSelectCard"
              key={game.id}
              onClick={() => onSelect(game.id)}
            >
              <div className="gameCardName">
                <span>{game.name}</span>
                <b>ENTER ARENA →</b>
              </div>

              <div className="gameImage">
                {game.image ? (
                  <img
                    src={game.image}
                    alt={game.name}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index < 2 ? "high" : "auto"}
                  />
                ) : (
                  <div className="imageFallback">🎮</div>
                )}

                <div className="imageOverlay" />
              </div>

              <div className="gameCardBottom">
                <span>📱 {game.device}</span>
                <span className={statusClass(game.status)}>
                  ● {normalizeStatus(game.status).toUpperCase()}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="comingSoon">
          <div className="comingGlow">🎮</div>
          <span>GAME ARENA</span>
          <h2>COMING SOON</h2>
          <p>
            No published games are available yet. Publish a game from your
            Games sheet to make it appear here.
          </p>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   TOURNAMENT CARD
========================================================= */

function TournamentCard({ tournament, game }) {
  const normalized = normalizeStatus(tournament.status);

  return (
    <article className={`matchCard ${statusClass(normalized)}`}>
      <div className="matchImage">
        {tournament.image ? (
          <img
            src={tournament.image}
            alt={tournament.tournamentName || "Tournament"}
            loading="lazy"
            decoding="async"
          />
        ) : game?.image ? (
          <img
            src={game.image}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="matchImageFallback">🎮</div>
        )}

        <div className="matchImageShade" />

        <div className="matchImageTop">
          <span>{game?.name || tournament.game}</span>
          <b>
            {normalized === "Live" && <i className="liveDot" />}
            {normalized.toUpperCase()}
          </b>
        </div>
      </div>

      <div className="matchBody">
        <div className="matchTitleRow">
          <div>
            <small>TOURNAMENT</small>
            <h3>{tournament.tournamentName || "Tournament"}</h3>
          </div>
        </div>

        <div className="matchDetails">
          <Detail label="DATE" value={formatDate(tournament.date)} />
          <Detail label="TIME" value={tournament.time || "—"} />
          <Detail label="MODE" value={tournament.mode || "—"} />
          <Detail label="MAP" value={tournament.map || "—"} />
        </div>

        <div className="rewardDetails">
          <Detail label="ENTRY FEE" value={money(tournament.entryFee)} />
          <Detail label="PER KILL" value={money(tournament.perKill)} />
          <Detail
            label="PRIZE POOL"
            value={money(tournament.prizePool)}
            accent
          />
        </div>

        {normalized === "Past" || normalized === "Deciding" ? (
          <button className="resultButton">VIEW RESULTS →</button>
        ) : normalized === "Live" ? (
          <button className="liveButton">VIEW LIVE MATCH →</button>
        ) : (
          <button className="joinButton">VIEW & JOIN →</button>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function FilterSection({ label, children }) {
  return (
    <div className="filterGroup">
      <label>{label}</label>
      {children}
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <button className="filterChip" onClick={onRemove}>
      {label} ×
    </button>
  );
}

function Detail({ label, value, accent = false }) {
  return (
    <div className={accent ? "accentDetail" : ""}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================================================
   NORMALIZERS
========================================================= */

function normalizeGame(item) {
  const name = String(item?.gameName ?? item?.["Game Name"] ?? "").trim();

  return {
    id:
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "game",
    name,
    image: String(item?.image ?? item?.["Image URL"] ?? "").trim(),
    status: String(item?.status ?? "Upcoming").trim(),
    device: "MOBILE + PC",
  };
}

function normalizeTournament(item, index = 0) {
  const game = String(item?.game ?? item?.Game ?? "").trim();
  const year = String(item?.year ?? item?.Year ?? "").trim();
  const rawDate = String(item?.date ?? item?.Date ?? "").trim();
  const rawTime = String(item?.time ?? item?.Time ?? "").trim();

  return {
    id:
      item?.id ||
      `${game}-${item?.tournamentName || item?.["Tournament Name"] || index}-${rawDate}-${rawTime}`,
    game,
    tournamentName: String(
      item?.tournamentName ?? item?.["Tournament Name"] ?? ""
    ).trim(),
    date: normalizeDate(rawDate, year),
    time: formatTime(rawTime),
    slot: getSlotFromTime(rawTime),
    mode: String(item?.mode ?? item?.Mode ?? "").trim(),
    map: String(item?.map ?? item?.Map ?? "").trim(),
    image: String(item?.image ?? item?.["Image URL"] ?? "").trim(),
    entryFee: String(item?.entryFee ?? item?.["Entry Fee"] ?? "").trim(),
    perKill: String(item?.perKill ?? item?.["Per Kill"] ?? "").trim(),
    prizePool: String(item?.prizePool ?? item?.["Prize Pool"] ?? "").trim(),
    status: String(item?.status ?? item?.Status ?? "Upcoming").trim(),
    publish: item?.publish !== false,
  };
}

function normalizeStatus(value) {
  const text = clean(value);

  if (text === "ongoing" || text === "live") return "Live";
  if (text === "upcoming") return "Upcoming";
  if (text === "deciding") return "Deciding";
  if (text === "past" || text === "completed") return "Past";

  return String(value || "Upcoming").trim();
}

function normalizeDate(raw, year) {
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const withYear = year ? `${raw} ${year}` : raw;
  const parsed = new Date(withYear);

  if (!Number.isNaN(parsed.getTime())) {
    return [
      parsed.getFullYear(),
      String(parsed.getMonth() + 1).padStart(2, "0"),
      String(parsed.getDate()).padStart(2, "0"),
    ].join("-");
  }

  return raw;
}

function formatDate(value) {
  if (!value) return "—";

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatTime(value) {
  if (!value) return "";

  const text = String(value).trim().toUpperCase();

  const twelve = text.match(
    /^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/
  );

  if (twelve) {
    const h = Number(twelve[1]);
    const m = Number(twelve[2] || 0);
    const p = twelve[3];

    return `${h}:${String(m).padStart(2, "0")} ${p}`;
  }

  const twentyFour = text.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFour) {
    const h = Number(twentyFour[1]);
    const m = Number(twentyFour[2]);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;

    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  }

  return value;
}

function getSlotFromTime(value) {
  const text = String(value || "").trim().toUpperCase();

  let hour;
  let minute;

  const twelve = text.match(
    /^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/
  );

  if (twelve) {
    hour = Number(twelve[1]);
    minute = Number(twelve[2] || 0);

    if (twelve[3] === "AM" && hour === 12) hour = 0;
    if (twelve[3] === "PM" && hour !== 12) hour += 12;
  } else {
    const twentyFour = text.match(/^(\d{1,2}):(\d{1,2})$/);

    if (!twentyFour) return "";

    hour = Number(twentyFour[1]);
    minute = Number(twentyFour[2]);
  }

  const minutes = hour * 60 + minute;

  if (minutes >= 360 && minutes < 720) return "Morning";
  if (minutes >= 720 && minutes < 960) return "Afternoon";
  if (minutes >= 960 && minutes < 1140) return "Evening";

  return "Night";
}

function money(value) {
  const text = String(value ?? "").trim();

  if (!text) return "—";
  if (text.includes("₹")) return text;

  return `₹${text}`;
}

function statusClass(value) {
  const status = normalizeStatus(value).toLowerCase();

  if (status === "live") return "statusLive";
  if (status === "deciding") return "statusDeciding";
  if (status === "past") return "statusPast";

  return "statusUpcoming";
}

function clean(value) {
  return String(value ?? "").trim().toLowerCase();
}

function unique(values) {
  return [...new Set(values)];
}
