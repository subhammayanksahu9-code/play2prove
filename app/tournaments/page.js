"use client";

import { useEffect, useMemo, useState } from "react";
import "./tournaments.css";

/* =========================================================
   GOOGLE SHEETS / APPS SCRIPT API
========================================================= */

const GAMES_API =
  "https://script.google.com/macros/s/AKfycbx3vZuDmwpqykeX45oWhNffRqySbFQZ6a5ZukM3KEhB6B5e8I6rzWBmg8tsm_zUNz0/exec";


/* =========================================================
   TEMP TOURNAMENT DATA
   -----------------------------------------
   Games will come from Google Sheet.
   Tournament data will be connected separately.
========================================================= */

const tournaments = [
  {
    id: 1,
    game: "free-fire",
    title: "Bermuda Solo #01",
    map: "Bermuda",
    mode: "Solo",
    date: "2026-08-12",
    time: "06:00 PM",
    slot: "Evening",
    status: "Upcoming",
    entry: 30,
    kill: 5,
    prize: 500,
    joined: 37,
    capacity: 48,
  },
  {
    id: 2,
    game: "free-fire",
    title: "Bermuda Squad Clash",
    map: "Bermuda",
    mode: "Squad",
    date: "2026-08-12",
    time: "08:00 PM",
    slot: "Night",
    status: "Upcoming",
    entry: 100,
    kill: 10,
    prize: 1500,
    joined: 8,
    capacity: 12,
  },
  {
    id: 3,
    game: "free-fire",
    title: "Purgatory Solo #04",
    map: "Purgatory",
    mode: "Solo",
    date: "2026-08-12",
    time: "04:00 PM",
    slot: "Evening",
    status: "Live",
    entry: 30,
    kill: 5,
    prize: 500,
    joined: 48,
    capacity: 48,
  },
  {
    id: 4,
    game: "free-fire",
    title: "Kalahari Solo #02",
    map: "Kalahari",
    mode: "Solo",
    date: "2026-08-11",
    time: "09:00 PM",
    slot: "Night",
    status: "Deciding",
    entry: 50,
    kill: 5,
    prize: 800,
    joined: 48,
    capacity: 48,
  },
  {
    id: 5,
    game: "free-fire",
    title: "Bermuda Championship",
    map: "Bermuda",
    mode: "Squad",
    date: "2026-08-10",
    time: "07:00 PM",
    slot: "Evening",
    status: "Past",
    entry: 100,
    kill: 10,
    prize: 1500,
    joined: 12,
    capacity: 12,
  },
];


/* =========================================================
   TIME SLOTS
========================================================= */

const timeSlots = {
  All: "All Times",
  Morning: "6:00 AM – 12:00 PM",
  Afternoon: "12:00 PM – 4:00 PM",
  Evening: "4:00 PM – 8:00 PM",
  Night: "8:00 PM – 12:00 AM",
};


/* =========================================================
   MAIN PAGE
========================================================= */

