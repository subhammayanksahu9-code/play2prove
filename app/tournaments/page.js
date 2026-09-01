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
  =
