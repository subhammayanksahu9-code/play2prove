"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import "./tournaments.css";

/* =========================================================
   PLAY2PROVE — TOURNAMENT PAGE
   FAST + FILTERABLE + GOOGLE SHEET API
========================================================= */

const API_URL = "/api/tournaments";

/* =========================================================
   PLAY2PROVE — MASTER CLOCK CLIENT
   Cloudflare Server Time
   Browser Clock NOT trusted
========================================================= */

const MASTER_CLOCK = {
  serverTimestamp: Date.now(),
  performanceStart: null,
};

function setMasterClock(serverTimestamp) {

  const timestamp =
    Number(serverTimestamp);

  if (
    !Number.isFinite(timestamp)
  ) {
    return;
  }

  MASTER_CLOCK.serverTimestamp =
    timestamp;

  MASTER_CLOCK.performanceStart =
    performance.now();

}

/*
  Returns current time according to
  Cloudflare Master Clock.
*/

function getMasterNow() {

  if (
    MASTER_CLOCK.performanceStart ===
    null
  ) {
    return Date.now();
  }

  return (
    MASTER_CLOCK.serverTimestamp +
    (
      performance.now() -
      MASTER_CLOCK.performanceStart
    )
  );

}

const CACHE_KEY =
  "play2prove_tournaments_v5";

const CACHE_MAX_AGE =
  5 * 60 * 1000;

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

  const v =
    String(value ?? "")
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

  return String(
    value ?? ""
  ).trim();

}

function normalizeStatus(value) {

  const v =
    clean(value)
      .toLowerCase()
      .replace(/_/g, " ");

  if (
    v === "upcoming"
  ) {
    return "Upcoming";
  }

  if (
    v === "starting soon" ||
    v === "starting"
  ) {
    return "Starting Soon";
  }

  if (
    v === "live"
  ) {
    return "Live";
  }

  if (
    v === "match ongoing" ||
    v === "ongoing"
  ) {
    return "Match Ongoing";
  }

  if (
    v === "match closing" ||
    v === "match finishing"
  ) {
    return "Match Closing";
  }

  if (
    v === "calculation ongoing" ||
    v === "calculation pending"
  ) {
    return "Calculation Ongoing";
  }

  if (
    v === "past" ||
    v === "completed"
  ) {
    return "Past";
  }

  /*
    Deciding is GAME-level status only.
    Tournament does not use it.
  */

  return "Upcoming";

}

/* =========================================================
   RELIABLE TOURNAMENT START TIME
   DATE + TIME are treated as IST.
========================================================= */

function parseTournamentStartTimestamp(
  dateValue,
  timeValue,
  yearValue
) {

  const dateText =
    clean(dateValue);

  const timeText =
    clean(timeValue);

  if (
    !dateText ||
    !timeText
  ) {
    return null;
  }

  const dateMatch =
  dateText.match(
    /^(\d{1,2})(?:\s+|-)([A-Za-z]{3,9})(?:\s+|-)(\d{2}|\d{4})$/
  )
  ||
  dateText.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?$/
  );

  if (!dateMatch) {
    return null;
  }

  const day =
    Number(dateMatch[1]);

  const monthText =
    dateMatch[2]
      .slice(0, 3)
      .toLowerCase();

  const months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const month =
    months[monthText];

  if (
    !Number.isFinite(month)
  ) {
    return null;
  }

  let year =
  Number(dateMatch[3]) ||
  Number(yearValue) ||
  new Date().getFullYear();

if (year < 100) {
  year += 2000;
}

  const timeMatch =
    timeText
      .toUpperCase()
      .match(
        /^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/
      );

  if (!timeMatch) {
    return null;
  }

  let hour =
    Number(timeMatch[1]);

  const minute =
    Number(
      timeMatch[2] || 0
    );

  const period =
    timeMatch[3];

  if (
    hour < 1 ||
    hour > 12 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

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

  /*
    Convert IST date/time to
    absolute UTC timestamp.
  */

  return (
    Date.UTC(
      year,
      month,
      day,
      hour,
      minute,
      0,
      0
    ) -
    (
      5 * 60 +
      30
    ) *
      60 *
      1000
  );

}

