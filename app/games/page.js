"use client";

import { useEffect, useState } from "react";
import "./games.css";

/* =========================================================
   PLAY2PROVE — GAMES PAGE
   Same API source as Tournament Page
========================================================= */

const API_URL = "/api/tournaments";

function clean(value) {
  return String(value ?? "").trim();
}

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

/* =========================================================
   NORMALIZE GAME
   Same logic used by Tournament Page
========================================================= */

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
      clean(row?.status) ||
      "Upcoming",

    publish:
      row?.publish === undefined
        ? true
        : isTrue(row?.publish),

    device:
      clean(row?.device) ||
      "MOBILE + PC",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function GamesPage() {

  const [games, setGames] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD GAMES
  ======================================================= */

  useEffect(() => {

    let cancelled = false;

    async function loadGames() {

      try {

        const response =
          await fetch(
            API_URL,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },

              cache:
                "default",

              redirect:
                "follow",
            }
          );

        if (!response.ok) {

          throw new Error(
            `API ${response.status}`
          );

        }

        const data =
          await response.json();

        if (
          !data ||
          data.success === false
        ) {

          throw new Error(
            "Invalid API response"
          );

        }

        const gameRows =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.games
              )
              ? data.games
              : [];

        const nextGames =
          gameRows
            .map(
              normalizeGame
            )
            .filter(
              (game) =>
                game.name &&
                game.publish
            );

        if (
          !cancelled
        ) {

          setGames(
            nextGames
          );

          setError("");

          setLoading(
            false
          );

        }

      } catch (err) {

        console.error(
          "PLAY2PROVE GAMES PAGE:",
          err
        );

        if (
          !cancelled
        ) {

          setGames([]);

          setError(
            "Unable to load games right now."
          );

          setLoading(
            false
          );

        }

      }

    }

    loadGames();

    return () => {

      cancelled = true;

    };

  }, []);

  /* =======================================================
     OPEN GAME
  ======================================================= */

  function openGame(gameId) {

    if (!gameId) {
      return;
    }

    window.location.href =
      `/tournaments?game=${encodeURIComponent(
        gameId
      )}`;

  }

  /* =======================================================
     HOME
  ======================================================= */

  function goHome() {

    window.location.href =
      "/";

  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <main className="gamesPage">

      {/* =================================================
          TOP NEON
      ================================================= */}

      <div className="gamesNeonTop" />


      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="gamesBgGlow gamesOrange" />

      <div className="gamesBgGlow gamesPurple" />

      <div className="gamesGridPattern" />


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="gamesHeader">

        <div className="gamesHeaderInner">

          <button
            className="gamesBackButton"
            onClick={goHome}
            type="button"
          >
            <span>
              ←
            </span>

            <strong>
              HOME
            </strong>
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="gamesContent">

        {/* ===============================================
            INTRO
        =============================================== */}

        <div className="gamesIntro">

          <div className="gamesIntroLine" />

          <span>
            YOUR BATTLEFIELD
          </span>

          <h1>
            CHOOSE
            <em> YOUR GAME</em>
          </h1>

          <p>
            Pick your game and enter
            its tournament arena.
          </p>

        </div>


        {/* ===============================================
            LOADING
        =============================================== */}

        {loading && (

          <div className="gamesState">

            <div className="gamesSpinner" />

            <strong>
              LOADING GAMES
            </strong>

            <span>
              Syncing the arena...
            </span>

          </div>

        )}


        {/* ===============================================
            ERROR
        =============================================== */}

        {!loading &&
          error && (

            <div className="gamesState gamesError">

              <div className="gamesStateIcon">
                ⚠
              </div>

              <strong>
                GAMES COULD NOT LOAD
              </strong>

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                RETRY
              </button>

            </div>

          )}


        {/* ===============================================
            GAME CARDS
        =============================================== */}

        {!loading &&
          !error &&
          games.length > 0 && (

            <div className="gamesCards">

              {games.map(
                (
                  game,
                  index
                ) => (

                  <button
                    type="button"
                    key={game.id}
                    className="gamesCard"
                    onClick={() =>
                      openGame(
                        game.id
                      )
                    }
                  >

                    {/* GAME TITLE */}

                    <div className="gamesCardTop">

                      <strong>
                        {game.name}
                      </strong>

                      <span>
                        ENTER ARENA →
                      </span>

                    </div>


                    {/* GAME IMAGE */}

                    <div className="gamesCardImage">

                      {game.image ? (

                        <img
                          src={game.image}
                          alt={game.name}
                          loading={
                            index < 2
                              ? "eager"
                              : "lazy"
                          }
                          fetchPriority={
                            index === 0
                              ? "high"
                              : "auto"
                          }
                          decoding="async"
                          onError={(
                            event
                          ) => {

                            event.currentTarget.style.display =
                              "none";

                          }}
                        />

                      ) : null}


                      {!game.image && (

                        <div className="gamesImageFallback">
                          🎮
                        </div>

                      )}

                      <div className="gamesImageShade" />

                      <div className="gamesImageGlow" />

                    </div>


                    {/* CARD FOOTER */}

                    <div className="gamesCardBottom">

  <span>
    {game.device}
  </span>

  <b className="gamesStatusBadge">
    {String(
      game.status
    ).toUpperCase()}
  </b>

</div>

                  </button>

                )
              )}

            </div>

          )}


        {/* ===============================================
            NO GAMES
        =============================================== */}

        {!loading &&
          !error &&
          games.length === 0 && (

            <div className="gamesState">

              <div className="gamesStateIcon">
                🎮
              </div>

              <strong>
                NO GAMES AVAILABLE
              </strong>

              <span>
                New games will appear here
                when they are published.
              </span>

            </div>

          )}

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="gamesFooter">

        <span>
          PLAY2PROVE
        </span>

        <strong>
          COMPETE. PROVE. EARN.
        </strong>

      </footer>

    </main>

  );

}
