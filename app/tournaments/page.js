"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const GAMES_API =
  "https://script.google.com/macros/s/AKfycbx3vZuDmwpqykeX45oWhNffRqySbFQZ6a5ZukM3KEhB6B5e8I6rzWBmg8tsm_zUNz0/exec";

const CACHE_KEY = "play2prove_games_v2";

export default function TournamentsPage() {
  const router = useRouter();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const normalizeGames = (data) => {
      if (!Array.isArray(data)) return [];

      return data
        .filter((item) => {
          const publish = String(item.publish ?? "")
            .trim()
            .toLowerCase();

          return (
            publish === "true" ||
            publish === "yes" ||
            publish === "1"
          );
        })
        .map((item, index) => ({
          id:
            String(item.gameName ?? "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") ||
            `game-${index}`,

          name:
            String(item.gameName ?? "").trim() ||
            "Game",

          image:
            String(item.image ?? "").trim(),

          status:
            String(item.status ?? "Upcoming").trim(),
        }))
        .filter((game) => game.name);
    };

    async function loadGames() {
      // --------------------------------
      // 1. CACHE FIRST
      // --------------------------------
      try {
        const cached = localStorage.getItem(CACHE_KEY);

        if (cached) {
          const cachedGames = JSON.parse(cached);

          if (
            Array.isArray(cachedGames) &&
            cachedGames.length > 0 &&
            !cancelled
          ) {
            setGames(cachedGames);
            setLoading(false);
          }
        }
      } catch {
        // Ignore cache errors
      }

      // --------------------------------
      // 2. FRESH DATA
      // --------------------------------
      try {
        const response = await fetch(
          `${GAMES_API}?t=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Games API failed");
        }

        const data = await response.json();

        const freshGames = normalizeGames(data);

        if (!cancelled) {
          setGames(freshGames);
          setLoading(false);
        }

        // --------------------------------
        // 3. SAVE CACHE
        // --------------------------------
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify(freshGames)
          );
        } catch {
          // Ignore storage errors
        }
      } catch (error) {
        console.error("Games fetch error:", error);

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusClass = (status) => {
    const value = String(status)
      .toLowerCase()
      .trim();

    if (value === "live") return "status-live";

    if (value === "deciding") return "status-deciding";

    return "status-upcoming";
  };

  const getStatusLabel = (status) => {
    const value = String(status)
      .toLowerCase()
      .trim();

    if (value === "live") return "LIVE";

    if (value === "deciding") return "DECIDING";

    return "UPCOMING";
  };

  const handleGameClick = (game) => {
    router.push(
      `/tournaments/${encodeURIComponent(
        game.name.toLowerCase().replace(/\s+/g, "-")
      )}`
    );
  };

  return (
    <main className="tournament-page">

      {/* --------------------------------
          BACKGROUND GAMING EFFECT
      -------------------------------- */}
      <div className="gaming-bg">
        <div className="neon-orb neon-orange" />
        <div className="neon-orb neon-purple" />
        <div className="neon-orb neon-blue" />
      </div>

      {/* --------------------------------
          TOP BAR
      -------------------------------- */}
      <header className="tournament-header">

        <button
          className="back-button"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          ←
        </button>

        <div className="header-title">
          <span>PLAY2PROVE</span>
          <h1>TOURNAMENTS</h1>
        </div>

        <div className="header-spacer" />
      </header>


      {/* --------------------------------
          PAGE INTRO
      -------------------------------- */}
      <section className="tournament-intro">
        <div className="intro-eyebrow">
          CHOOSE YOUR GAME
        </div>

        <h2>
          Enter the <span>Arena.</span>
        </h2>

        <p>
          Pick your game and find tournaments
          that match your skill.
        </p>
      </section>


      {/* --------------------------------
          GAME GRID
      -------------------------------- */}
      <section className="games-section">

        {loading && games.length === 0 ? (
          <div className="games-skeleton">
            <div className="game-skeleton-card" />
            <div className="game-skeleton-card" />
          </div>
        ) : null}


        {!loading && games.length === 0 ? (
          <div className="empty-games">
            <div className="empty-icon">◈</div>
            <h3>No games available</h3>
            <p>
              New tournaments will appear here soon.
            </p>
          </div>
        ) : null}


        <div className="games-grid">

          {games.map((game) => (
            <article
              key={game.id}
              className="game-card"
              onClick={() => handleGameClick(game)}
            >

              {/* CARD TITLE */}
              <div className="game-card-title">
                <h3>{game.name}</h3>

                <span className="card-arrow">
                  ↗
                </span>
              </div>


              {/* IMAGE */}
              <div className="game-image-wrap">

                <img
                  src={game.image}
                  alt={`${game.name} tournament`}
                  className="game-image"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    event.currentTarget.parentElement.classList.add(
                      "image-failed"
                    );
                  }}
                />

                <div className="image-overlay" />

                <div className="image-scanline" />

                <div className="game-image-fallback">
                  <span>GAME IMAGE</span>
                </div>

              </div>


              {/* STATUS */}
              <div className="game-card-bottom">

                <span
                  className={`status-badge ${getStatusClass(
                    game.status
                  )}`}
                >
                  <span className="status-dot" />
                  {getStatusLabel(game.status)}
                </span>

              </div>

            </article>
          ))}

        </div>
      </section>

    </main>
  );
}