export default function TournamentsPage() {

  /* -----------------------------
     GAMES FROM GOOGLE SHEET
  ----------------------------- */

  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState("");


  /* -----------------------------
     PAGE FILTER STATE
  ----------------------------- */

  const [selectedGame, setSelectedGame] = useState(null);

  const [status, setStatus] = useState("Upcoming");
  const [date, setDate] = useState("All");
  const [slot, setSlot] = useState("All");
  const [time, setTime] = useState("All");
  const [mode, setMode] = useState("All");
  const [map, setMap] = useState("All");


  /* =========================================================
     FETCH GAMES FROM GOOGLE SHEETS
  ========================================================= */

useEffect(() => {
  let cancelled = false;

  const CACHE_KEY = "play2prove_games_v1";

  function normalizeGames(data) {
    if (!Array.isArray(data)) return [];

    return data
      .filter((item) => {
        const publishValue = String(
          item.publish ?? ""
        )
          .trim()
          .toLowerCase();

        return (
          publishValue === "true" ||
          publishValue === "yes" ||
          publishValue === "1" ||
          item.publish === true
        );
      })
      .map((item, index) => {
        const gameName = String(
          item.gameName ?? ""
        ).trim();

        return {
          id:
            gameName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") ||
            `game-${index + 1}`,

          name: gameName || "GAME",

          image: String(
            item.image ?? ""
          ).trim(),

          status: String(
            item.status ?? "Upcoming"
          ).trim(),

          device: "MOBILE + PC",
        };
      })
      .filter((game) => game.name);
  }

  async function loadGames() {
    try {
      /* =====================================
         1. SHOW CACHED DATA IMMEDIATELY
      ===================================== */

      try {
        const cached =
          localStorage.getItem(CACHE_KEY);

        if (cached) {
          const cachedGames =
            JSON.parse(cached);

          if (
            Array.isArray(cachedGames) &&
            cachedGames.length > 0 &&
            !cancelled
          ) {
            setGames(cachedGames);
            setGamesLoading(false);
          }
        }
      } catch (cacheError) {
        console.log(
          "Cache read skipped"
        );
      }


      /* =====================================
         2. FETCH FRESH DATA IN BACKGROUND
      ===================================== */

      const response = await fetch(
        `${GAMES_API}?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Games API failed"
        );
      }

      const data =
        await response.json();

      const freshGames =
        normalizeGames(data);


      /* =====================================
         3. UPDATE SCREEN
      ===================================== */

      if (!cancelled) {

        setGames(freshGames);

        setGamesLoading(false);

        setGamesError("");

      }


      /* =====================================
         4. SAVE FOR NEXT VISIT
      ===================================== */

      try {

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify(freshGames)
        );

      } catch (cacheError) {

        console.log(
          "Cache save skipped"
        );

      }

    } catch (error) {

      console.error(
        "Games API Error:",
        error
      );


      /*
        Agar API fail bhi ho jaye,
        cached games already screen par
        rahenge.
      */

      if (!cancelled) {

        setGamesLoading(false);

        setGamesError("");

      }

    }
  }


  loadGames();


  return () => {
    cancelled = true;
  };

}, []);


  /* =========================================================
     SELECTED GAME
  ========================================================= */

  const selectedGameData = games.find(
    (game) => game.id === selectedGame
  );


  /* =========================================================
     AVAILABLE DATES
  ========================================================= */

  const dates = useMemo(() => {

    if (!selectedGame) return [];

    return [
      ...new Set(
        tournaments
          .filter(
            (t) => t.game === selectedGame
          )
          .map((t) => t.date)
      ),
    ];

  }, [selectedGame]);


  /* =========================================================
     AVAILABLE TIMES
  ========================================================= */

  const availableTimes = useMemo(() => {

    if (!selectedGame) return [];

    return [
      ...new Set(
        tournaments
          .filter(
            (t) => t.game === selectedGame
          )
          .map((t) => t.time)
      ),
    ];

  }, [selectedGame]);


  /* =========================================================
     AVAILABLE MAPS
  ========================================================= */

  const maps = useMemo(() => {

    if (!selectedGame) return [];

    return [
      ...new Set(
        tournaments
          .filter(
            (t) => t.game === selectedGame
          )
          .map((t) => t.map)
      ),
    ];

  }, [selectedGame]);


  /* =========================================================
     FILTER TOURNAMENTS
  ========================================================= */

  const filteredTournaments = useMemo(() => {

    if (!selectedGame) return [];

    return tournaments.filter((t) => {

      if (t.game !== selectedGame) {
        return false;
      }

      if (
        status !== "All" &&
        t.status !== status
      ) {
        return false;
      }

      if (
        date !== "All" &&
        t.date !== date
      ) {
        return false;
      }

      if (
        slot !== "All" &&
        t.slot !== slot
      ) {
        return false;
      }

      if (
        time !== "All" &&
        t.time !== time
      ) {
        return false;
      }

      if (
        mode !== "All" &&
        t.mode !== mode
      ) {
        return false;
      }

      if (
        map !== "All" &&
        t.map !== map
      ) {
        return false;
      }

      return true;

    });

  }, [
    selectedGame,
    status,
    date,
    slot,
    time,
    mode,
    map,
  ]);


  /* =========================================================
     SELECT GAME
  ========================================================= */

  function selectGame(gameId) {

    setSelectedGame(gameId);

    setStatus("Upcoming");
    setDate("All");
    setSlot("All");
    setTime("All");
    setMode("All");
    setMap("All");

  }


  /* =========================================================
     RESET FILTERS
  ========================================================= */

  function resetFilters() {

    setStatus("Upcoming");
    setDate("All");
    setSlot("All");
    setTime("All");
    setMode("All");
    setMap("All");

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <main className="tournamentPage">

      {/* BACKGROUND */}

      <div className="tpGlow tpOrange" />
      <div className="tpGlow tpBlue" />
      <div className="tpGrid" />


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="tpHeader">

        <button
          className="backButton"
          onClick={() => {

            if (selectedGame) {

              setSelectedGame(null);

            } else {

              window.location.href = "/";

            }

          }}
        >
          ←
        </button>


        <div className="tpTitle">

          <span>PLAY2PROVE</span>

          <strong>
            {selectedGameData
              ? selectedGameData.name
              : "TOURNAMENTS"}
          </strong>

        </div>


        <div className="tpRight">

          <button className="tpWallet">

            <small>WALLET</small>

            <strong>₹0</strong>

          </button>


          <button className="tpProfile">
            ◉
          </button>

        </div>

      </header>


      {/* =====================================================
          GAME SELECTION
      ===================================================== */}

      {!selectedGame ? (

        <section className="gameSelection">

          <div className="selectionIntro">

            <span>CHOOSE YOUR BATTLE</span>

            <h1>
              SELECT
              <em> GAME</em>
            </h1>

            <p>
              Choose a game to explore available tournaments.
            </p>

          </div>


          {/* LOADING */}

          {gamesLoading && (

            <div className="emptyState">

              <div className="loadingOrb">
                ✦
              </div>

              <h3>
                LOADING GAMES...
              </h3>

              <p>
                Fetching the latest games.
              </p>

            </div>

          )}


          {/* ERROR */}

          {!gamesLoading && gamesError && (

            <div className="emptyState">

              <div>
                ⚠
              </div>

              <h3>
                GAMES COULD NOT LOAD
              </h3>

              <p>
                {gamesError}
              </p>

              <button
                onClick={() => window.location.reload()}
              >
                RETRY
              </button>

            </div>

          )}


          {/* GAME CARDS */}

          {!gamesLoading &&
            !gamesError &&
            games.length > 0 && (

              <div className="gameCards">

                {games.map((game) => (

                  <button
                    className="gameSelectCard"
                    key={game.id}
                    onClick={() =>
                      selectGame(game.id)
                    }
                  >

                    {/* GAME NAME */}

                    <div className="gameCardName">
                      {game.name}
                    </div>


                    {/* ======================================
                        IMAGE AREA
                        FIXED 16:9
                    ====================================== */}

                    <div
                      className="gameImage"
                      style={{
                        aspectRatio: "16 / 9",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >

                      {game.image ? (

                        <img
  src={game.image}
  alt={game.name}
  loading="eager"
  decoding="async"
  fetchPriority="high"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
  }}
  onError={(e) => {
    e.currentTarget.style.display = "none";
  }}
/>

                      ) : null}


                      <div className="imageFallback">

                        {game.name
                          .toLowerCase()
                          .includes("free")
                          ? "🔥"
                          : "🎮"}

                      </div>


                      <div className="imageGlow" />

                    </div>


                    {/* CARD BOTTOM */}

                    <div className="gameCardBottom">

                      <span>
                        📱 {game.device}
                      </span>

                      <b>
                        ENTER ARENA →
                      </b>

                    </div>


                    {/* ACTUAL SHEET STATUS */}

                    <div className="gameStatusRow">

                      <span
                        className={`gameStatus status-${game.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        ● {game.status.toUpperCase()}
                      </span>

                    </div>

                  </button>

                ))}

              </div>

            )}


          {/* NO GAMES */}

          {!gamesLoading &&
            !gamesError &&
            games.length === 0 && (

              <div className="emptyState">

                <div>
                  🎮
                </div>

                <h3>
                  NO GAMES AVAILABLE
                </h3>

                <p>
                  Add a published game in your Google Sheet.
                </p>

              </div>

            )}

        </section>

      ) : (


        /* ===================================================
           SELECTED GAME TOURNAMENTS
        =================================================== */

        <section className="tournamentContent">


          {/* GAME BANNER */}

          <div className="gameBanner">

            <div>

              <span className="bannerEyebrow">
                TOURNAMENT ARENA
              </span>

              <h1>
                {selectedGameData.name}
              </h1>

              <p>
                Find your match. Enter the arena. Prove yourself.
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


          {/* STATUS */}

          <div className="statusTabs">

            {[
              "Upcoming",
              "Live",
              "Deciding",
              "Past",
            ].map((item) => (

              <button
                key={item}
                className={
                  status === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatus(item)
                }
              >

                {item === "Live" && "● "}

                {item}

              </button>

            ))}

          </div>


          {/* FILTER PANEL */}

          <div className="filterPanel">

            <div className="filterTitle">

              <div>

                <span>
                  FILTER MATCHES
                </span>

                <strong>
                  Find your perfect tournament
                </strong>

              </div>


              <button
                onClick={resetFilters}
              >
                RESET
              </button>

            </div>


            {/* DATE */}

            <div className="filterGroup">

              <label>
                DATE
              </label>

              <div className="filterScroll">

                <button
                  className={
                    date === "All"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setDate("All")
                  }
                >
                  ALL DATES
                </button>


                {dates.map((item) => (

                  <button
                    key={item}
                    className={
                      date === item
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setDate(item)
                    }
                  >
                    {formatDate(item)}
                  </button>

                ))}

              </div>

            </div>


            {/* TIME SLOT */}

            <div className="filterGroup">

              <label>
                TIME SLOT
              </label>

              <div className="slotGrid">

                {Object.entries(
                  timeSlots
                ).map(
                  ([key, value]) => (

                    <button
                      key={key}
                      className={
                        slot === key
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setSlot(key)
                      }
                    >

                      <strong>
                        {key}
                      </strong>

                      <small>
                        {value}
                      </small>

                    </button>

                  )
                )}

              </div>

            </div>


            {/* EXACT TIME */}

            <div className="filterGroup">

              <label>
                EXACT TIME
              </label>

              <div className="filterScroll">

                <button
                  className={
                    time === "All"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setTime("All")
                  }
                >
                  ALL TIMES
                </button>


                {availableTimes.map(
                  (item) => (

                    <button
                      key={item}
                      className={
                        time === item
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setTime(item)
                      }
                    >
                      {item}
                    </button>

                  )
                )}

              </div>

            </div>


            {/* MODE */}

            <div className="filterGroup">

              <label>
                MODE
              </label>

              <div className="smallFilterGrid">

                {[
                  "All",
                  "Solo",
                  "Duo",
                  "Squad",
                ].map((item) => (

                  <button
                    key={item}
                    className={
                      mode === item
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setMode(item)
                    }
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>


            {/* MAP */}

            <div className="filterGroup">

              <label>
                MAP
              </label>

              <div className="smallFilterGrid">

                <button
                  className={
                    map === "All"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setMap("All")
                  }
                >
                  ALL MAPS
                </button>


                {maps.map((item) => (

                  <button
                    key={item}
                    className={
                      map === item
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setMap(item)
                    }
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>

          </div>


          {/* RESULTS HEADER */}

          <div className="resultsHeader">

            <div>

              <span>
                AVAILABLE MATCHES
              </span>

              <strong>

                {filteredTournaments.length}

                {" "}

                TOURNAMENT
                {filteredTournaments.length !== 1
                  ? "S"
                  : ""}

              </strong>

            </div>


            <span>
              {status.toUpperCase()}
            </span>

          </div>


          {/* TOURNAMENT RESULTS */}

          {filteredTournaments.length > 0 ? (

            <div className="tournamentGrid">

              {filteredTournaments.map(
                (item) => (

                  <TournamentCard
                    key={item.id}
                    tournament={item}
                    game={selectedGameData}
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
                Try changing your filters
                to find available tournaments.
              </p>

              <button
                onClick={resetFilters}
              >
                CLEAR FILTERS
              </button>

            </div>

          )}

        </section>

      )}


      {/* BOTTOM NEON */}

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

  const percentage =
    (tournament.joined /
      tournament.capacity) *
    100;


  const statusClass =
    tournament.status.toLowerCase();


  return (

    <article
      className={`matchCard ${statusClass}`}
    >

      <div className="cardTop">

        <div>

          <span className="matchGame">
            {game?.name || "TOURNAMENT"}
          </span>

          <h3>
            {tournament.title}
          </h3>

        </div>


        <span className="matchStatus">

          {tournament.status === "Live" &&
            "● "}

          {tournament.status.toUpperCase()}

        </span>

      </div>


      <div className="matchDetails">

        <div>

          <small>
            DATE
          </small>

          <strong>
            {formatDate(
              tournament.date
            )}
          </strong>

        </div>


        <div>

          <small>
            TIME
          </small>

          <strong>
            {tournament.time}
          </strong>

        </div>


        <div>

          <small>
            MODE
          </small>

          <strong>
            {tournament.mode}
          </strong>

        </div>


        <div>

          <small>
            MAP
          </small>

          <strong>
            {tournament.map}
          </strong>

        </div>

      </div>


      <div className="rewardDetails">

        <div>

          <small>
            ENTRY
          </small>

          <strong>
            ₹{tournament.entry}
          </strong>

        </div>


        <div>

          <small>
            PER KILL
          </small>

          <strong>
            ₹{tournament.kill}
          </strong>

        </div>


        <div>

          <small>
            PRIZE POOL
          </small>

          <strong className="orangeText">
            ₹{tournament.prize}
          </strong>

        </div>

      </div>


      <div className="players">

        <div>

          <span>
            PLAYERS
          </span>

          <strong>
            {tournament.joined}/
            {tournament.capacity}
          </strong>

        </div>


        <div className="progressBar">

          <span
            style={{
              width: `${Math.min(
                percentage,
                100
              )}%`,
            }}
          />

        </div>

      </div>


      {tournament.status === "Past" ? (

        <button className="resultButton">
          VIEW RESULTS →
        </button>

      ) : tournament.status === "Live" ? (

        <button className="liveButton">
          VIEW LIVE MATCH →
        </button>

      ) : tournament.status === "Deciding" ? (

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
   DATE FORMAT
========================================================= */

function formatDate(date) {

  const d =
    new Date(`${date}T00:00:00`);

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );

}
