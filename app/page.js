"use client";

import { useState } from "react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");

  const goTo = (path, tab) => {
    setActiveTab(tab);
    window.location.href = path;
  };

  const games = [
    {
      name: "FREE FIRE",
      subtitle: "Battle Royale",
      status: "LIVE",
      active: true,
      code: "FF",
    },
    {
      name: "BGMI",
      subtitle: "Coming Soon",
      status: "SOON",
      active: false,
      code: "BG",
    },
    {
      name: "MORE GAMES",
      subtitle: "New games coming soon",
      status: "SOON",
      active: false,
      code: "+",
    },
  ];

  const tournaments = [
    {
      title: "Bermuda • Solo",
      type: "SOLO MATCH",
      time: "6:00 PM",
      entry: "₹30",
      kill: "₹5",
      prize: "₹500",
      joined: 37,
      total: 48,
    },
    {
      title: "Bermuda • Solo",
      type: "SOLO MATCH",
      time: "11:30 PM",
      entry: "₹30",
      kill: "₹5",
      prize: "₹500",
      joined: 21,
      total: 48,
    },
  ];

  return (
    <div className="p2p-home">

      <div className="ambient ambient-orange"></div>
      <div className="ambient ambient-purple"></div>
      <div className="screen-scan"></div>

      {/* HEADER */}
      <header className="home-header">

        <div className="brand">
          <div className="brand-logo">P2P</div>

          <div>
            <div className="brand-name">Play2Prove</div>
            <div className="brand-tagline">
              PLAY • COMPETE • EARN • PROVE
            </div>
          </div>
        </div>

        <div className="header-actions">

          <button
            className="wallet-mini"
            onClick={() => goTo("/wallet", "wallet")}
          >
            <span>WALLET</span>
            <strong>₹0</strong>
          </button>

          <button
            className="profile-mini"
            onClick={() => goTo("/profile", "profile")}
          >
            ♙
          </button>

        </div>

      </header>

      <main className="home-container">

        {/* HERO */}
        <section className="hero">

          <div className="hero-grid"></div>

          <div className="hero-content">

            <div className="hero-badge">
              <span></span>
              GAMING TOURNAMENT PLATFORM
            </div>

            <h1>
              PLAY.
              <br />
              COMPETE.
              <br />
              <em>PROVE.</em>
            </h1>

            <p>
              Join competitive gaming tournaments, show your
              skills and earn rewards.
            </p>

            <button
              className="primary-button"
              onClick={() => goTo("/tournaments", "tournaments")}
            >
              EXPLORE TOURNAMENTS
              <b>→</b>
            </button>

          </div>

          {/* GAMING VISUAL */}
          <div className="hero-visual">

            <div className="ring ring-one"></div>
            <div className="ring ring-two"></div>
            <div className="ring ring-three"></div>

            <div className="cross-line one"></div>
            <div className="cross-line two"></div>

            <div className="p2p-mark">P2P</div>

            <div className="ready">
              <i></i>
              READY TO PLAY
            </div>

          </div>

          <div className="neon-strip">
            <span></span>
          </div>

        </section>

        {/* GAMES */}
        <section className="section">

          <div className="section-heading">
            <div>
              <small>CHOOSE YOUR GAME</small>
              <h2>Games</h2>
            </div>

            <span>MORE COMING SOON</span>
          </div>

          <div className="games-grid">

            {games.map((game) => (

              <button
                key={game.name}
                className="game-card"
                onClick={() => {
                  if (game.active) {
                    goTo("/tournaments", "tournaments");
                  }
                }}
              >

                <div className="game-top">

                  <span className={game.active ? "live" : "soon"}>
                    {game.status}
                  </span>

                  <b>↗</b>

                </div>

                <div className="game-art">

                  <div className="art-grid"></div>

                  <div className="art-glow"></div>

                  <strong>{game.code}</strong>

                  <div className="laser laser-a"></div>
                  <div className="laser laser-b"></div>

                </div>

                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p>{game.subtitle}</p>
                </div>

              </button>

            ))}

          </div>

        </section>

        {/* UPCOMING TOURNAMENTS */}
        <section className="section">

          <div className="section-heading">
            <div>
              <small>PLAY NOW</small>
              <h2>Upcoming Tournaments</h2>
            </div>

            <button
              className="text-button"
              onClick={() => goTo("/tournaments", "tournaments")}
            >
              VIEW ALL →
            </button>
          </div>

          <div className="tournaments-grid">

            {tournaments.map((tournament, index) => {

              const progress =
                (tournament.joined / tournament.total) * 100;

              return (

                <article
                  className="tournament-card"
                  key={index}
                >

                  <div className="tournament-glow"></div>

                  <div className="tournament-head">

                    <div>
                      <small>FREE FIRE</small>
                      <h3>{tournament.title}</h3>
                      <p>{tournament.type}</p>
                    </div>

                    <span className="open">
                      <i></i>
                      OPEN
                    </span>

                  </div>

                  <div className="match-info">

                    <div>
                      <small>DATE</small>
                      <strong>TODAY</strong>
                    </div>

                    <div>
                      <small>START TIME</small>
                      <strong>{tournament.time}</strong>
                    </div>

                  </div>

                  <div className="reward-grid">

                    <div>
                      <small>ENTRY</small>
                      <strong>{tournament.entry}</strong>
                    </div>

                    <div>
                      <small>PER KILL</small>
                      <strong>{tournament.kill}</strong>
                    </div>

                    <div>
                      <small>PRIZE POOL</small>
                      <strong>{tournament.prize}</strong>
                    </div>

                  </div>

                  <div className="players">

                    <span>Players Joined</span>

                    <strong>
                      {tournament.joined}/{tournament.total}
                    </strong>

                  </div>

                  <div className="progress">
                    <span
                      style={{ width: `${progress}%` }}
                    ></span>
                  </div>

                  <button
                    className="join-button"
                    onClick={() =>
                      alert(
                        "Tournament join system will be connected next."
                      )
                    }
                  >
                    JOIN {tournament.entry}
                    <b>→</b>
                  </button>

                </article>

              );
            })}

          </div>

        </section>

        {/* TOURNAMENT OVERVIEW */}
        <section className="section">

          <div className="section-heading">
            <div>
              <small>KNOW BEFORE YOU JOIN</small>
              <h2>Tournament Overview</h2>
            </div>
          </div>

          <div className="overview-grid">

            <article className="overview-card featured">

              <strong className="number">01</strong>

              <small>UPCOMING MATCHES</small>

              <h3>Compete. Perform. Prove.</h3>

              <p>
                Choose your game, select an available tournament
                and enter the match. Tournament details, entry
                fee, prize pool and match timing are shown before
                you join.
              </p>

              <button
                onClick={() =>
                  goTo("/tournaments", "tournaments")
                }
              >
                VIEW TOURNAMENTS →
              </button>

            </article>

            <article className="overview-card">

              <strong className="number">02</strong>

              <small>MATCH DETAILS</small>

              <h3>Clear information</h3>

              <ul>
                <li>Entry fee</li>
                <li>Per-kill reward</li>
                <li>Prize pool</li>
                <li>Match timing</li>
                <li>Player capacity</li>
              </ul>

            </article>

            <article className="overview-card">

              <strong className="number">03</strong>

              <small>RESULTS & REWARDS</small>

              <h3>Play for the win</h3>

              <p>
                Results are processed according to tournament
                rules and eligible rewards are credited to the
                player's wallet.
              </p>

              <div className="reward-word">
                REWARDS
              </div>

            </article>

          </div>

        </section>

        {/* RULES */}
        <section className="section">

          <div className="section-heading">
            <div>
              <small>PLAY FAIR</small>
              <h2>Rules</h2>
            </div>
          </div>

          <div className="rules-grid">

            <article>
              <strong>01</strong>
              <div>
                <h3>One Player, One Entry</h3>
                <p>
                  Players must use their own registered account
                  and valid game details.
                </p>
              </div>
            </article>

            <article>
              <strong>02</strong>
              <div>
                <h3>Fair Play</h3>
                <p>
                  Cheating, hacking, exploiting or unfair
                  gameplay may result in disqualification.
                </p>
              </div>
            </article>

            <article>
              <strong>03</strong>
              <div>
                <h3>Correct Game Details</h3>
                <p>
                  Players are responsible for providing correct
                  in-game username and game information.
                </p>
              </div>
            </article>

            <article>
              <strong>04</strong>
              <div>
                <h3>Results</h3>
                <p>
                  Tournament results and rewards are processed
                  according to applicable tournament rules.
                </p>
              </div>
            </article>

          </div>

        </section>

        {/* TERMS */}
        <section className="section terms-section">

          <div className="terms-card">

            <div className="terms-icon">§</div>

            <div>
              <small>IMPORTANT INFORMATION</small>

              <h2>Terms & Conditions</h2>

              <p>
                By participating in Play2Prove tournaments,
                players agree to follow the platform rules,
                tournament-specific conditions and fair-play
                requirements.
              </p>

              <div className="terms-links">
                <button>Terms of Use →</button>
                <button>Privacy Policy →</button>
                <button>Responsible Play →</button>
              </div>

            </div>

            <strong className="terms-p2p">P2P</strong>

          </div>

        </section>

      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">

        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => goTo("/", "home")}
        >
          <span>⌂</span>
          HOME
        </button>

        <button
          className={activeTab === "tournaments" ? "active" : ""}
          onClick={() => goTo("/tournaments", "tournaments")}
        >
          <span>♛</span>
          TOURNAMENTS
        </button>

        <button
          className={activeTab === "matches" ? "active" : ""}
          onClick={() => goTo("/matches", "matches")}
        >
          <span>⚔</span>
          MATCHES
        </button>

        <button
          className={activeTab === "wallet" ? "active" : ""}
          onClick={() => goTo("/wallet", "wallet")}
        >
          <span>▣</span>
          WALLET
        </button>

        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => goTo("/profile", "profile")}
        >
          <span>♙</span>
          PROFILE
        </button>

      </nav>

    </div>
  );
}