function getTournamentStartTimestamp(
  tournament
) {

  const backendTimestamp =
    Number(
      tournament?.startTimestamp
    );

  const parsedTimestamp =
    parseTournamentStartTimestamp(
      tournament?.date,
      tournament?.time,
      tournament?.year
    );

  /*
    If backend timestamp and
    displayed Date + Time agree,
    use backend timestamp.

    If they disagree significantly,
    trust the displayed tournament
    Date + Time.
  */

  if (
    Number.isFinite(
      backendTimestamp
    ) &&
    Number.isFinite(
      parsedTimestamp
    )
  ) {

    const difference =
      Math.abs(
        backendTimestamp -
        parsedTimestamp
      );

    if (
      difference <=
      2 * 60 * 1000
    ) {
      return backendTimestamp;
    }

    return parsedTimestamp;

  }

  if (
    Number.isFinite(
      backendTimestamp
    )
  ) {
    return backendTimestamp;
  }

  return Number.isFinite(
    parsedTimestamp
  )
    ? parsedTimestamp
    : null;

}

/* =========================================================
   AUTOMATIC TOURNAMENT STATUS
========================================================= */

function getTournamentAutomaticStatus(
  tournament,
  now
) {

  const start =
    getTournamentStartTimestamp(
      tournament
    );

  if (
    !Number.isFinite(start)
  ) {

    return normalizeStatus(
      tournament?.status
    );

  }

  const STARTING_SOON =
    10 * 60 * 1000;

  const LIVE =
    10 * 60 * 1000;

  const MATCH_ONGOING =
    30 * 60 * 1000;

  const MATCH_CLOSING =
    5 * 60 * 1000;

  if (
    now <
    start -
      STARTING_SOON
  ) {

    return "Upcoming";

  }

  if (
    now <
    start
  ) {

    return "Starting Soon";

  }

  if (
    now <
    start +
      LIVE
  ) {

    return "Live";

  }

  if (
    now <
    start +
      LIVE +
      MATCH_ONGOING
  ) {

    return "Match Ongoing";

  }

  if (
    now <
    start +
      LIVE +
      MATCH_ONGOING +
      MATCH_CLOSING
  ) {

    return "Match Closing";

  }

  const calculation =
    clean(
      tournament?.calculationStatus
    ).toLowerCase();

  if (
    calculation ===
      "completed" ||
    calculation ===
      "complete" ||
    calculation ===
      "done"
  ) {

    return "Past";

  }

  return "Calculation Ongoing";

}

function statusClass(status) {

  const value =
    normalizeStatus(status)
      .toLowerCase();

  if (
    value === "upcoming"
  ) {
    return "upcoming";
  }

  if (
    value === "starting soon"
  ) {
    return "startingSoon";
  }

  if (
    value === "live"
  ) {
    return "live";
  }

  if (
    value === "match ongoing"
  ) {
    return "matchOngoing";
  }

  if (
    value === "match closing"
  ) {
    return "matchClosing";
  }

  if (
    value ===
    "calculation ongoing"
  ) {
    return "calculationOngoing";
  }

  if (
    value === "past"
  ) {
    return "past";
  }

  return "";

}

function numberValue(value) {

  const cleaned =
    String(value ?? "")
      .replace(
        /[₹,\s]/g,
        ""
      )
      .trim();

  const n =
    Number(cleaned);

  return Number.isFinite(n)
    ? n
    : 0;

}

/* =========================================================
   DATE NORMALIZATION
========================================================= */

function normalizeDate(value) {

  return clean(value)
    .replace(
      /\s+/g,
      " "
    );

}

