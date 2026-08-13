"use client";

import { useEffect, useMemo, useState } from "react";
import "./tournaments.css";

/* =========================================================
   PLAY2PROVE — TOURNAMENT PAGE
   FAST + FILTERABLE + GOOGLE SHEET API
========================================================= */

const API_URL = "/api/tournaments";

const CACHE_KEY = "play2prove_tournaments_v5";
const CACHE_MAX_AGE = 5 * 60 * 1000;

/* =========================================================
   TIME SLOTS
========================================================= */

const TIME_SLOTS = {
  All: "All Times",
  Morning: "06:00 AM – 12:00 PM",
  Afternoon: "12:00 PM – 04:00 PM",
  Evening: "04:00 PM – 07:00 PM",
  Night: "07:00 PM – 06:00 AM",
};

/* =========================================================
   HELPERS
========================================================= */

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isTrue(value) {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();

  return (
    value === true ||
    v === "true" ||
    v === "yes" ||
    v === "1" ||
    v === "published"
  );
}

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeStatus(value) {
  const v = clean(value).toLowerCase();

  if (v === "live") return "Live";
  if (v === "past") return "Past";
  if (v === "deciding") return "Deciding";
  return "Upcoming";
}

function numberValue(value) {
  const cleaned = String(value ?? "")
    .replace(/[₹,\s]/g, "")
    .trim();

  const n = Number(cleaned);

  return Number.isFinite(n) ? n : 0;
}

/* =========================================================
   DATE NORMALIZATION
========================================================= */

function normalizeDate(value) {
  return clean(value).replace(/\s+/g, " ");
}

