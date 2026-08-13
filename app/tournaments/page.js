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
========================================================= */

/* =========================================================
   TIME SLOTS
========================================================= */

const timeSlots = {
  All: "All Times",
  Morning: "06:00 AM – 12:00 PM",
  Afternoon: "12:00 PM – 04:00 PM",
  Evening: "04:00 PM – 07:00 PM",
  Night: "07:00 PM – 06:00 AM",
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TournamentsPage() {
  /* -----------------------------
     GAMES FROM GOOGLE SHEET
  ----------------------------- */

  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
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
    const CACHE_KEY = "play2prove_tournament_api_v2";
    const CACHE_MAX_AGE = 60 * 1000;

    const slugify = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const isPublished = (value) => {
      const v = String(value ?? "").trim().toLowerCase();
      return value === true || ["true", "yes", "1", "published"].includes(v);
    };

    const normalizeGames = (data) => {
      const rows = Array.isArray(data) ? data : Array.isArray(data?.games) ? data.games : [];
      return rows.filter((item) => isPublished(item.publish)).map((item, index) => {
        const name = String(item.gameName ?? item.game ?? "").trim();
        return {
          id: slugify(name) || `game-${index + 1}`,
          name: name || "GAME",
          image: String(item.image ?? item.imageUrl ?? "").trim(),
          status: String(item.status ?? "Upcoming").trim(),
          device: String(item.device ?? "MOBILE + PC").trim(),
        };
      }).filter((game) => game.name);
    };

    const normalizeTournaments = (data) => {
      const rows = Array.isArray(data) ? data : Array.isArray(data?.tournaments) ? data.tournaments : [];
      return rows.filter((item) => item.publish === undefined || isPublished(item.publish)).map((item, index) => {
        const gameName = String(item.game ?? item.gameName ?? "").trim();
        const joined = Number(item.joined ?? item.playersJoined ?? item.players ?? 0) || 0;
        const capacity = Number(item.capacity ?? item.maxPlayers ?? item.slots ?? 0) || 0;
        return {
          id: item.id || `${slugify(gameName)}-${item.date || "date"}-${item.time || index}`,
          game: slugify(gameName),
          title: String(item.tournamentName ?? item.title ?? item.name ?? "Tournament").trim(),
          map: String(item.map ?? "").trim(),
          mode: String(item.mode ?? "").trim(),
          date: String(item.date ?? "").trim(),
          time: String(item.time ?? "").trim(),
          slot: String(item.slot ?? "").trim(),
          status: String(item.status ?? "Upcoming").trim(),
          entry: Number(item.entryFee ?? item.entry ?? 0) || 0,
          kill: Number(item.perKill ?? item.kill ?? 0) || 0,
          prize: Number(item.prizePool ?? item.prize ?? 0) || 0,
          joined,
          capacity,
          image: String(item.image ?? item.imageUrl ?? "").trim(),
          mapImage: String(item.mapImage ?? "").trim(),
        };
      });
    };

    const applyData = (data) => {
      const nextGames = normalizeGames(data);
      const nextTournaments = normalizeTournaments(data);
      if (!cancelled) {
        setGames(nextGames);
        setTournaments(nextTournaments);
        setGamesLoading(false);
        setTournamentsLoading(false);
        setGamesError("");
      }
      return { nextGames, nextTournaments };
    };

    async function loadData() {
      try {
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
          if (cached?.data && Date.now() - Number(cached.savedAt || 0) < CACHE_MAX_AGE) {
            applyData(cached.data);
          }
        } catch (_) {}

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(GAMES_API, {
          method: "GET",
          cache: "default",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timer);
        if (!response.ok) throw new Error(`API ${response.status}`);
        const data = await response.json();
        applyData(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
        } catch (_) {}
      } catch (error) {
        console.error("Tournament API Error:", error);
        if (!cancelled) {
          setGamesLoading(false);
          setTournamentsLoading(false);
          setGamesError(games.length ? "" : "Unable to load games right now.");
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
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
          .filter((t) => t.game === selectedGame)
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
          .filter((t) => t.game === selectedGame)
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
          .filter((t) => t.game === selectedGame)
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

      if (status !== "All" && t.status !== status) {
        return false;
      }

      if (date !== "All" && t.date !== date) {
        return false;
      }

      if (slot !== "All" && t.slot !== slot) {
        return false;
      }

      if (time !== "All" && t.time !== time) {
        return false;
      }

      if (mode !== "All" && t.mode !== mode) {
        return false;
      }

      if (map !== "All" && t.map !== map) {
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

              <h3>LOADING GAMES...</h3>

              <p>
                Fetching the latest games.
              </p>
            </div>
          )}

          {/* ERROR */}

          {!gamesLoading && gamesError && (
            <div className="emptyState">
              <div>⚠</div>

              <h3>
                GAMES COULD NOT LOAD
              </h3>

              <p>{gamesError}</p>

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

          {!gamesLoading &&
            !gamesError &&
            games.length > 0 && (
              <div className="gameCards">
                {games.map((game, gameIndex) => (
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

                    {/* IMAGE AREA */}

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
                          loading={gameIndex < 2 ? "eager" : "lazy"}
                          decoding="async"
                          fetchPriority={gameIndex === 0 ? "high" : "auto"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                            display: "block",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
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

                    {/* STATUS */}

                    <div className="gameStatusRow">
                      <span
                        className={`gameStatus ${
                          game.status
                            .toLowerCase() === "live"
                            ? "statusLive"
                            : game.status
                                .toLowerCase() ===
                              "deciding"
                            ? "statusDeciding"
                            : "statusUpcoming"
                        }`}
                      >
                        ●{" "}
                        {game.status.toUpperCase()}
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
                <div>🎮</div>

                <h3>
                  NO GAMES AVAILABLE
                </h3>

                <p>
                  Add a published game in your
                  Google Sheet.
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
                Find your match. Enter the arena.
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
                  Find your perfect
                  tournament
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
              <label>DATE</label>

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
              <label>TIME SLOT</label>

              <div className="slotGrid">
                {Object.entries(
                  timeSlots
                ).map(([key, value]) => (
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
                ))}
              </div>
            </div>

            {/* EXACT TIME */}

            <div className="filterGroup">
              <label>EXACT TIME</label>

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
              <label>MODE</label>

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
              <label>MAP</label>

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
                {filteredTournaments.length}{" "}
                TOURNAMENT
                {filteredTournaments.length !==
                1
                  ? "S"
                  : ""}
              </strong>
            </div>

            <span>
              {status.toUpperCase()}
            </span>
          </div>

          {/* TOURNAMENT RESULTS */}

          {tournamentsLoading ? (
            <div className="tournamentLoading">
              <div className="loadingSpinner" />
              <strong>SYNCING ARENA</strong>
              <span>Fetching the latest tournament slots…</span>
            </div>
          ) : filteredTournaments.length > 0 ? (
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
              <div>⌁</div>

              <h3>
                NO MATCHES FOUND
              </h3>

              <p>
                Try changing your filters
                to find available
                tournaments.
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
  const percentage = tournament.capacity > 0
    ? (tournament.joined / tournament.capacity) * 100
    : 0;

  const statusClass =
    tournament.status.toLowerCase() ===
    "live"
      ? "live"
      : tournament.status.toLowerCase() ===
        "deciding"
      ? "deciding"
      : tournament.status.toLowerCase() ===
        "past"
      ? "past"
      : "";

  return (
    <article
      className={`matchCard ${statusClass}`}
    >
      {tournament.image && (
        <div className="matchImageWrap">
          <img
            src={tournament.image}
            alt={tournament.title}
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
          />
          <div className="matchImageShade" />
        </div>
      )}

      <div className="cardTop">
        <div>
          <span className="matchGame">
            {game?.name ||
              "TOURNAMENT"}
          </span>

          <h3>
            {tournament.title}
          </h3>
        </div>

        <span className="matchStatus">
          {tournament.status ===
            "Live" && "● "}

          {tournament.status.toUpperCase()}
        </span>
      </div>

      <div className="matchDetails">
        <div>
          <small>DATE</small>

          <strong>
            {formatDate(
              tournament.date
            )}
          </strong>
        </div>

        <div>
          <small>TIME</small>

          <strong>
            {tournament.time}
          </strong>
        </div>

        <div>
          <small>MODE</small>

          <strong>
            {tournament.mode}
          </strong>
        </div>

        <div>
          <small>MAP</small>

          <strong>
            {tournament.map}
          </strong>
        </div>
      </div>

      <div className="rewardDetails">
        <div>
          <small>ENTRY</small>

          <strong>
            ₹{tournament.entry}
          </strong>
        </div>

        <div>
          <small>PER KILL</small>

          <strong>
            ₹{tournament.kill}
          </strong>
        </div>

        <div>
          <small>PRIZE POOL</small>

          <strong className="orangeText">
            ₹{tournament.prize}
          </strong>
        </div>
      </div>

      <div className="players">
        <div>
          <span>PLAYERS</span>

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

      {tournament.status ===
      "Past" ? (
        <button className="resultButton">
          VIEW RESULTS →
        </button>
      ) : tournament.status ===
        "Live" ? (
        <button className="liveButton">
          VIEW LIVE MATCH →
        </button>
      ) : tournament.status ===
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