function formatDate(
  value,
  year = ""
) {

  const raw =
    normalizeDate(value);

  if (!raw)
    return "—";

  if (
    /^\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{4})?$/
      .test(raw)
  ) {

    return raw;

  }

  const slash =
    raw.match(
      /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
    );

  if (slash) {

    const day =
      Number(slash[1]);

    const month =
      Number(slash[2]) - 1;

    const yr =
      Number(slash[3]);

    const d =
      new Date(
        yr,
        month,
        day
      );

    if (
      !Number.isNaN(
        d.getTime()
      )
    ) {

      return d.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      );

    }

  }

  const candidate =
    year
      ? `${raw} ${year}`
      : raw;

  const d =
    new Date(candidate);

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {

    return raw;

  }

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );

}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TournamentsPage() {
  useEffect(() => {
  if (
    typeof window !== "undefined" &&
    window.location.pathname === "/tournaments" &&
    !window.location.search
  ) {
    window.location.replace(
      "/all-tournaments"
    );
  }
}, []);
  

  const [games, setGames] =
    useState([]);

  const [tournaments, setTournaments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedGame, setSelectedGame] =
    useState(null);
  
  const [allTournamentsMode, setAllTournamentsMode] =
  useState(false);

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [status, setStatus] =
    useState("All");

  const [date, setDate] =
    useState("All");

  const [slot, setSlot] =
    useState("All");

  const [mode, setMode] =
    useState("All");

  const [map, setMap] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [clockTick, setClockTick] =
    useState(0);
  const isFetchingRef = 
    useRef(false);
  const hasLoadedCacheRef =
  useRef(false);

  useEffect(() => {

    const timer =
      setInterval(() => {

        setClockTick(
          value =>
            value + 1
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  /* =======================================================
     FETCH ALL DATA — ONE REQUEST
  ======================================================= */

  useEffect(() => {

    let cancelled = false;

    function normalizeGame(
      row,
      index
    ) {

      const name =
        clean(
          row?.gameName ??
          row?.game ??
          row?.name
        );

      return {

        id:
          slugify(name) ||
          `game-${index + 1}`,

        name:
          name ||
          "GAME",

        image:
          clean(
            row?.image ??
            row?.imageUrl ??
            row?.["Image URL"]
          ),

        status:
          normalizeStatus(
            row?.status
          ),

        publish:
          isTrue(
            row?.publish
          ),

        device:
          clean(
            row?.device
          ) ||
          "MOBILE + PC",

      };

    }

    function normalizeTournament(
      row,
      index
    ) {

      const gameName =
        clean(
          row?.game ??
          row?.gameName
        );

      const tournamentImage =
        clean(
          row?.image ??
          row?.imageUrl ??
          row?.["Image URL"]
        );

      return {

        id:
          clean(row?.id) ||
          `${slugify(gameName)}-${slugify(
            row?.date
          )}-${slugify(
            row?.time
          )}-${index}`,

        game:
          slugify(gameName),

        title:
          clean(
            row?.tournamentName ??
            row?.title ??
            row?.name
          ) ||
          "Tournament",

        date:
          normalizeDate(
            row?.date
          ),

        year:
          clean(
            row?.year
          ),

        time:
          clean(
            row?.time
          ),

        slot:
          clean(
            row?.slot
          ) ||
          getSlotFromTime(
            row?.time
          ),

        mode:
          clean(
            row?.mode
          ),

        map:
          clean(
            row?.map
          ),

        image:
          tournamentImage,

        entry:
          numberValue(
            row?.entryFee ??
            row?.entry
          ),

        kill:
          numberValue(
            row?.perKill ??
            row?.kill
          ),

        prize:
          numberValue(
            row?.prizePool ??
            row?.prize
          ),

        status:
          normalizeStatus(
            row?.status
          ),

        startTimestamp:
          Number(
            row?.startTimestamp
          ) || null,

        serverTimestamp:
          Number(
            row?.serverTimestamp
          ) || null,

        calculationStatus:
          clean(
            row?.calculationStatus ??
            row?.[
              "Calculation Status"
            ]
          ) ||
          "Pending",

        calculationReason:
          clean(
            row?.calculationReason ??
            row?.[
              "Calculation Reason"
            ]
          ),

        publish:
          row?.publish ===
            undefined
            ? true
            : isTrue(
                row?.publish
              ),

        joined:
  Number(
    row?.joined ??
    row?.registeredPlayers ??
    0
  ),

capacity:
  Number(
    row?.slotsOfMode ??
    row?.capacity ??
    row?.maxPlayers ??
    0
  ),

      };

    }

    function applyData(data) {

      const gameRows =
        Array.isArray(data)
          ? data
          : Array.isArray(
              data?.games
            )
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
          .map(
            normalizeGame
          )
          .filter(
            game =>
              game.name &&
              game.publish
          );

      const nextTournaments =
        tournamentRows
          .map(
            normalizeTournament
          )
          .filter(
            item =>
              item.game &&
              item.publish
          );

      if (!cancelled) {

        setGames(
          nextGames
        );

        setTournaments(
          nextTournaments
        );

        setLoading(
          false
        );

        setError("");

      }

      return {
        nextGames,
        nextTournaments,
      };

    }

    async function fetchData() {

  if (isFetchingRef.current) {
    return;
  }

  isFetchingRef.current = true;

  let hasUsableCache = false;

  const useCache =
    !hasLoadedCacheRef.current;

  try {

    /* =====================================================
       1. INSTANT CACHE — ONLY ON FIRST LOAD
    ===================================================== */

    if (useCache) {

      try {

        const saved =
          JSON.parse(
            localStorage.getItem(
              CACHE_KEY
            ) || "null"
          );

        if (saved?.data) {

          const age =
            Date.now() -
            Number(
              saved.savedAt || 0
            );

          applyData(
            saved.data
          );

          hasUsableCache = true;

          hasLoadedCacheRef.current = true;

          if (
            age >= 0 &&
            age < CACHE_MAX_AGE
          ) {

            setLoading(false);

          }

        }

      } catch (cacheError) {

        console.warn(
          "PLAY2PROVE CACHE READ:",
          cacheError
        );

      }

    }


    /* =====================================================
       2. BACKGROUND API REFRESH
    ===================================================== */

    if (cancelled) {
      return;
    }

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => {
          controller.abort();
        },
        5000
      );

    try {

      const response =
        await fetch(
          API_URL,
          {
            method: "GET",

            signal:
              controller.signal,

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",

            redirect: "follow",
          }
        );

      if (!response.ok) {

        throw new Error(
          `API ${response.status}`
        );

      }

      const data =
        await response.json();


      /* ==================================================
         MASTER CLOCK
      ================================================== */

      if (
        Number.isFinite(
          Number(
            data?.serverTimestamp
          )
        )
      ) {

        setMasterClock(
          Number(
            data.serverTimestamp
          )
        );

      }


      if (
        !data ||
        data.success === false
      ) {

        throw new Error(
          "Invalid API response"
        );

      }


      if (cancelled) {
        return;
      }


      /* ==================================================
         UPDATE DATA
         
         IMPORTANT:
         NO window.scrollTo()
      ================================================== */

      applyData(data);


      /* ==================================================
         SAVE FRESH DATA
      ================================================== */

      try {

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            savedAt:
              Date.now(),
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

      if (
        !cancelled
      ) {

        setLoading(false);

        if (
          !hasUsableCache
        ) {

          setError(
            "Unable to load games right now."
          );

        }

      }

    } finally {

      clearTimeout(
        timeout
      );

    }

  } finally {

    isFetchingRef.current =
      false;

  }

    }

    fetchData();

    const refreshTimer =
      setInterval(
        () => {
          fetchData();
        },
        10000
      );

    return () => {

      cancelled = true;

      clearInterval(
        refreshTimer
      );

    };

  }, []);
  /* =======================================================
     OPEN SPECIFIC GAME FROM HOME
     IMPORTANT:
     This runs only ONCE for ?game=
     It will NOT jump to top on every 10-sec refresh.
  ======================================================= */

  const autoOpenedGameRef = useRef(false);

useEffect(() => {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const gameSlug =
    params.get("game");

  const allMode =
    params.get("all") === "true";

  /* =========================================
     ALL TOURNAMENTS MODE
  ========================================= */

  if (allMode) {
    setAllTournamentsMode(true);
    setSelectedGame(null);

    setStatus("All");
    setDate("All");
    setSlot("All");
    setMode("All");
    setMap("All");
    setSearch("");

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    return;
  }

  /* =========================================
     SPECIFIC GAME MODE
  ========================================= */

  if (
    autoOpenedGameRef.current ||
    !gameSlug ||
    games.length === 0
  ) {
    return;
  }

  const matchedGame =
    games.find(
      (game) =>
        game.id === gameSlug
    );

  if (!matchedGame) {
    return;
  }

  autoOpenedGameRef.current = true;

  setAllTournamentsMode(false);

  setSelectedGame(
    matchedGame.id
  );

  setStatus("All");
  setDate("All");
  setSlot("All");
  setMode("All");
  setMap("All");
  setSearch("");

  window.scrollTo({
    top: 0,
    behavior: "auto",
  });

}, [games]);


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

    /* ALL TOURNAMENTS */

    if (allTournamentsMode) {
      return tournaments;
    }

    /* SPECIFIC GAME */

    if (!selectedGame) {
      return [];
    }

    return tournaments.filter(
      (item) =>
        item.game === selectedGame
    );

  }, [
    tournaments,
    selectedGame,
    allTournamentsMode,
  ]);


  /* =======================================================
     DYNAMIC DATES
  ======================================================= */

  const dates =
    useMemo(() => {

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

  const modes =
    useMemo(() => {

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

  const maps =
    useMemo(() => {

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
     
     IMPORTANT:
     Tournament status is NOT taken from
     Google Sheet Status column.

     It is calculated from:
     
       Cloudflare Master Clock
              +
       Tournament Date + Time
     
     Therefore:
     
       Future → Upcoming
       10 min before → Starting Soon
       Start → Live
       +10 min → Match Ongoing
       +40 min → Match Closing
       +45 min → Calculation Ongoing
       Completed → Past
  ======================================================= */

  const filteredTournaments =
  useMemo(() => {

    if (
      !selectedGame &&
      !allTournamentsMode
    ) {
      return [];
    }

    const query =
      search
        .trim()
        .toLowerCase();

    return gameTournaments.filter(
      (item) => {

        const itemStatus =
  getTournamentAutomaticStatus(
    item,
    getMasterNow()
  );

        if (
          status === "All"
        ) {

          if (
            itemStatus === "Past"
          ) {
            return false;
          }

        }

        if (
          status === "Upcoming"
        ) {

          if (
            ![
              "Upcoming",
              "Starting Soon",
            ].includes(
              itemStatus
            )
          ) {
            return false;
          }

        }

        if (
          status === "Live"
        ) {

          if (
            ![
              "Live",
              "Match Ongoing",
              "Match Closing",
            ].includes(
              itemStatus
            )
          ) {
            return false;
          }

        }

        if (
          status === "Past"
        ) {

          if (
            itemStatus !== "Past"
          ) {
            return false;
          }

        }

        if (
          date !== "All" &&
          item.date !== date
        ) {
          return false;
        }

        if (
          slot !== "All" &&
          clean(item.slot).toLowerCase() !==
            clean(slot).toLowerCase()
        ) {
          return false;
        }

        if (
          mode !== "All" &&
          clean(item.mode).toLowerCase() !==
            clean(mode).toLowerCase()
        ) {
          return false;
        }

        if (
          map !== "All" &&
          clean(item.map).toLowerCase() !==
            clean(map).toLowerCase()
        ) {
          return false;
        }

        if (query) {

          const searchable = [
            item.title,
            item.game,
            item.map,
            item.mode,
            item.time,
            item.date,
            item.status,
          ]
            .join(" ")
            .toLowerCase();

          if (
            !searchable.includes(query)
          ) {
            return false;
          }

        }

        return true;

      }
    );

  }, [
    gameTournaments,
    status,
    date,
    slot,
    mode,
    map,
    search,
    clockTick,
    allTournamentsMode,
  ]);


  /* =======================================================
     FILTER RESET
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
     GAME SELECT
  ======================================================= */

  function handleGameSelect(
    gameId
  ) {

    setSelectedGame(
      gameId
    );

    resetFilters();

  }


  /* =======================================================
     BACK TO GAME LIST
  ======================================================= */

  function handleBackToGames() {

    setSelectedGame(
      null
    );

    resetFilters();

    /*
      Back to game selection
      intentionally moves to top.
    */

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (
    loading &&
    games.length === 0
  ) {

    return (

      <main
        className="tournamentPage"
      >

        <div
          className="pageLoader"
        >

          <div
            className="loadingSpinner"
          />

          <strong>
            LOADING PLAY2PROVE
          </strong>

          <span>
            Connecting to tournament
            servers…
          </span>

        </div>

      </main>

    );

  }


  /* =======================================================
     ERROR SCREEN
  ======================================================= */

  if (
    error &&
    games.length === 0
  ) {

    return (

      <main
        className="tournamentPage"
      >

        <div
          className="errorState"
        >

          <div>
            ⚠
          </div>

          <h3>
            TEMPORARILY UNAVAILABLE
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

      </main>

    );

  }


  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (

    <main
      className="tournamentPage"
    >

      {/* ===================================================
          TOP NEON
      =================================================== */}

      <div
        className="tpNeonTop"
      />


      {/* ===================================================
          GAME SELECTION
      =================================================== */}

      {!selectedGame && !allTournamentsMode ? (

        <section
          className="gameSelection"
        >

          <div
            className="selectionIntro"
          >

            <span>
              CHOOSE YOUR BATTLE
            </span>

            <h1>
              SELECT{" "}
              <em>
                GAME
              </em>
            </h1>

            <p>
              Pick your game and
              enter its tournament
              arena.
            </p>

          </div>


          {games.length > 0 ? (

            <div
              className="gameCards"
            >

              {games.map(
                (
                  game,
                  index
                ) => (

                  <button
                    className="gameSelectCard"
                    key={game.id}
                    onClick={() =>
                      handleGameSelect(
                        game.id
                      )
                    }
                  >

                    {/* =====================================
                        GAME NAME
                    ===================================== */}

                    <div
                      className="gameCardName"
                    >

                      <span>
                        {game.name}
                      </span>

                      <b>
                        ENTER ARENA →
                      </b>

                    </div>


                    {/* =====================================
                        GAME IMAGE
                    ===================================== */}

                    <div
                      className="gameImage"
                    >

                      {game.image ? (

                        <img
                          src={game.image}
                          alt={game.name}
                          loading={
                            index < 2
                              ? "eager"
                              : "lazy"
                          }
                          decoding="async"
                          fetchPriority={
                            index < 2
                              ? "high"
                              : "auto"
                          }
                        />

                      ) : (

                        <div
                          className="imageFallback"
                        >
                          🎮
                        </div>

                      )}

                      <div
                        className="imageOverlay"
                      />

                    </div>


                    {/* =====================================
                        GAME STATUS
                    ===================================== */}

                    <div
                      className="gameCardBottom"
                    >

                      <span>
                        📱{" "}
                        {
                          game.device ||
                          "MOBILE + PC"
                        }
                      </span>

                      <span
                        className={
                          statusClass(
                            game.status
                          )
                        }
                      >

                        ●{" "}
                        {
                          normalizeStatus(
                            game.status
                          ).toUpperCase()
                        }

                      </span>

                    </div>

                  </button>

                )
              )}

            </div>

          ) : (

            <div
              className="comingSoon"
            >

              <div
                className="comingGlow"
              >
                🎮
              </div>

              <span>
                GAME ARENA
              </span>

              <h2>
                COMING SOON
              </h2>

              <p>
                No published games
                are available yet.
              </p>

            </div>

          )}

        </section>

            ) : null}


      {/* ===================================================
          TOURNAMENT SECTION
      =================================================== */}

      {(selectedGame || allTournamentsMode) && (

        <section
          className="tournamentSection"
        >

          {/* ===============================================
              BACK BUTTON
          =============================================== */}

         <div className="tournamentNavButtons">

  <button
    className="arenaNavButton"
    onClick={() => {
      window.location.href = "/";
    }}
  >
    <span className="navArrow">←</span>
    <span>HOME</span>
  </button>

  <button
    className="arenaNavButton"
    onClick={() => {
      window.location.href = "/games";
    }}
  >
    <span className="navArrow">←</span>
    <span>ALL GAMES</span>
  </button>

</div>


          {/* ===============================================
              GAME HEADER
          =============================================== */}

          <div
            className="tournamentHeader"
          >

            <div>

              <span>
                {
                  selectedGameData?.name ||
                  "TOURNAMENT"
                }
              </span>

              <h1>
  {
    selectedGameData
      ? selectedGameData.name
      : "ALL TOURNAMENTS"
  }
</h1>

<p>
  {
    selectedGameData
      ? "Choose your match and enter the battle."
      : "Explore every tournament across the Play2Prove arena."
  }
</p>

            </div>

          </div>


          {/* ===============================================
              FILTER AREA
          =============================================== */}

          <section
            className="filterPanel"
          >

            {/* STATUS */}

            <div
              className="filterGroup"
            >

              <label>
                STATUS
              </label>

              <div
                className="compactFilters"
              >

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
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setStatus(
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


            {/* DATE */}

            <div
              className="filterGroup"
            >

              <label>
                DATE
              </label>

              <div
                className="compactFilters"
              >

                <button
                  className={
                    date === "All"
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
                        date === item
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


            {/* TIME SLOT */}

            <div
              className="filterGroup"
            >

              <label>
                TIME SLOT
              </label>

              <div
                className="slotGrid"
              >

                {Object.entries(
                  TIME_SLOTS
                ).map(
                  (
                    [
                      key,
                      range,
                    ]
                  ) => (

                    <button
                      key={key}
                      className={
                        slot === key
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
                        {range}
                      </small>

                    </button>

                  )
                )}

              </div>

            </div>


            {/* MODE */}

            <div
              className="filterGroup"
            >

              <label>
                MODE
              </label>

              <div
                className="compactFilters"
              >

                <button
                  className={
                    mode === "All"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setMode(
                      "All"
                    )
                  }
                >

                  ALL MODES

                </button>


                {modes.map(
                  (item) => (

                    <button
                      key={item}
                      className={
                        mode === item
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


            {/* MAP */}

            <div
              className="filterGroup"
            >

              <label>
                MAP
              </label>

              <div
                className="compactFilters scrollFilters"
              >

                <button
                  className={
                    map === "All"
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
                        map === item
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


          </section>


          {/* ===============================================
              RESULTS HEADER
          =============================================== */}

          <div
            className="resultsHeader"
          >

            <div>

              <span>
                AVAILABLE MATCHES
              </span>

              <strong>

                {
                  filteredTournaments.length
                }{" "}

                TOURNAMENT
                {
                  filteredTournaments.length !==
                  1
                    ? "S"
                    : ""
                }

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


          {/* ===============================================
              TOURNAMENT RESULTS
          =============================================== */}

          {filteredTournaments.length >
          0 ? (

            <div
              className="tournamentGrid"
            >

              {filteredTournaments.map(
                (item) => (

                  <TournamentCard
  key={item.id}
  tournament={item}
  game={
    selectedGameData ||
    games.find(
      (g) =>
        g.id === item.game
    )
  }
/>

                )
              )}

            </div>

          ) : (

            <div
              className="emptyState"
            >

              <div>
                ⌁
              </div>

              <h3>
                NO MATCHES FOUND
              </h3>

              <p>
                Try changing your
                filters to find
                available tournaments.
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


      {/* ===================================================
          BOTTOM NEON
      =================================================== */}

      <div
        className="tpNeonBottom"
      />

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

  /* =======================================================
     REFRESH CARD EVERY SECOND
     TIME STILL COMES FROM MASTER CLOCK
  ======================================================= */

  const [, setClockTick] =
    useState(0);

  useEffect(() => {

    const timer =
      setInterval(() => {

        setClockTick(
          value => value + 1
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);


  /* =======================================================
     MASTER STATUS
  ======================================================= */

  const masterNow =
  getMasterNow();

/*
  Google Sheet / Apps Script API
  is the single source of truth
  for tournament status.
*/
const automaticStatus =
  getTournamentAutomaticStatus(
    tournament,
    masterNow
  );

const status =
  automaticStatus;


  const cardStatusClass =
    statusClass(
      automaticStatus
    );


  /* =======================================================
     PLAYER %
  ======================================================= */

  const joined =
    Number(
      tournament.joined
    ) || 0;

  const capacity =
    Number(
      tournament.capacity
    ) || 0;

  const left =
    Math.max(
      capacity - joined,
      0
    );

  const percentage =
    capacity > 0
      ? Math.min(
          (joined / capacity) * 100,
          100
        )
      : 0;


  /* =======================================================
     IMAGE
  ======================================================= */

  const image =
    tournament.image ||
    game?.image ||
    "";


  /* =======================================================
     MASTER TOURNAMENT START
  ======================================================= */

  const tournamentStart =
    getTournamentStartTimestamp(
      tournament
    );


  /* =======================================================
     UPCOMING COUNTDOWN
  ======================================================= */

  let matchBeginsSecondsLeft =
    0;

  if (
    automaticStatus ===
      "Upcoming" ||
    automaticStatus ===
      "Starting Soon"
  ) {

    if (
      Number.isFinite(
        tournamentStart
      )
    ) {

      matchBeginsSecondsLeft =
        Math.max(
          0,
          Math.ceil(
            (
              tournamentStart -
              masterNow
            ) / 1000
          )
        );

    }

  }


  /* =======================================================
     LIVE 10-MINUTE JOIN WINDOW
  ======================================================= */

  let joinSecondsLeft =
    0;

  if (
    automaticStatus ===
      "Live" &&
    Number.isFinite(
      tournamentStart
    )
  ) {

    joinSecondsLeft =
      Math.max(
        0,
        Math.ceil(
          (
            tournamentStart +
            10 * 60 * 1000 -
            masterNow
          ) / 1000
        )
      );

  }


  /* =======================================================
     UPCOMING TIMER FORMAT

     Example:
     1D 01HR:23MIN:45SEC
  ======================================================= */

  function formatMatchBeginsTimer(
    totalSeconds
  ) {

    const safe =
      Math.max(
        0,
        Number(
          totalSeconds
        ) || 0
      );

    const days =
      Math.floor(
        safe / 86400
      );

    const hours =
      Math.floor(
        (safe % 86400) /
        3600
      );

    const minutes =
      Math.floor(
        (safe % 3600) /
        60
      );

    const seconds =
      safe % 60;

    return (
      `${days}D ` +
      `${String(hours).padStart(2, "0")}HR:` +
      `${String(minutes).padStart(2, "0")}MIN:` +
      `${String(seconds).padStart(2, "0")}SEC`
    );

  }


  /* =======================================================
     LIVE JOIN TIMER

     Example:
     09:59
  ======================================================= */

  function formatJoinTimer(
    totalSeconds
  ) {

    const safe =
      Math.max(
        0,
        Number(
          totalSeconds
        ) || 0
      );

    const minutes =
      Math.floor(
        safe / 60
      );

    const seconds =
      safe % 60;

    return (
      `${String(
        minutes
      ).padStart(2, "0")}:` +
      `${String(
        seconds
      ).padStart(2, "0")}`
    );

  }


  /* =======================================================
     CARD
  ======================================================= */

  return (

    <article
      className={
        `matchCard ${cardStatusClass}`
      }
    >

      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="matchImageWrap"
      >

        {image ? (

          <img
            src={image}
            alt={
              tournament.title
            }
            loading="lazy"
            decoding="async"
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

          <div
            className="matchImageFallback"
          >
            🎮
          </div>

        )}

        <div
          className="matchImageShade"
        />

      </div>


      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="cardTop"
      >

        <div>

          <span
            className="matchGame"
          >
            {
              game?.name ||
              "TOURNAMENT"
            }
          </span>

          <h3>
            {
              tournament.title
            }
          </h3>

        </div>


        <span
          className="matchStatus"
        >

          {automaticStatus ===
            "Live" &&
            "● "}

          {
            status.toUpperCase()
          }

        </span>

      </div>


      {/* =================================================
          LIVE JOIN STRIP

          ONLY DURING 10-MINUTE LIVE WINDOW
      ================================================= */}

      {automaticStatus === "Live" && (
  <div className="liveCountdown">

    <span className="joinMatchText">
      JOIN MATCH
    </span>

    <strong className="joinTimer">
      {formatJoinTimer(joinSecondsLeft)}
    </strong>

    <span className="joinBeforeText">
      BEFORE TIMER ENDS
    </span>

  </div>
)}


      {/* =================================================
          DATE / TIME / MODE / MAP
      ================================================= */}

      <div
        className="matchDetails"
      >

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
            {
              tournament.time ||
              "—"
            }
          </strong>

        </div>


        <div>

          <small>
            MODE
          </small>

          <strong>
            {
              tournament.mode ||
              "—"
            }
          </strong>

        </div>


        <div>

          <small>
            MAP
          </small>

          <strong>
            {
              tournament.map ||
              "—"
            }
          </strong>

        </div>

      </div>


      {/* =================================================
          ENTRY / KILL / PRIZE
      ================================================= */}

      <div
        className="rewardDetails"
      >

        <div>

          <small>
            ENTRY
          </small>

          <strong>
            ₹
            {
              tournament.entry
            }
          </strong>

        </div>


        <div>

          <small>
            PER KILL
          </small>

          <strong>
            ₹
            {
              tournament.kill
            }
          </strong>

        </div>


        <div>

          <small>
            PRIZE POOL
          </small>

          <strong
            className="orangeText"
          >
            ₹
            {
              tournament.prize
            }
          </strong>

        </div>

           </div>


      {/* =================================================
          PLAYERS + PROGRESS + UPCOMING COUNTDOWN
      ================================================= */}

      {capacity > 0 && (

        <div className="players">

          <div className="playersRow">

            <div className="playersInfo">

              <span>
                PLAYERS
              </span>

              <strong>
                {joined}/{capacity}
              </strong>

            </div>

            <strong className="slotsLeft">
              {left} LEFT
            </strong>

          </div>


          <div className="progressBar">

            <span
              style={{
                width:
                  `${percentage}%`,
              }}
            />

          </div>


          {(
            automaticStatus === "Upcoming" ||
            automaticStatus === "Starting Soon"
          ) &&
            matchBeginsSecondsLeft > 0 && (

            <div className="matchBeginsCountdown">

              <span>
                MATCH BEGINS IN
              </span>

              <strong>
                {
                  formatMatchBeginsTimer(
                    matchBeginsSecondsLeft
                  )
                }
              </strong>

            </div>

          )}

        </div>

      )}


      {/* =================================================
          ACTION
      ================================================= */}

      {
        automaticStatus === "Past" &&
        tournament.calculationStatus
          ?.toLowerCase() === "completed" ? (

          <button className="resultButton">
            CHECK MATCH RESULTS →
          </button>

        ) : automaticStatus === "Calculation Ongoing" ? (

          <div className="statusAction calculationAction">
            CALCULATION ONGOING
          </div>

        ) : automaticStatus === "Match Closing" ? (

          <div className="statusAction closingAction">
            MATCH CLOSING
          </div>

        ) : automaticStatus === "Match Ongoing" ? (

          <div className="statusAction ongoingAction">
            MATCH ONGOING
          </div>

        ) : (

          <button
  className={
    automaticStatus === "Live"
      ? "liveButton"
      : "joinButton"
  }
  onClick={() => {
    window.location.href =
      `/tournaments/${encodeURIComponent(tournament.id)}`;
  }}
>
  VIEW & JOIN →
</button>

        )
      }
    </article>
  );
}
      

/* =========================================================
   AUTOMATIC SLOT FALLBACK
========================================================= */

function getSlotFromTime(
  value
) {

  const text =
    clean(value)
      .toUpperCase();


  if (!text) {
    return "";
  }


  let hour = 0;
  let minute = 0;


  /* =======================================================
     12-HOUR FORMAT
     Example: 7:25 PM
  ======================================================= */

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

    /* =====================================================
       24-HOUR FORMAT
       Example: 19:25
    ===================================================== */

    const match24 =
      text.match(
        /^(\d{1,2}):(\d{1,2})$/
      );


    if (!match24) {
      return "";
    }


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