function formatDate(value, year = "") {
  const raw = normalizeDate(value);

  if (!raw) return "—";

  /* Already good */
  if (
    /^\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?$/.test(
      raw
    )
  ) {
    return raw;
  }

  /* dd/mm/yyyy */
  const slash = raw.match(
    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
  );

  if (slash) {
    const day = Number(slash[1]);
    const month = Number(slash[2]) - 1;
    const yr = Number(slash[3]);

    const d = new Date(yr, month, day);

    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }
  }

  /* Google Sheet date */
  const candidate = year
    ? `${raw} ${year}`
    : raw;

  const d = new Date(candidate);

  if (Number.isNaN(d.getTime())) {
    return raw;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TournamentsPage() {
  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedGame, setSelectedGame] =
    useState(null);

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("All");
  const [slot, setSlot] = useState("All");
  const [mode, setMode] = useState("All");
  const [map, setMap] = useState("All");
  const [search, setSearch] = useState("");

  /* =======================================================
     FETCH ALL DATA — ONE REQUEST
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    function normalizeGame(row, index) {
      const name = clean(
        row?.gameName ??
          row?.game ??
          row?.name
      );

      return {
        id:
          slugify(name) ||
          `game-${index + 1}`,

        name: name || "GAME",

        image: clean(
          row?.image ??
            row?.imageUrl ??
            row?.["Image URL"]
        ),

        status: normalizeStatus(
          row?.status
        ),

        publish: isTrue(
          row?.publish
        ),

        device:
          clean(row?.device) ||
          "MOBILE + PC",
      };
    }

    function normalizeTournament(row, index) {
      const gameName = clean(
        row?.game ??
          row?.gameName
      );

      const tournamentImage = clean(
        row?.image ??
          row?.imageUrl ??
          row?.["Image URL"]
      );

      return {
        id:
          clean(row?.id) ||
          `${slugify(gameName)}-${slugify(
            row?.date
          )}-${slugify(row?.time)}-${index}`,

        game:
          slugify(gameName),

        title:
          clean(
            row?.tournamentName ??
              row?.title ??
              row?.name
          ) || "Tournament",

        date: normalizeDate(
          row?.date
        ),

        year: clean(
          row?.year
        ),

        time: clean(
          row?.time
        ),

        slot:
          clean(row?.slot) ||
          getSlotFromTime(row?.time),

        mode: clean(
          row?.mode
        ),

        map: clean(
          row?.map
        ),

        image:
          tournamentImage,

        entry: numberValue(
          row?.entryFee ??
            row?.entry
        ),

        kill: numberValue(
          row?.perKill ??
            row?.kill
        ),

        prize: numberValue(
          row?.prizePool ??
            row?.prize
        ),

        status: normalizeStatus(
          row?.status
        ),

        publish:
          row?.publish === undefined
            ? true
            : isTrue(row?.publish),

        joined: numberValue(
          row?.joined ??
            row?.playersJoined
        ),

        capacity: numberValue(
          row?.capacity ??
            row?.maxPlayers ??
            row?.slots
        ),
      };
    }

    function applyData(data) {
      const gameRows = Array.isArray(
        data
      )
        ? data
        : Array.isArray(data?.games)
        ? data.games
        : [];

      const tournamentRows =
        Array.isArray(
          data?.tournaments
        )
          ? data.tournaments
          : [];

      const nextGames =
        gameRows
          .map(normalizeGame)
          .filter(
            (game) =>
              game.name &&
              game.publish
          );

      const nextTournaments =
        tournamentRows
          .map(normalizeTournament)
          .filter(
            (item) =>
              item.game &&
              item.publish
          );

      if (!cancelled) {
        setGames(nextGames);
        setTournaments(
          nextTournaments
        );
        setLoading(false);
        setError("");
      }

      return {
        nextGames,
        nextTournaments,
      };
    }

    async function fetchData() {
  let hasUsableCache = false;

  /* ===============================================
     1. INSTANT CACHE
     Previous successful data immediately show
  =============================================== */

  try {
    const saved = JSON.parse(
      localStorage.getItem(CACHE_KEY) || "null"
    );

    if (saved?.data) {
      const age =
        Date.now() - Number(saved.savedAt || 0);

      // Show old successful data immediately.
      // Customer does not have to wait for API.
      applyData(saved.data);

      hasUsableCache = true;

      if (age >= 0 && age < CACHE_MAX_AGE) {
        setLoading(false);
      }
    }
  } catch (cacheError) {
    console.warn(
      "PLAY2PROVE CACHE READ:",
      cacheError
    );
  }

  if (cancelled) return;


  /* ===============================================
     2. BACKGROUND API REFRESH
  =============================================== */

  const controller = new AbortController();

  // Maximum API wait = 5 seconds
  const timeout = setTimeout(() => {
    controller.abort();
  }, 5000);


  try {
    const response = await fetch(API_URL, {
      method: "GET",

      signal: controller.signal,

      headers: {
        Accept: "application/json",
      },

      // Browser can reuse successful response
      cache: "default",

      redirect: "follow",
    });


    if (!response.ok) {
      throw new Error(
        `API ${response.status}`
      );
    }


    const data = await response.json();


    if (
      !data ||
      data.success === false
    ) {
      throw new Error(
        "Invalid API response"
      );
    }


    if (cancelled) return;


    /* ===============================================
       UPDATE PAGE WITH NEW DATA
    =============================================== */

    applyData(data);


    /* ===============================================
       SAVE NEW DATA TO LOCAL CACHE
    =============================================== */

    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          data,
        })
      );
    } catch (cacheError) {
      console.warn(
        "PLAY2PROVE CACHE WRITE:",
        cacheError
      );
    }


  } catch (err) {

    console.warn(
      "PLAY2PROVE BACKGROUND API:",
      err
    );


    if (!cancelled) {

      setLoading(false);


      /*
       IMPORTANT:

       Agar old data already hai,
       to ERROR SCREEN mat dikhao.
      */

      if (!hasUsableCache) {
        setError(
          "Unable to load games right now."
        );
      }
    }


  } finally {

    clearTimeout(timeout);

  }
}


fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     SELECTED GAME
  ======================================================= */

  const selectedGameData =
    games.find(
      (game) =>
        game.id ===
        selectedGame
    );

  /* =======================================================
     GAME TOURNAMENTS
  ======================================================= */

  const gameTournaments =
    useMemo(() => {
      if (!selectedGame)
        return [];

      return tournaments.filter(
        (item) =>
          item.game ===
          selectedGame
      );
    }, [
      tournaments,
      selectedGame,
    ]);

  /* =======================================================
     DYNAMIC DATES
  ======================================================= */

  const dates = useMemo(() => {
    return [
      ...new Set(
        gameTournaments
          .map(
            (item) =>
              item.date
          )
          .filter(Boolean)
      ),
    ];
  }, [
    gameTournaments,
  ]);

  /* =======================================================
     DYNAMIC MODES
  ======================================================= */

  const modes = useMemo(() => {
    return [
      ...new Set(
        gameTournaments
          .map(
            (item) =>
              item.mode
          )
          .filter(Boolean)
      ),
    ];
  }, [
    gameTournaments,
  ]);

  /* =======================================================
     DYNAMIC MAPS
  ======================================================= */

  const maps = useMemo(() => {
    return [
      ...new Set(
        gameTournaments
          .map(
            (item) =>
              item.map
          )
          .filter(Boolean)
      ),
    ];
  }, [
    gameTournaments,
  ]);

  /* =======================================================
     FILTER RESULTS
  ======================================================= */

  const filteredTournaments =
    useMemo(() => {
      if (!selectedGame)
        return [];

      const query =
        search
          .trim()
          .toLowerCase();

      return gameTournaments.filter(
        (item) => {
          /* STATUS */

          if (
            status !== "All" &&
            item.status.toLowerCase() !==
              status.toLowerCase()
          ) {
            return false;
          }

          /* DATE */

          if (
            date !== "All" &&
            item.date !== date
          ) {
            return false;
          }

          /* SLOT */

          if (
            slot !== "All" &&
            item.slot.toLowerCase() !==
              slot.toLowerCase()
          ) {
            return false;
          }

          /* MODE */

          if (
            mode !== "All" &&
            item.mode.toLowerCase() !==
              mode.toLowerCase()
          ) {
            return false;
          }

          /* MAP */

          if (
            map !== "All" &&
            item.map.toLowerCase() !==
              map.toLowerCase()
          ) {
            return false;
          }

          /* SEARCH */

          if (query) {
            const searchable = [
              item.title,
              item.map,
              item.mode,
              item.date,
              item.time,
              item.slot,
              item.status,
            ]
              .join(" ")
              .toLowerCase();

            if (
              !searchable.includes(
                query
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      selectedGame,
      gameTournaments,
      status,
      date,
      slot,
      mode,
      map,
      search,
    ]);

  /* =======================================================
     SELECT GAME
  ======================================================= */

  function selectGame(id) {
    setSelectedGame(id);

    setStatus("All");
    setDate("All");
    setSlot("All");
    setMode("All");
    setMap("All");
    setSearch("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetFilters() {
    setStatus("All");
    setDate("All");
    setSlot("All");
    setMode("All");
    setMap("All");
    setSearch("");
  }

  /* =======================================================
     BACK
  ======================================================= */

  function goBack() {
    if (selectedGame) {
      setSelectedGame(null);
      resetFilters();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.location.href = "/";
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="tournamentPage">

      <div className="tpGlow tpOrange" />
      <div className="tpGlow tpBlue" />
      <div className="tpGrid" />

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="tpHeader">

        <button
          className="backButton"
          onClick={goBack}
        >
          ←
        </button>

        <div className="tpTitle">
          <span>
            PLAY2PROVE
          </span>

          <strong>
            {selectedGameData
              ? selectedGameData.name
              : "TOURNAMENTS"}
          </strong>
        </div>

        <div className="tpRight">

          <button className="tpWallet">
            <small>
              WALLET
            </small>

            <strong>
              ₹0
            </strong>
          </button>

          <button className="tpProfile">
            ◉
          </button>

        </div>
      </header>

      {/* ===================================================
          GAME SELECT
      =================================================== */}

      {!selectedGame ? (
        <section className="gameSelection">

          <div className="selectionIntro">

            <span>
              CHOOSE YOUR BATTLE
            </span>

            <h1>
              SELECT
              <em> GAME</em>
            </h1>

            <p>
              Choose a game to
              explore available
              tournaments.
            </p>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="tournamentLoading">

              <div className="loadingSpinner" />

              <strong>
                LOADING GAMES
              </strong>

              <span>
                Syncing the arena...
              </span>

            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (
              <div className="emptyState">

                <div>
                  ⚠
                </div>

                <h3>
                  GAMES COULD NOT LOAD
                </h3>

                <p>
                  {error}
                </p>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  RETRY
                </button>

              </div>
            )}

          {/* GAME CARDS */}

          {!loading &&
            !error &&
            games.length > 0 && (

              <div className="gameCards">

                {games.map(
                  (
                    game,
                    index
                  ) => (

                    <button
                      key={
                        game.id
                      }
                      className="gameSelectCard"
                      onClick={() =>
                        selectGame(
                          game.id
                        )
                      }
                    >

                      <div className="gameCardName">
                        {game.name}
                      </div>

                      <div className="gameImage">

                        {game.image ? (
                          <img
                            src={
                              game.image
                            }
                            alt={
                              game.name
                            }
                            loading={
                              index <
                              2
                                ? "eager"
                                : "lazy"
                            }
                            fetchPriority={
                              index ===
                              0
                                ? "high"
                                : "auto"
                            }
                            decoding="async"
                            onError={(
                              e
                            ) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : null}

                        <div className="imageFallback">
                          {game.name
                            .toLowerCase()
                            .includes(
                              "free"
                            )
                            ? "🔥"
                            : "🎮"}
                        </div>

                        <div className="imageGlow" />

                      </div>

                      <div className="gameCardBottom">

                        <span>
                          📱{" "}
                          {
                            game.device
                          }
                        </span>

                        <b>
                          ENTER ARENA →
                        </b>

                      </div>

                      <div className="gameStatusRow">

                        <span
                          className={
                            game.status
                              .toLowerCase() ===
                            "live"
                              ? "statusLive"
                              : game.status
                                  .toLowerCase() ===
                                "deciding"
                              ? "statusDeciding"
                              : "statusUpcoming"
                          }
                        >
                          ●{" "}
                          {game.status.toUpperCase()}
                        </span>

                      </div>

                    </button>

                  )
                )}

              </div>
            )}

          {/* NO GAME */}

          {!loading &&
            !error &&
            games.length ===
              0 && (

              <div className="emptyState">

                <div>
                  🎮
                </div>

                <h3>
                  NO GAMES AVAILABLE
                </h3>

                <p>
                  Add a published
                  game in Google
                  Sheets.
                </p>

              </div>
            )}

        </section>
      ) : (

        /* =================================================
           TOURNAMENT AREA
        ================================================= */

        <section className="tournamentContent">

          {/* GAME BANNER */}

          <div className="gameBanner">

            <div>

              <span className="bannerEyebrow">
                TOURNAMENT ARENA
              </span>

              <h1>
                {
                  selectedGameData.name
                }
              </h1>

              <p>
                Find your match.
                Enter the arena.
                Prove yourself.
              </p>

            </div>

            <div className="bannerGameIcon">
              {selectedGameData.name
                .toLowerCase()
                .includes("free")
                ? "🔥"
                : "🎮"}
            </div>

          </div>

          {/* =================================================
              STATUS
              ONLY ALL / UPCOMING / LIVE / PAST
          ================================================= */}

          <div className="statusTabs">

            {[
              "All",
              "Upcoming",
              "Live",
              "Past",
            ].map(
              (item) => (

                <button
                  key={item}
                  className={
                    status === item
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatus(
                      item
                    )
                  }
                >
                  {item ===
                    "Live" &&
                    "● "}

                  {item}
                </button>

              )
            )}

          </div>

          {/* =================================================
              FILTER PANEL
          ================================================= */}

          <div className="filterPanel">

            <div className="filterTitle">

              <div>

                <span>
                  FILTER MATCHES
                </span>

                <strong>
                  Find your perfect
                  tournament
                </strong>

              </div>

            </div>

            {/* =================================================
                STICKY ACTIVE FILTER BAR
                SEARCH + RESET
            ================================================= */}

            <div className="activeFilterBar">

              <div className="activeFilterChips">

                <span className="activeFilterLabel">
                  ACTIVE
                </span>

                {[
                  [
                    "Status",
                    status,
                  ],
                  [
                    "Date",
                    date,
                  ],
                  [
                    "Slot",
                    slot,
                  ],
                  [
                    "Mode",
                    mode,
                  ],
                  [
                    "Map",
                    map,
                  ],
                ]
                  .filter(
                    ([, value]) =>
                      value !==
                      "All"
                  )
                  .map(
                    ([
                      label,
                      value,
                    ]) => (

                      <button
                        key={`${label}-${value}`}
                        type="button"
                        className="activeFilterChip"
                        onClick={() => {

                          if (
                            label ===
                            "Status"
                          )
                            setStatus(
                              "All"
                            );

                          if (
                            label ===
                            "Date"
                          )
                            setDate(
                              "All"
                            );

                          if (
                            label ===
                            "Slot"
                          )
                            setSlot(
                              "All"
                            );

                          if (
                            label ===
                            "Mode"
                          )
                            setMode(
                              "All"
                            );

                          if (
                            label ===
                            "Map"
                          )
                            setMap(
                              "All"
                            );

                        }}
                      >
                        {label}:{" "}
                        {value} ×
                      </button>

                    )
                  )}

                {[
                  status,
                  date,
                  slot,
                  mode,
                  map,
                ].every(
                  (v) =>
                    v ===
                    "All"
                ) && (
                  <span className="noActiveFilters">
                    All filters
                  </span>
                )}

              </div>

              {/* SEARCH + RESET */}

              <div className="filterActions">

                <div className="filterSearch">

                  <span>
                    ⌕
                  </span>

                  <input
                    value={
                      search
                    }
                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                    placeholder="Search tournament..."
                    aria-label="Search tournament"
                  />

                  {search && (
                    <button
                      type="button"
                      className="searchClear"
                      onClick={() =>
                        setSearch(
                          ""
                        )
                      }
                    >
                      ×
                    </button>
                  )}

                </div>

                <button
                  type="button"
                  className="compactReset"
                  onClick={
                    resetFilters
                  }
                >
                  RESET
                </button>

              </div>

            </div>

            {/* =================================================
                DATE
            ================================================= */}

            <div className="filterGroup">

              <label>
                DATE
              </label>

              <div className="filterScroll">

                <button
                  className={
                    date ===
                    "All"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setDate(
                      "All"
                    )
                  }
                >
                  ALL DATES
                </button>

                {dates.map(
                  (item) => (

                    <button
                      key={item}
                      className={
                        date ===
                        item
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setDate(
                          item
                        )
                      }
                    >
                      {formatDate(
                        item
                      )}
                    </button>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                TIME SLOT
                NO EXACT TIME
            ================================================= */}

            <div className="filterGroup">

              <label>
                TIME SLOT
              </label>

              <div className="slotGrid">

                {Object.entries(
                  TIME_SLOTS
                ).map(
                  ([
                    key,
                    label,
                  ]) => (

                    <button
                      key={key}
                      className={
                        slot ===
                        key
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setSlot(
                          key
                        )
                      }
                    >

                      <strong>
                        {key}
                      </strong>

                      <small>
                        {label}
                      </small>

                    </button>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                MODE
                DYNAMIC FROM SHEET
            ================================================= */}

            <div className="filterGroup">

              <label>
                MODE
              </label>

              <div className="smallFilterGrid">

                <button
                  className={
                    mode ===
                    "All"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setMode(
                      "All"
                    )
                  }
                >
                  ALL
                </button>

                {modes.map(
                  (item) => (

                    <button
                      key={item}
                      className={
                        mode ===
                        item
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setMode(
                          item
                        )
                      }
                    >
                      {item}
                    </button>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                MAP
                DYNAMIC FROM SHEET
            ================================================= */}

            <div className="filterGroup">

              <label>
                MAP
              </label>

              <div className="smallFilterGrid">

                <button
                  className={
                    map ===
                    "All"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setMap(
                      "All"
                    )
                  }
                >
                  ALL MAPS
                </button>

                {maps.map(
                  (item) => (

                    <button
                      key={item}
                      className={
                        map ===
                        item
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setMap(
                          item
                        )
                      }
                    >
                      {item}
                    </button>

                  )
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              RESULTS
          ================================================= */}

          <div className="resultsHeader">

            <div>

              <span>
                AVAILABLE MATCHES
              </span>

              <strong>
                {
                  filteredTournaments.length
                }{" "}
                TOURNAMENT
                {filteredTournaments.length !==
                  1 &&
                  "S"}
              </strong>

            </div>

            <span>
              {search
                ? `SEARCH: ${search}`
                : status ===
                  "All"
                ? "ALL MATCHES"
                : status.toUpperCase()}
            </span>

          </div>

          {/* =================================================
              CARDS
          ================================================= */}

          {filteredTournaments.length >
          0 ? (

            <div className="tournamentGrid">

              {filteredTournaments.map(
                (item) => (

                  <TournamentCard
                    key={
                      item.id
                    }
                    tournament={
                      item
                    }
                    game={
                      selectedGameData
                    }
                  />

                )
              )}

            </div>

          ) : (

            <div className="emptyState">

              <div>
                ⌁
              </div>

              <h3>
                NO MATCHES FOUND
              </h3>

              <p>
                Try changing
                your filters.
              </p>

              <button
                onClick={
                  resetFilters
                }
              >
                CLEAR FILTERS
              </button>

            </div>

          )}

        </section>
      )}

      <div className="tpNeonBottom" />

    </main>
  );
}

/* =========================================================
   TOURNAMENT CARD
========================================================= */

function TournamentCard({
  tournament,
  game,
}) {
  const status =
    normalizeStatus(
      tournament.status
    );

  const percentage =
    tournament.capacity >
    0
      ? Math.min(
          (tournament.joined /
            tournament.capacity) *
            100,
          100
        )
      : 0;

  const statusClass =
    status === "Live"
      ? "live"
      : status ===
        "Deciding"
      ? "deciding"
      : status ===
        "Past"
      ? "past"
      : "";

  /* Tournament image first.
     Game image fallback second. */

  const image =
    tournament.image ||
    game?.image ||
    "";

  return (
    <article
      className={`matchCard ${statusClass}`}
    >

      {/* =================================================
          16:9 IMAGE
      ================================================= */}

      <div className="matchImageWrap">

        {image ? (

          <img
            src={image}
            alt={
              tournament.title
            }
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={(e) => {

              const img =
                e.currentTarget;

              if (
                game?.image &&
                img.src !==
                  game.image
              ) {
                img.src =
                  game.image;
              } else {
                img.style.display =
                  "none";
              }

            }}
          />

        ) : (

          <div className="matchImageFallback">

            {game?.name
              ?.toLowerCase()
              .includes(
                "free"
              )
              ? "🔥"
              : "🎮"}

          </div>

        )}

        <div className="matchImageShade" />

      </div>

      {/* =================================================
          CARD HEADER
      ================================================= */}

      <div className="cardTop">

        <div>

          <span className="matchGame">
            {game?.name ||
              "TOURNAMENT"}
          </span>

          <h3>
            {
              tournament.title
            }
          </h3>

        </div>

        <span className="matchStatus">

          {status ===
            "Live" &&
            "● "}

          {status.toUpperCase()}

        </span>

      </div>

      {/* =================================================
          DETAILS
      ================================================= */}

      <div className="matchDetails">

        <div>
          <small>
            DATE
          </small>

          <strong>
            {formatDate(
              tournament.date,
              tournament.year
            )}
          </strong>
        </div>

        <div>
          <small>
            TIME
          </small>

          <strong>
            {tournament.time ||
              "—"}
          </strong>
        </div>

        <div>
          <small>
            MODE
          </small>

          <strong>
            {tournament.mode ||
              "—"}
          </strong>
        </div>

        <div>
          <small>
            MAP
          </small>

          <strong>
            {tournament.map ||
              "—"}
          </strong>
        </div>

      </div>

      {/* =================================================
          MONEY
      ================================================= */}

      <div className="rewardDetails">

        <div>
          <small>
            ENTRY
          </small>

          <strong>
            ₹
            {tournament.entry}
          </strong>
        </div>

        <div>
          <small>
            PER KILL
          </small>

          <strong>
            ₹
            {tournament.kill}
          </strong>
        </div>

        <div>
          <small>
            PRIZE POOL
          </small>

          <strong className="orangeText">
            ₹
            {tournament.prize}
          </strong>
        </div>

      </div>

      {/* =================================================
          PLAYERS
      ================================================= */}

      {tournament.capacity >
        0 && (

        <div className="players">

          <div>

            <span>
              PLAYERS
            </span>

            <strong>
              {
                tournament.joined
              }
              /
              {
                tournament.capacity
              }
            </strong>

          </div>

          <div className="progressBar">

            <span
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

        </div>

      )}

      {/* =================================================
          ACTION
      ================================================= */}

      {status ===
      "Past" ? (

        <button className="resultButton">
          VIEW RESULTS →
        </button>

      ) : status ===
        "Live" ? (

        <button className="liveButton">
          VIEW LIVE MATCH →
        </button>

      ) : status ===
        "Deciding" ? (

        <button className="decidingButton">
          VIEW RESULT STATUS →
        </button>

      ) : (

        <button className="joinButton">
          VIEW & JOIN →
        </button>

      )}

    </article>
  );
}

/* =========================================================
   AUTOMATIC SLOT FALLBACK
========================================================= */

function getSlotFromTime(
  value
) {
  const text = clean(
    value
  ).toUpperCase();

  if (!text)
    return "";

  let hour = 0;
  let minute = 0;

  const match12 =
    text.match(
      /^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/
    );

  if (match12) {
    hour =
      Number(
        match12[1]
      );

    minute =
      Number(
        match12[2] ||
          0
      );

    const period =
      match12[3];

    if (
      period === "AM" &&
      hour === 12
    ) {
      hour = 0;
    }

    if (
      period === "PM" &&
      hour !== 12
    ) {
      hour += 12;
    }
  } else {
    const match24 =
      text.match(
        /^(\d{1,2}):(\d{1,2})$/
      );

    if (!match24)
      return "";

    hour =
      Number(
        match24[1]
      );

    minute =
      Number(
        match24[2]
      );
  }

  const total =
    hour * 60 +
    minute;

  if (
    total >= 360 &&
    total < 720
  ) {
    return "Morning";
  }

  if (
    total >= 720 &&
    total < 960
  ) {
    return "Afternoon";
  }

  if (
    total >= 960 &&
    total < 1140
  ) {
    return "Evening";
  }

  return "Night";
}
